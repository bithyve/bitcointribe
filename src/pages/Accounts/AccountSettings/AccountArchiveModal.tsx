import React, {  } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../../../common/Colors'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'

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
  return (
    <View style={styles.rootContainer}>

      <View style={styles.mainContentContainer}>
        <Text style={BottomSheetStyles.confirmationMessageHeading}>
          {isError ? `Error Archiving${'\n'}${account.customDisplayName ? account.customDisplayName : account.defaultTitle}` : `Archive${'\n'}${account.customDisplayName ? account.customDisplayName : account.defaultTitle}`}
        </Text>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {isError ? 'An account should be empty before it can be archived' : 'You can acrchive an unused account from the home screen'}
        </Text>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
            Please ensure that account is empty before archiving
        </Text>
      </View>
      <View style={styles.footerSectionContainer}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            onPress={isError ? onViewAccount : onProceed}
            style={ButtonStyles.primaryActionButton}
          >
            <Text style={ButtonStyles.actionButtonText}>{isError ? 'View Account' : 'Continue'}</Text>
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
                Back
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
    height: '100%',
    backgroundColor: Colors.white,
  },

  mainContentContainer: {
    padding: 30,
    paddingBottom: 20,
  },

  footerSectionContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
  },

  actionButtonContainer: {
    marginLeft: 20,
    flexDirection: 'row',
    marginTop: 'auto',
    justifyContent:'center',
    marginBottom: 30
  },
  errorImage: {
    width: wp( '31%' ),
    height: wp( '38%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
  },
} )

export default AccountArchiveBottomSheet
