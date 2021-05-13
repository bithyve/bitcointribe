import React, {  } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { TouchableOpacity } from '@gorhom/bottom-sheet'

export type Props = {
	isError: boolean;
  onProceed: () => void;
	onBack: () => void;
	onViewAccount: () => void;
};


const AccountCheckingBottomSheet: React.FC<Props> = ( {
  onProceed,
	onBack,
	onViewAccount,
	isError
}: Props ) => {
  return (
    <View style={styles.rootContainer}>

      <View style={styles.mainContentContainer}>
        <Text style={BottomSheetStyles.confirmationMessageHeading}>
          {isError ? `Error Archiving${'\n'}Checking Account` : `Archive${'\n'}Checking Account`}
        </Text>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {isError ? `An account should be empty before it can be archived` : `You can acrchive an unused account from the home screen`}
        </Text>
				<Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
            Please ensure that account is empty before archiving
        </Text>
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
                marginRight: 8,
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

        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  mainContentContainer: {
    padding: 30,
    paddingBottom: 40,
    flex: 1,
  },

  footerSectionContainer: {
    marginTop: 'auto',
  },

  actionButtonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
} )

export default AccountCheckingBottomSheet
