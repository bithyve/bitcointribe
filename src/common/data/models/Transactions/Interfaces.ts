import SubAccountKind from '../../enums/SubAccountKind'
import ServiceAccountKind from '../../enums/ServiceAccountKind'
import TransactionConfirmationStatus from '../../enums/TransactionConfirmationStatus'
import TransactionKind from '../../enums/TransactionKind'
import { TransactionDetails } from '../../../../bitcoin/utilities/Interface'

export interface BaseTransactionDescribing {
  txID: string;
  confirmations: number;
  confirmationStatus: TransactionConfirmationStatus;
  transactionKind: TransactionKind;

  /**
   * Sats per byte
   */
  fee: number;

  /**
   * Unix timestamp (The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC)
   */
  timestamp: number;

  /**
   * Amount in Satoshis.
   */
  amount: number;

  contactName: string | null;

  blockTime: number | null;
  message: string | null;

  /**
   * The ID of the account whose xPub is tied to this transaction.
   */
  xPubAccountID: string;
  xPubAccountKind: SubAccountKind;
  xPubServiceKind?: ServiceAccountKind;
}

export interface InboundTransactionDescribing
  extends BaseTransactionDescribing {
  /**
   * The address that this transaction was sent from.
   * (Applies when the transaction is an inbound (AKA "RECEIVE") transaction)
   */
  sourceAddress: string | null;

  /**
   * The accountID, if known,of the transaction's designated source xPub.
   */
  sourceXPubAccountID: string | null;
}

export interface OutboundTransactionDescribing
  extends BaseTransactionDescribing {
  /**
   * The address that this transaction was sent to.
   * (Applies when the transaction is an outgoing (AKA "SEND") transaction)
   */
  destinationAddress: string | null;
}

type TransactionDescribing = TransactionDetails; // tx-describing now stands for backend's tx-details interface
// InboundTransactionDescribing |
// OutboundTransactionDescribing;

export default TransactionDescribing
