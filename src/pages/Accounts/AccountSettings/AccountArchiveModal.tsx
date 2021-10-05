import React, {  } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import Colors from '../../../common/Colors'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { translations } from '../../../common/content/LocContext'

export type Props = {
	isError: boolean;
  onProceed: () => void;
	onBack: () => void;
  onViewAccount: () => void;
  account: any;
};


const AccountArchiveBottomSheet: React.FC<Props> = ( {
  onProceed,
  onBack,
  onViewAccount,
  isError,
  account
}: Props ) => {
  const common  = translations[ 'common' ]
  const strings  = translations[ 'accounts' ]
  return (
    <View style={styles.rootContainer}>

      <View style={styles.mainContentContainer}>
        <Text style={BottomSheetStyles.confirmationMessageHeading}>
          {isError ? `${strings.ErrorArchiving}${'\n'}${account.customDisplayName ? account.customDisplayName : account.defaultTitle}` : `${strings.Archive}${'\n'}${account.customDisplayName ? account.customDisplayName : account.defaultTitle}`}
        </Text>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {isError ? strings.Accountshouldbeempty : strings.archiveunusedaccount}
        </Text>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {strings.accountisempty}
        </Text>
      </View>
      <View style={styles.footerSectionContainer}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            onPress={isError ? onViewAccount : onProceed}
            style={ButtonStyles.primaryActionButton}
          >
            <Text style={ButtonStyles.actionButtonText}>{isError ? strings.ViewAccount : common.continue}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBack}
            style={{
              ...ButtonStyles.primaryActionButton,
              backgroundColor: 'transparent',
            }}
          >
            <Text style={{
              ...ButtonStyles.actionButtonText,
              color: Colors.blue,
            }}>
              {common.back}
            </Text>
          </TouchableOpacity>

        </View>
        <Image
          source={require( '../../../assets/images/icons/errorImage.png' )
          }
          style={styles.errorImage}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    // height: '100%',
    backgroundColor: Colors.white,
  },

  mainContentContainer: {
    padding: wp( '6%' ),
    paddingBottom: 20,
  },

  footerSectionContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    // backgroundColor: 'red'
  },

  actionButtonContainer: {
    marginLeft: wp( '6%' ),
    flexDirection: 'row',
    marginTop: 'auto',
    justifyContent:'center',
    marginBottom: hp( '2%' )
  },
  errorImage: {
    width: wp( '31%' ),
    height: wp( '38%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
  },
} )

export default AccountArchiveBottomSheet
