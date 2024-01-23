import _ from 'lodash'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RootStateOrAny, useSelector } from 'react-redux'
import AccountOperations from '../../../bitcoin/utilities/accounts/AccountOperations'
import AccountUtilities from '../../../bitcoin/utilities/accounts/AccountUtilities'
import { Account, AccountType, MultiSigAccount, NetworkType, Wallet } from '../../../bitcoin/utilities/Interface'
import Colors from '../../../common/Colors'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import BottomInfoBox from '../../../components/BottomInfoBox'
import CopyThisText from '../../../components/CopyThisText'
import HeaderTitle from '../../../components/HeaderTitle'
import ModalContainer from '../../../components/home/ModalContainerScroll'
import QRCode from '../../../components/QRCode'
import defaultStackScreenNavigationOptions from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import useAccountShellFromRoute from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'

enum XpubTypes {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  BITHYVE = 'BITHYVE'
}

export type Props = {
  route: any;
  navigation: any;
};

const XPubDetailsScreen: React.FC<Props> = ( { route, navigation }: Props ) => {
  const accountShell = useAccountShellFromRoute( route )
  useLayoutEffect( () => {
    const primarySubAccountName = route.params?.primarySubAccountName
    navigation.setOptions( {
      ...defaultStackScreenNavigationOptions,
      title: `${primarySubAccountName} xPub`
    } )
  }, [ navigation, route ] )
  const account: Account | MultiSigAccount = useAccountByAccountShell( accountShell )
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const [ xpubs, setXpubs ] = useState( [] )
  const [ debugAccount, setDebugAccount ] = useState( null )
  const [ debugAccountBalance, setDebugAccountBalance ] = useState( 0 )
  const [ debugXpubs, setDebugXpubs ] = useState( [] )

  const [ noOfTaps, setNoOfTaps ] = useState( 0 )
  const [ debugModal, setDebugModal ] = useState( false )
  const [ debugSpinner, setDebugSpinner ] = useState( false )

  useEffect( () => {
    const debugAccount: Account = _.cloneDeep( account )
    debugAccount.activeAddresses = {
      external: {
      },
      internal: {
      }
    }
    debugAccount.importedAddresses = {
    }
    setDebugAccount( debugAccount )
  }, [ account ] )

  useEffect( () => {
    const availableXpubs = []
    const primaryXpub = account.xpub
    availableXpubs.push( {
      xpub: primaryXpub,
      type: XpubTypes.PRIMARY
    } )

    if( ( account as MultiSigAccount ).is2FA ){
      const  { secondary, bithyve } = ( account as MultiSigAccount ).xpubs
      availableXpubs.push( {
        xpub: secondary,
        type: XpubTypes.SECONDARY
      } )
      availableXpubs.push( {
        xpub: bithyve,
        type: XpubTypes.BITHYVE
      } )
    }

    setXpubs( availableXpubs )
    setDebugXpubs( availableXpubs )
  }, [ account ] )

  const nextDebugPrimaryXpub = () => {
    const nextInstanceNumber = ( debugAccount as Account ).instanceNum + 1
    const debug = true
    const derivationPathNetwork = debugAccount.type === AccountType.TEST_ACCOUNT? NetworkType.TESTNET: NetworkType.MAINNET
    const derivationPath = AccountUtilities.getDerivationPath( derivationPathNetwork, ( debugAccount as Account ).type,  nextInstanceNumber, debug )
    const network = AccountUtilities.getNetworkByType( debugAccount.networkType )
    const { xpub } = AccountUtilities.generateExtendedKeyPairFromSeed( wallet.primarySeed, network, derivationPath )
    debugAccount.xpub = xpub
    debugAccount.derivationPath = derivationPath
    debugAccount.instanceNum = nextInstanceNumber
    setDebugAccount( {
      ...debugAccount
    } )

    debugXpubs.forEach( xpubInfo => {
      if( xpubInfo.type === XpubTypes.PRIMARY ) xpubInfo.xpub = xpub
    } )
    setDebugXpubs( [
      ...debugXpubs
    ]
    )
  }

  const initiateDebugBalanceCheck = async () => {
    if( !debugAccount ) return

    setDebugSpinner( true )
    const debugAccountsToSync = {
      [ debugAccount.id ]: debugAccount
    }
    const network =  AccountUtilities.getNetworkByType( debugAccount.networkType )
    const hardRefresh = true
    const { synchedAccounts } = await AccountOperations.syncAccounts( debugAccountsToSync, network, hardRefresh )
    const synchedAccount = synchedAccounts[ account.id ]
    setDebugAccountBalance( synchedAccount.balances.confirmed + synchedAccount.balances.unconfirmed )
    setDebugSpinner( false )
  }

  const ShowDebugXpubData = ( ) => {
    return (
      <View style={styles.lineItem}>
        <View style={{
          marginTop: hp( 3 ),
          marginBottom: hp( 3 )
        }}>
          <Text style={HeadingStyles.sectionSubHeadingText}>
          Xpub Detail
          </Text>
        </View>

        {debugXpubs.map( xpubInfo => {
          return (
            <View key={xpubInfo.xpub}>
              <Text style={HeadingStyles.sectionSubHeadingText}>
                {xpubInfo.type.toLowerCase()}
              </Text>
              {xpubInfo.type === XpubTypes.PRIMARY?
                <TouchableOpacity onPress={nextDebugPrimaryXpub}>
                  <Text>Next</Text>
                </TouchableOpacity>
                : null}
              <CopyThisText text={xpubInfo.xpub} />
            </View>
          )
        } )}
        <Text>{ debugSpinner? <ActivityIndicator/>:  debugAccountBalance}</Text>
        <TouchableOpacity style={{
          marginVertical: hp( 3 )
        }} onPress={initiateDebugBalanceCheck}>
          <Text>Check balance</Text>
        </TouchableOpacity>
      </View>
    )
  }

  useEffect( () => {
    if( noOfTaps!=0 ){
      setTimeout( () => {
        setNoOfTaps( 0 )
      }, 1000 )
    }
    if( noOfTaps>=3 ){
      setDebugModal( true )
    }
  }, [ noOfTaps ] )

  const closeBottomSheet = () => {
    setDebugModal( false )
  }

  const RenderDebugModal = () => {

    return (
      <View style={styles.modalContainer}>
        <View style={styles.crossIconContainer}>
          <FontAwesome name="close" color={Colors.blue} size={24} onPress = {closeBottomSheet}/>
        </View>
        <ScrollView>
          <ShowDebugXpubData/>
        </ScrollView>
      </View>
    )
  }

  return (
    <SafeAreaView style={{
      flex: 1,
    }}>
      <HeaderTitle
        navigation={navigation}
        backButton={true}
        firstLineTitle={`${debugAccount && debugAccount.accountName } xPub`}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View style={styles.rootContainer} >
        <View style={styles.headerSectionContainer}>
          <Text style={HeadingStyles.sectionSubHeadingText}>
          xPub details for this account
          </Text>
        </View>

        <FlatList
          data={xpubs}
          renderItem={( { item } ) => {
            let title
            switch( item.type ){
                case XpubTypes.PRIMARY:
                  title = 'xPub'
                  break

                case XpubTypes.SECONDARY:
                  title = 'secondary xPub'
                  break

                case XpubTypes.BITHYVE:
                  title = 'bithyve xPub'
                  break
            }

            return (
              <View>
                <View style={styles.qrCodeContainer}>
                  <QRCode title={title} value={item.xpub} size={hp( 33 )} />
                </View>

                <CopyThisText text={item.xpub} />
              </View>
            )
          }}
          keyExtractor={ item => item}
        />

        <TouchableOpacity
          style={{
            marginBottom: hp( 5 )
          }}
          activeOpacity = {1}
          onPress={()=>{setNoOfTaps( noOfTaps+1 )}}
        >
          <BottomInfoBox
            title={'Note'}
            infoText={
              'This xPub is for this particular account only and not for the whole wallet. Each account has its own xPub'
            }
          />
        </TouchableOpacity>
      </View>
      <ModalContainer onBackground={closeBottomSheet} visible={debugModal} closeBottomSheet = {closeBottomSheet}>
        <View style={styles.modalContainer}>
          <RenderDebugModal/>
        </View>
      </ModalContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  headerSectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 36,
  },

  qrCodeContainer: {
    alignItems: 'center',
    paddingHorizontal: hp( 10 ),
  },
  modalContainer:{
    backgroundColor:Colors.backgroundColor,
    padding:5,
    height:hp( '85%' )
  },
  crossIconContainer:{
    justifyContent:'flex-end',
    flexDirection:'row',
    marginBottom:hp( 2 ),
  },

  lineItem: {
    marginVertical: hp( 0.9 ),
    backgroundColor:Colors.white,
    padding: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 3,
    },
    shadowOpacity: 0.10,
    shadowRadius: 1.84,

    elevation: 2,
  },
} )

export default XPubDetailsScreen
