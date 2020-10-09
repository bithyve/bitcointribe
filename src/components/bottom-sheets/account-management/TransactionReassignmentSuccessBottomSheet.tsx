import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { Button } from 'react-native-elements';
import Colors from '../../../common/Colors';
import ButtonStyles from '../../../common/Styles/Buttons';
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles';


export type Props = {
  destinationAccountID: string;
  onViewAccountDetailsPressed: () => void;
};

const TransactionReassignmentSuccessBottomSheet: React.FC<Props> = ({
  destinationAccountID,
  onViewAccountDetailsPressed,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      <View style={styles.backgroundImageContainer}>
        <Image
          source={require('../../../assets/images/BottomSheetMessages/success-stars.png')}
          style={{
            width: 103,
            height: 128,
          }}
        />
      </View>

      <View style={styles.mainContentContainer}>
        <Text style={BottomSheetStyles.confirmationMessageHeading}>
          Transactions Successfully Reassigned
        </Text>

        <View style={styles.actionButtonContainer}>
          <Button
            raised
            buttonStyle={ButtonStyles.primaryActionButton}
            title="View Account"
            titleStyle={ButtonStyles.actionButtonText}
            onPress={onViewAccountDetailsPressed}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

  actionButtonContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});

export default TransactionReassignmentSuccessBottomSheet;
