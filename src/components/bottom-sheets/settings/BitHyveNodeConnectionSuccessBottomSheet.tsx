import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../../../common/Colors'
import ListStyles from '../../../common/Styles/ListStyles'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import ButtonStyles from '../../../common/Styles/ButtonStyles'

export type Props = {
  onConfirmPressed: () => void;
};

const BitHyveNodeConnectionSuccessBottomSheet: React.FC<Props> = ( { onConfirmPressed, }: Props ) => {
  return (
    <View style={styles.rootContainer}>
      <View style={styles.backgroundImageContainer}>
        <Image
          source={require( '../../../assets/images/BottomSheetMessages/success-stars.png' )}
          style={{
            width: 103,
            height: 128,
          }}
        />
      </View>

      <View style={styles.mainContentContainer}>

        <View style={styles.headerSection}>
          <Text style={BottomSheetStyles.confirmationMessageHeading}>
            Successfully connected to Bitcoin Tribe node
          </Text>
        </View>

        <View style={styles.messageBodySection}>
          <Text style={{
            ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
          }}>
            You can edit your node settings from the same screen anytime in the future
          </Text>

          <Text style={ListStyles.infoHeaderSubtitleText}>
            You may also switch to using your own node
          </Text>
        </View>


        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            onPress={onConfirmPressed}
            style={ButtonStyles.primaryActionButton}
          >
            <Text style={ButtonStyles.actionButtonText}>OK</Text>
          </TouchableOpacity>
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

  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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
} )

export default BitHyveNodeConnectionSuccessBottomSheet
