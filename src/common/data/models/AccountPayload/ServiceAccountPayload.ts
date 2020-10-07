import { v4 as uuidV4 } from 'uuid';
import { iconForServiceAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import ServiceAccountKind from "../../enums/ServiceAccountKind";
import { ExternalServiceAccountPayload } from './Interfaces';
import AccountVisibility from '../../enums/AccountVisibility';
import TransactionGroup from '../../enums/TransactionGroup';

interface ConstructorProps {
  defaultTitle: string;
  defaultDescription: string;
  serviceAccountKind: ServiceAccountKind;
  accountNumber?: number;
  displayOrder?: number | null;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string | null;
  customDescription?: string | null;
  visibility?: AccountVisibility;
  secondaryAccountUUIDs?: string[];
  transactionIDs?: string[];
}

export default class ServiceAccountPayload implements ExternalServiceAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string;
  kind: AccountKind = AccountKind.SERVICE;
  serviceAccountKind: ServiceAccountKind;

  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit = BitcoinUnit.SATS;
  customDisplayName: string | null;
  customDescription: string | null;
  visibility: AccountVisibility;
  secondaryAccountUUIDs: string[];
  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC;

  constructor({
    defaultTitle,
    defaultDescription,
    serviceAccountKind,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    visibility,
    secondaryAccountUUIDs,
    transactionIDs,
  }: ConstructorProps) {
    this.defaultTitle = defaultTitle;
    this.defaultDescription = defaultDescription;
    this.serviceAccountKind = serviceAccountKind;
    this.accountNumber = accountNumber || 0;
    this.displayOrder = displayOrder || null;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName || null;
    this.customDescription = customDescription || null;
    this.visibility = visibility || AccountVisibility.DEFAULT;
    this.secondaryAccountUUIDs = secondaryAccountUUIDs || [];
    this.transactionIDs = transactionIDs || [];
  }

  get imageSource(): NodeRequire {
    return iconForServiceAccountKind(this.serviceAccountKind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}

