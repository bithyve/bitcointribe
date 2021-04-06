import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../../../common/Colors'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import { TouchableOpacity } from '@gorhom/bottom-sheet'


export type Props = {
  onTryAgainPressed: () => void;
};

const TorConnectionFailureBottomSheet: React.FC<Props> = ({ onTryAgainPressed, }: Props) => {
  return (
    <View style={styles.rootContainer}>

      <View style={styles.mainContentContainer}>

        <View style={styles.headerSection}>
          <Text style={BottomSheetStyles.confirmationMessageHeading}>
            Not able to connect to Tor
          </Text>
        </View>

        <View style={styles.messageBodySection}>
          <Text style={{
            ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
          }}>
            Please check your network connection and try again
          </Text>

          <Text style={ListStyles.infoHeaderSubtitleText}>
            You may also switch back to a plainnet connection
          </Text>
        </View>


        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            onPress={onTryAgainPressed}
            style={ButtonStyles.primaryActionButton}
          >
            <Text style={ButtonStyles.actionButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  mainContentContainer: {
    padding: 30,
    paddingBottom: 40,
    flex: 1,
    justifyContent: 'space-between',
  },

  headerSection: {
    marginBottom: 30,
    width: '80%',
  },

  messageBodySection: {
    marginBottom: 22,
    width: '80%',
  },

  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
})

export default TorConnectionFailureBottomSheet
