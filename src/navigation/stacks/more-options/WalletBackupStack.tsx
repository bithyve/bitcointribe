import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { translations } from '../../../common/content/LocContext'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import WalletBackup from '../../../pages/MoreOptions/WalletBackup'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SecondaryDeviceHistoryNewBHR from '../../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import TrustedContactHistoryNewBHR from '../../../pages/NewBHR/TrustedContactHistoryKeeper'
import PersonalCopyHistoryNewBHR from '../../../pages/NewBHR/PersonalCopyHistory'
import CloudBackupHistory from '../../../pages/NewBHR/CloudBackupHistory'
import SeedBackupHistory from '../../../pages/NewBHR/SeedBackupHistory'
import TrustedContactNewBHR from '../../../pages/NewBHR/TrustedContacts'
import BackupSeedWordsContent from '../../../pages/NewBHR/BackupSeedWordsContent'
import RestoreSeedWordsContent from '../../../pages/RestoreHexaWithKeeper/RestoreSeedWordsContent'
import SecurityQuestionHistoryNewBHR from '../../../pages/NewBHR/SecurityQuestionHistory'
import SetNewPassword from '../../../pages/NewBHR/SetNewPassword'

const strings  = translations[ 'stackTitle' ]

const WalletBackupStack = createStackNavigator(
  {
    WalletBackupRoot: {
      screen: WalletBackup,
      navigationOptions: {
        header: null,
      },
    },
    SecondaryDeviceHistoryNewBHR,
    TrustedContactHistoryNewBHR,
    RestoreSeedWordsContent,
    BackupSeedWordsContent: {
      screen: BackupSeedWordsContent,
      navigationOptions: {
        header: null,
      },
    },
    TrustedContactNewBHR,
    SetNewPassword: {
      screen: SetNewPassword,
      navigationOptions: {
        header: null,
      },
    },
    CloudBackupHistory: {
      screen: CloudBackupHistory,
      navigationOptions: {
        header: null,
      },
    },
    SeedBackupHistory: {
      screen: SeedBackupHistory,
      navigationOptions: {
        header: null,
      },
    },
    PersonalCopyHistoryNewBHR,
    SecurityQuestionHistoryNewBHR: {
      screen: SecurityQuestionHistoryNewBHR, 
      navigationOptions: {
        header: null,
      }
    },
  },
  {
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
        },
      }
    },
  },
)

export default WalletBackupStack
