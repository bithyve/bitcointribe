import React from 'react'
import { View, StyleSheet } from 'react-native'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import TestAccountKnowMoreSheetContents from '../know-more-sheets/TestAccountKnowMoreSheetContents'
import Colors from '../../common/Colors'
import SavingsAccountKnowMoreSheetContents from '../know-more-sheets/SavingsAccountKnowMoreSheetContents'
import CheckingAccountKnowMoreSheetContents from '../know-more-sheets/CheckingAccountKnowMoreSheetContents'
import DonationAccountKnowMoreSheetContents from '../know-more-sheets/DonationAccountKnowMoreSheetContents'
import BottomSheetHandle from '../bottom-sheets/BottomSheetHandle'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import ServiceAccountKnowMoreSheetContents from '../know-more-sheets/ServiceAccountKnowMoreSheetContents'

export type Props = {
  primarySubAccount: any;
  accountKind: SubAccountKind;
  onClose: () => void;
};

export const KnowMoreBottomSheetHandle: React.FC = () => {
  return <BottomSheetHandle containerStyle={styles.handleContainer} />
}

const AccountDetailsKnowMoreBottomSheet: React.FC<Props> = ( {
  primarySubAccount,
  accountKind,
  onClose,
}: Props ) => {

  const serviceBottomSheet = ( serviceKind ) => {
    return (
      <ServiceAccountKnowMoreSheetContents
        serviceKind={serviceKind}
        titleClicked={onClose}
        containerStyle={styles.contentContainer}
      />
    )
  }
  const BottomSheetContent = () => {
    switch ( accountKind ) {
        case SubAccountKind.TEST_ACCOUNT:
          return (
            <TestAccountKnowMoreSheetContents
              titleClicked={onClose}
              containerStyle={styles.contentContainer}
            />
          )
        case SubAccountKind.SECURE_ACCOUNT:
          return (
            <SavingsAccountKnowMoreSheetContents
              titleClicked={onClose}
              containerStyle={styles.contentContainer}
            />
          )
        case SubAccountKind.REGULAR_ACCOUNT:
          return (
            <CheckingAccountKnowMoreSheetContents
              titleClicked={onClose}
              containerStyle={styles.contentContainer}
            />
          )
        case SubAccountKind.DONATION_ACCOUNT:
          return (
            <DonationAccountKnowMoreSheetContents
              titleClicked={onClose}
              containerStyle={styles.contentContainer}
            />
          )

        case SubAccountKind.SERVICE:
          switch( ( primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind ){
              case ( ServiceAccountKind.WYRE ):
                return serviceBottomSheet( ServiceAccountKind.WYRE )
              case ( ServiceAccountKind.RAMP ):
                return serviceBottomSheet( ServiceAccountKind.RAMP )
              case ( ServiceAccountKind.SWAN ):
                return serviceBottomSheet( ServiceAccountKind.SWAN )
          }


        default:
          return null
    }
  }

  return (
    <View style={styles.rootContainer}>
      <BottomSheetContent />
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    backgroundColor: Colors.blue,
    // flex: 1,
  },

  handleContainer: {
    backgroundColor: Colors.blue,
  },

  contentContainer: {
    // shadowOpacity: 0,
  },
} )

export default AccountDetailsKnowMoreBottomSheet
