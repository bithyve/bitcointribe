import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../../../common/Colors'
import ListStyles from '../../../common/Styles/ListStyles'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ButtonBlue from '../../ButtonBlue'


export type Props = {
  onTryAgainPressed: () => void;
};

const PersonalNodeConnectionFailureBottomSheet: React.FC<Props> = ( { onTryAgainPressed, }: Props ) => {
  return (
    <View style={styles.rootContainer}>

      <View style={styles.mainContentContainer}>

        <View style={styles.headerSection}>
          <Text style={BottomSheetStyles.confirmationMessageHeading}>
            Not able to connect to your node
          </Text>
        </View>

        <View style={styles.messageBodySection}>
          <Text style={{
            ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
          }}>
            Please check your node settings and try again
          </Text>

          <Text style={ListStyles.infoHeaderSubtitleText}>
            You may also switch to use the BitHyve default node
          </Text>
        </View>


        <View style={styles.actionButtonContainer}>
        <ButtonBlue
          buttonText="Try Again"
          handleButtonPress={onTryAgainPressed}
        />
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
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
} )

export default PersonalNodeConnectionFailureBottomSheet
