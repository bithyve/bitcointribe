import { v4 as uuidV4 } from 'uuid';
import AccountKind from "../../enums/AccountKind";
import ServiceAccountKind from '../../enums/ServiceAccountKind';
import TransactionConfirmationStatus from "../../enums/TransactionConfirmationStatus";
import TransactionKind from "../../enums/TransactionKind";
import { TransactionDescribing } from './Interfaces';


type ConstructorProps = {
  confirmations: number,
  confirmationStatus: TransactionConfirmationStatus,
  transactionKind: TransactionKind,
  fee: number,
  timestamp: number,
  amount: number,
  contactName?: string | null,
  recipientAddresses?: string[],
  senderAddresses?: string[],
  blockTime?: number | null,
  message?: string | null,
  xPubAccountID: string,
  xPubAccountKind: AccountKind,
  xPubServiceKind?: ServiceAccountKind,
};


export default class TransactionInfo implements TransactionDescribing {
  txID: string = uuidV4();
  confirmations: number;
  confirmationStatus: TransactionConfirmationStatus;
  transactionKind: TransactionKind;
  fee: number;
  timestamp: number;
  amount: number;
  contactName: string;
  recipientAddresses: string[];
  senderAddresses: string[];
  blockTime: number;
  message: string;
  xPubAccountID: string;
  xPubAccountKind: AccountKind;
  xPubServiceKind?: ServiceAccountKind;

  constructor({
    confirmations,
    confirmationStatus,
    transactionKind,
    fee,
    timestamp,
    amount,
    contactName,
    recipientAddresses,
    senderAddresses,
    blockTime,
    message,
    xPubAccountID,
    xPubAccountKind,
    xPubServiceKind,
  }: ConstructorProps) {
    this.confirmations = confirmations;
    this.confirmationStatus = confirmationStatus;
    this.transactionKind = transactionKind;
    this.fee = fee;
    this.timestamp = timestamp || Date.now();
    this.amount = amount;
    this.contactName = contactName || null;
    this.recipientAddresses = recipientAddresses || [];
    this.senderAddresses = senderAddresses || [];
    this.blockTime = blockTime || null;
    this.message = message || null;
    this.xPubAccountID = xPubAccountID;
    this.xPubAccountKind = xPubAccountKind;
    this.xPubServiceKind = xPubServiceKind;
  }
}
