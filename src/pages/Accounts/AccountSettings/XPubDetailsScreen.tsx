import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
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


export type Props = {
  navigation: any;
};

const XPubDetailsScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const accountShell = useAccountShellFromNavigation( navigation )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )

  const xPub = useXPubForSubAccount( primarySubAccount ) || 'No xPub Found'

  return (
    <View style={styles.rootContainer}>
      <View style={styles.headerSectionContainer}>
        <Text style={HeadingStyles.sectionSubHeadingText}>
          xPub details for this account.
        </Text>
      </View>

      <View>
        <View style={styles.qrCodeContainer}>
          <QRCode value={xPub} size={heightPercentageToDP( 33 )} />
        </View>

        <CopyThisText text={xPub} />
      </View>

      <View
        style={{
          marginBottom: heightPercentageToDP( 5 )
        }}
      >
        <BottomInfoBox
          title={'Note'}
          infoText={
            'The QR code is your xPub address.'
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

    headerLeft: () => {
      return <SmallNavHeaderBackButton onPress={navigation.goBack} />
    },
  }
}


export default XPubDetailsScreen
