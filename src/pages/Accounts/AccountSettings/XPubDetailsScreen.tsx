import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import QRCode from '../../../components/QRCode'
import { heightPercentageToDP } from 'react-native-responsive-screen'
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



  return (
    <View style={styles.rootContainer}>
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
                <QRCode title={title} value={item.xpub} size={heightPercentageToDP( 33 )} />
              </View>

              <CopyThisText text={item.xpub} />
            </View>
          )
        }}
        keyExtractor={ item => item}
      />

      <View
        style={{
          marginBottom: heightPercentageToDP( 5 )
        }}
      >
        <BottomInfoBox
          title={'Note'}
          infoText={
            'This xPub is for this particular account only and not for the whole wallet. Each account has its own xPub'
          }
        />
      </View>
    </View>
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
    paddingHorizontal: heightPercentageToDP( 10 ),
  }
} )



XPubDetailsScreen.navigationOptions = ( { navigation } ): NavigationOptions => {
  const primarySubAccountName = navigation.getParam( 'primarySubAccountName' )

  return {
    ...defaultStackScreenNavigationOptions,

    title: `${primarySubAccountName} xPub`,
  }
}


export default XPubDetailsScreen
