import { v4 as uuidV4 } from 'uuid';
import { iconForAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { HexaAccountPayload } from './Interfaces';
import AccountVisibility from '../../enums/AccountVisibility';
import TransactionGroup from '../../enums/TransactionGroup';

interface ConstructorProps {
  defaultTitle?: string;
  accountNumber?: number;
  displayOrder?: number | null;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string | null;
  customDescription?: string | null;
  secondaryAccountUUIDs?: string[];
  visibility?: AccountVisibility;
  transactionIDs?: string[];
}

export class TestAccountPayload implements HexaAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string = "Learn Bitcoin";
  kind: AccountKind = AccountKind.TEST;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit = BitcoinUnit.TSATS;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];

  visibility: AccountVisibility;

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.TESTNET;


  constructor({
    defaultTitle,
    accountNumber,
    displayOrder,
    balance,
    customDisplayName,
    customDescription,
    visibility,
    secondaryAccountUUIDs,
    transactionIDs,
  }: ConstructorProps = {}) {
    this.defaultTitle = defaultTitle || "Test Account";
    this.accountNumber = accountNumber || 0;
    this.displayOrder = displayOrder || null;
    this.balance = balance || 0;
    this.customDisplayName = customDisplayName || null;
    this.customDescription = customDescription || null;
    this.visibility = visibility || AccountVisibility.DEFAULT;
    this.secondaryAccountUUIDs = secondaryAccountUUIDs || [];
    this.transactionIDs = transactionIDs || [];
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}

export class SavingsAccountPayload implements HexaAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string = "Multi-factor security";
  kind: AccountKind = AccountKind.SECURE;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];
  visibility: AccountVisibility;

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC;


  constructor({
    defaultTitle,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    visibility,
    transactionIDs,
    secondaryAccountUUIDs,
  }: ConstructorProps = {}) {
    this.defaultTitle = defaultTitle || "Savings Account";
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
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}

export class CheckingAccountPayload implements HexaAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string = "Fast and easy";
  kind: AccountKind = AccountKind.REGULAR;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];
  visibility: AccountVisibility;

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC;


  constructor({
    defaultTitle,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    visibility,
    transactionIDs,
    secondaryAccountUUIDs,
  }: ConstructorProps = {}) {
    this.defaultTitle = defaultTitle || "Checking Account";
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
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}


export class TrustedContactsAccountPayload implements HexaAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string = "Account with Trusted Contacts";
  kind: AccountKind = AccountKind.TRUSTED_CONTACTS;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];
  visibility: AccountVisibility;

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC;


  constructor({
    defaultTitle,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    visibility,
    transactionIDs,
    secondaryAccountUUIDs,
  }: ConstructorProps = {}) {
    this.defaultTitle = defaultTitle || "Joint Account";
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
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}
