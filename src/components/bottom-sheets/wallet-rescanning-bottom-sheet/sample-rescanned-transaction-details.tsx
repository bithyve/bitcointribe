import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'

const sampleRescannedTransactionDetails: RescannedTransactionData[] = [
  {
    details: {
      txid: '1',
      status: '',
      confirmations: 9,
      fee: '21',
      date: 'January 1, 2021',
      transactionType: 'Sent',
      amount: 9,
      accountType: '',
      primaryAccType: '',
      contactName: '',
      recipientAddresses: [ '08230af1991e01bec21108a08cu' ],
      // senderAddresses: [ '08230af1991e01bec21108a08cu' ],
      blockTime: 9,
      message: '',
      address: '08230af1991e01bec21108a08cu',
    },
    primaryTitleText: 'Checking Account',
    subtitleText: 'To: Test Account',
    avatarImage: require( '../../../assets/images/icons/icon_wallet.png' ),
  },
  {
    details: {
      txid: '1',
      status: '',
      confirmations: 9,
      fee: '21',
      date: 'January 1, 2021',
      transactionType: 'Sent',
      amount: 9,
      accountType: '',
      primaryAccType: '',
      contactName: '',
      // recipientAddresses: ['08230af1991e01bec21108a08cu'],
      senderAddresses: [ '08230af1991e01bec21108a08cu' ],
      blockTime: 9,
      message: '',
      address: '08230af1991e01bec21108a08cu',
    },
    primaryTitleText: '08230af1991e01...',
    subtitleText: 'From: Checking Account',
    avatarImage: require( '../../../assets/images/icons/icon_wallet.png' ),
  },
]

export default sampleRescannedTransactionDetails
