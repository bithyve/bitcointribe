import * as RNLocalize from 'react-native-localize';

const initialState = {
    isCameraOpen: false,
    isContactsOpen: false,
    lastActiveTime: null,
    isTransactionHelperDone: false,
    isTransactionDetailsHelperDone: false,
    currencyToggleValue: '',
    notificationList: [],
    secondaryDeviceAddress: '',
    currencyCode: RNLocalize.getCurrencies()[0],
    fcmToken: '',
    SecurityAnsTimestamp: '',
    securityQuestionHistory: '',
    isBuyHelperDone: false,
    isTestAccountHelperDone: false,
    storedAverageTxFees: '',
    isSecureAccountHelperDone: false,
    isRegularAccountHelperDone: false,
    TrustedContactsInfo: '',
    isReceiveHelperDone: false,
    savingsWarning: false
}