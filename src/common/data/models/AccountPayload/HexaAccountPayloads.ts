import { v4 as uuidv4 } from 'uuid';
import { iconForAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { HexaAccountPayload } from './Interfaces';


interface ConstructorProps {
  title?: string;
  accountNumber?: number;
  displayOrder?: number | null;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string | null;
  customDescription?: string | null;
  secondaryAccountUUIDs?: string[];
}

export class TestAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Learn Bitcoin";
  kind: AccountKind = AccountKind.TEST;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit = BitcoinUnit.TSATS;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];


  constructor({
    title,
    accountNumber,
    displayOrder,
    balance,
    customDisplayName,
    customDescription,
    secondaryAccountUUIDs,
  }: ConstructorProps = {}) {
    this.title = title || "Test Account";
    this.accountNumber = accountNumber || 0;
    this.displayOrder = displayOrder || null;
    this.balance = balance || 0;
    this.customDisplayName = customDisplayName || null;
    this.customDescription = customDescription || null;
    this.secondaryAccountUUIDs = secondaryAccountUUIDs || [];
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}

export class SavingsAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Multi-factor security";
  kind: AccountKind = AccountKind.SECURE;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];

  constructor({
    title,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    secondaryAccountUUIDs,
  }: ConstructorProps = {}) {
    this.title = title || "Savings Account";
    this.accountNumber = accountNumber || 0;
    this.displayOrder = displayOrder || null;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName || null;
    this.customDescription = customDescription || null;
    this.secondaryAccountUUIDs = secondaryAccountUUIDs || [];
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}

export class CheckingAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Fast and easy";
  kind: AccountKind = AccountKind.REGULAR;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];

  constructor({
    title,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    secondaryAccountUUIDs,
  }: ConstructorProps = {}) {
    this.title = title || "Checking Account";
    this.accountNumber = accountNumber || 0;
    this.displayOrder = displayOrder || null;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName || null;
    this.customDescription = customDescription || null;
    this.secondaryAccountUUIDs = secondaryAccountUUIDs || [];
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}


export class TrustedContactsAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Account with Trusted Contacts";
  kind: AccountKind = AccountKind.TRUSTED_CONTACTS;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];

  constructor({
    title,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    secondaryAccountUUIDs,
  }: ConstructorProps = {}) {
    this.title = title || "Joint Account";
    this.accountNumber = accountNumber || 0;
    this.displayOrder = displayOrder || null;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName || null;
    this.customDescription = customDescription || null;
    this.secondaryAccountUUIDs = secondaryAccountUUIDs || [];
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}
