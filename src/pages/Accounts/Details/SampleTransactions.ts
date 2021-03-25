// import SubAccountKind from '../../../common/data/enums/SubAccountKind';
// import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind';
// import TransactionConfirmationStatus from '../../../common/data/enums/TransactionConfirmationStatus';
// import TransactionKind from '../../../common/data/enums/TransactionKind';
// import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces';
// import {
//   InboundTransactionInfo,
//   OutboundTransactionInfo,
// } from '../../../common/data/models/Transactions/TransactionInfo';

// const sampleTransactions: TransactionDescribing[] = [
//   // Confirmed

//   new InboundTransactionInfo({
//     confirmations: 1,
//     confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
//     fee: 2,
//     timestamp: Date.now(),
//     amount: 2316000,
//     message: 'Bought via FastBitcoins',
//     xPubAccountID: 'S-1',
//     xPubAccountKind: SubAccountKind.SERVICE,
//     xPubServiceKind: ServiceAccountKind.FAST_BITCOINS,
//     sourceAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
//     sourceXPubAccountID: 'R-1',
//   }),
//   new OutboundTransactionInfo({
//     confirmations: 0,
//     confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
//     fee: 2,
//     timestamp: Date.now(),
//     amount: 3081,
//     message: 'Buy Coffee',
//     xPubAccountID: 'R-1',
//     xPubAccountKind: SubAccountKind.REGULAR_ACCOUNT,
//     destinationAddress: 'bc1q3phfpmz02fa8ajhpt58xmvkdyaz3evxlxr7v64',
//   }),
//   new InboundTransactionInfo({
//     confirmations: 10,
//     confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
//     fee: 2,
//     timestamp: Date.now(),
//     amount: 218383,
//     message: 'Payment for Logo Design',
//     xPubAccountID: 'R-1',
//     xPubAccountKind: SubAccountKind.REGULAR_ACCOUNT,
//     sourceAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
//     sourceXPubAccountID: 'R-1',
//   }),
//   new OutboundTransactionInfo({
//     confirmations: 2,
//     confirmationStatus: TransactionConfirmationStatus.CONFIRMED,
//     fee: 10,
//     timestamp: Date.now(),
//     amount: 937710,
//     message: 'Buy Pizza',
//     xPubAccountID: 'R-1',
//     xPubAccountKind: SubAccountKind.REGULAR_ACCOUNT,
//     destinationAddress: 'bc1q3phfpmz02fa8ajhpt58xmvkdyaz3evxlxr7v64',
//   }),

//   // Pending

//   new OutboundTransactionInfo({
//     confirmations: 30,
//     confirmationStatus: TransactionConfirmationStatus.UNCONFIRMED,
//     fee: 202,
//     timestamp: Date.now(),
//     amount: 960000000,
//     message: 'Buy Lambo',
//     xPubAccountID: 'C-1',
//     xPubAccountKind: SubAccountKind.SECURE_ACCOUNT,
//     destinationAddress: 'bc1q3phfpmz02fa8ajhpt58xmvkdyaz3evxlxr7v64',
//   }),
// ];

// export default sampleTransactions;  // stalling sampleTx export in favor of backend tx-details interface
