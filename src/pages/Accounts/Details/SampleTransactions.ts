import AccountKind from "../../../common/data/enums/AccountKind";
import ServiceAccountKind from "../../../common/data/enums/ServiceAccountKind";
import TransactionConfirmationStatus from "../../../common/data/enums/TransactionConfirmationStatus";
import TransactionKind from "../../../common/data/enums/TransactionKind";
import TransactionInfo from "../../../common/data/models/Transactions/TransactionInfo";


const sampleTransactions: TransactionInfo[] = [

  // Confirmed

  new TransactionInfo({
    confirmations: 1,
    confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
    transactionKind: TransactionKind.RECEIVE,
    fee: 2,
    timestamp: Date.now(),
    amount: 2316000,
    message: 'Bought via FastBitcoins',
    xPubAccountID: 'S-1',
    xPubAccountKind: AccountKind.SERVICE,
    xPubServiceKind: ServiceAccountKind.FAST_BITCOINS,
  }),
  new TransactionInfo({
    confirmations: 0,
    confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
    transactionKind: TransactionKind.SEND,
    fee: 2,
    timestamp: Date.now(),
    amount: 0.081,
    message: 'Buy Coffee',
    xPubAccountID: 'R-1',
    xPubAccountKind: AccountKind.REGULAR,
  }),
  new TransactionInfo({
    confirmations: 10,
    confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
    transactionKind: TransactionKind.RECEIVE,
    fee: 2,
    timestamp: Date.now(),
    amount: 218383,
    message: 'Payment for Logo Design',
    xPubAccountID: 'R-1',
    xPubAccountKind: AccountKind.REGULAR,
  }),
  new TransactionInfo({
    confirmations: 2,
    confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
    transactionKind: TransactionKind.SEND,
    fee: 10,
    timestamp: Date.now(),
    amount: 937710,
    message: 'Buy Pizza',
    xPubAccountID: 'R-1',
    xPubAccountKind: AccountKind.REGULAR,
  }),


  // Pending

  new TransactionInfo({
    confirmations: 30,
    confirmationStatus: TransactionConfirmationStatus.UNCONFIRMED,
    transactionKind: TransactionKind.SEND,
    fee: 202,
    timestamp: Date.now(),
    amount: 960000000,
    message: 'Buy Lambo',
    xPubAccountID: 'C-1',
    xPubAccountKind: AccountKind.SECURE,
  }),
];


export default sampleTransactions;
