import AccountKind from "../../enums/AccountKind";
import ServiceAccountKind from "../../enums/ServiceAccountKind";
import TransactionConfirmationStatus from "../../enums/TransactionConfirmationStatus";
import TransactionKind from "../../enums/TransactionKind";


export interface TransactionDescribing {
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
  recipientAddresses: string[];
  senderAddresses: string[];
  blockTime: number | null;
  message: string | null;

  /**
   * The ID of the account whose xPub is tied to this transaction.
   */
  xPubAccountID: string;
  xPubAccountKind: AccountKind;
  xPubServiceKind?: ServiceAccountKind;
}

