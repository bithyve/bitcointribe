import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import QRCode from '../../../components/QRCode'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import BottomInfoBox from '../../../components/BottomInfoBox'
import CopyThisText from '../../../components/CopyThisText'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions, { NavigationOptions } from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import useXPubForSubAccount from '../../../utils/hooks/state-selectors/accounts/UseXPubForSubAccount'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import { Account, MultiSigAccount } from '../../../bitcoin/utilities/Interface'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import ModalContainer from '../../../components/home/ModalContainerScroll'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../../common/Colors'
import ListStyles from '../../../common/Styles/ListStyles'


enum XpubTypes {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  BITHYVE = 'BITHYVE'
}

export type Props = {
  navigation: any;
};

const XPubDetailsScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const accountShell = useAccountShellFromNavigation( navigation )
  const account: Account | MultiSigAccount = useAccountByAccountShell( accountShell )
  const [ xpubs, setXpubs ] = useState( [] )
  const [ noOfTaps, setNoOfTaps ] = useState( 0 )
  const [ showModal, setShowModal ] = useState( false )

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
  }, [ account ] )

  useEffect( () => {
    if( noOfTaps!=0 ){
      setTimeout( () => {
        setNoOfTaps( 0 )
      }, 1000 )
    }
    if( noOfTaps>=3 ){
      setShowModal( true )
    }
  }, [ noOfTaps ] )

  const closeBottomSheet = () => {
    setShowModal( false )
  }
  const KeyValueData = () => {
    return (
      <View style={styles.lineItem}>
        <Text style={ListStyles.listItemTitleTransaction}>
              Title
        </Text>
        <Text
          style={{
            ...ListStyles.listItemSubtitle,
            marginBottom: 3,
          }}
        >
              data
        </Text>
      </View>
    )
  }
  const RenderModal = () => {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.crossIconContainer}>
          <FontAwesome name="close" color={Colors.blue} size={24} onPress = {closeBottomSheet}/>
        </View>
        <ScrollView>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
        </ScrollView>
      </View>
    )
  }
  return (
    <>
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
      <ModalContainer onBackground={closeBottomSheet} visible={showModal} closeBottomSheet = {closeBottomSheet}>
        <View style={styles.modalContainer}>
          <RenderModal/>
        </View>
      </ModalContainer>
    </>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  headerSectionContainer: {
    paddingHorizontal: 12,
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



XPubDetailsScreen.navigationOptions = ( { navigation } ): NavigationOptions => {
  const primarySubAccountName = navigation.getParam( 'primarySubAccountName' )

  return {
    ...defaultStackScreenNavigationOptions,

    title: `${primarySubAccountName} xPub`,
  }
}


export default XPubDetailsScreen
