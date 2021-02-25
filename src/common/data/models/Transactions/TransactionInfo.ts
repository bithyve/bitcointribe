import { v4 as uuidV4 } from 'uuid'
import SubAccountKind from '../../enums/SubAccountKind'
import ServiceAccountKind from '../../enums/ServiceAccountKind'
import TransactionConfirmationStatus from '../../enums/TransactionConfirmationStatus'
import TransactionKind from '../../enums/TransactionKind'
import { InboundTransactionDescribing, OutboundTransactionDescribing } from './Interfaces'


type BaseConstructorProps = {
  confirmations: number,
  confirmationStatus: TransactionConfirmationStatus,
  fee: number,
  timestamp: number,
  amount: number,
  contactName?: string | null,
  recipientAddresses?: string[],
  senderAddresses?: string[],
  blockTime?: number | null,
  message?: string | null,
  xPubAccountID: string,
  xPubAccountKind: SubAccountKind,
  xPubServiceKind?: ServiceAccountKind,
};

type InboundConstructorProps = BaseConstructorProps & {
    sourceAddress: string;
    sourceXPubAccountID?: string | null;
}

type OutboundConstructorProps = BaseConstructorProps & {
    destinationAddress: string;
}

export class InboundTransactionInfo implements InboundTransactionDescribing {
  txID: string = uuidV4();
  confirmations: number;
  confirmationStatus: TransactionConfirmationStatus;
  transactionKind: TransactionKind = TransactionKind.RECEIVE;
  fee: number;
  timestamp: number;
  amount: number;
  contactName: string;
  blockTime: number;
  message: string;

  xPubAccountID: string;
  xPubAccountKind: SubAccountKind;
  xPubServiceKind?: ServiceAccountKind;

  sourceAddress: string;
  sourceXPubAccountID: string | null;


  constructor({
    confirmations,
    confirmationStatus,
    fee,
    timestamp = Date.now(),
    amount,
    contactName = null,
    blockTime = null,
    message = null,
    xPubAccountID,
    xPubAccountKind,
    xPubServiceKind,
    sourceAddress,
    sourceXPubAccountID = null,
  }: InboundConstructorProps) {
    this.confirmations = confirmations
    this.confirmationStatus = confirmationStatus
    this.fee = fee
    this.timestamp = timestamp
    this.amount = amount
    this.contactName = contactName
    this.blockTime = blockTime
    this.message = message
    this.xPubAccountID = xPubAccountID
    this.xPubAccountKind = xPubAccountKind
    this.xPubServiceKind = xPubServiceKind
    this.sourceXPubAccountID = sourceXPubAccountID
    this.sourceAddress = sourceAddress
  }
}

export class OutboundTransactionInfo implements OutboundTransactionDescribing {
  txID: string = uuidV4();
  confirmations: number;
  confirmationStatus: TransactionConfirmationStatus;
  transactionKind: TransactionKind = TransactionKind.RECEIVE;
  fee: number;
  timestamp: number;
  amount: number;
  contactName: string;
  blockTime: number;
  message: string;

  xPubAccountID: string;
  xPubAccountKind: SubAccountKind;
  xPubServiceKind?: ServiceAccountKind;

  destinationAddress: string;


  constructor({
    confirmations,
    confirmationStatus,
    fee,
    timestamp = Date.now(),
    amount,
    contactName = null,
    blockTime = null,
    message = null,
    xPubAccountID,
    xPubAccountKind,
    xPubServiceKind,
    destinationAddress,
  }: OutboundConstructorProps) {
    this.confirmations = confirmations
    this.confirmationStatus = confirmationStatus
    this.fee = fee
    this.timestamp = timestamp
    this.amount = amount
    this.contactName = contactName
    this.blockTime = blockTime
    this.message = message
    this.xPubAccountID = xPubAccountID
    this.xPubAccountKind = xPubAccountKind
    this.xPubServiceKind = xPubServiceKind
    this.destinationAddress = destinationAddress
  }
}
