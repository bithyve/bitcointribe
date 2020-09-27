import { v4 as uuidv4 } from 'uuid';
import { iconForAccountKind, iconForServiceAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { HexaAccountPayload } from './AccountPayload';


interface ConstructorProps {
  title?: string;
  accountNumber?: number;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string;
  customDescription?: string;
}


export class TestAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Learn Bitcoin";
  kind: AccountKind = AccountKind.TEST;
  accountNumber: number;
  balance: number;
  unit: BitcoinUnit = BitcoinUnit.TSATS;
  customDisplayName?: string;
  customDescription?: string;

  constructor({
    title,
    accountNumber,
    balance,
    customDisplayName,
    customDescription,
  }: ConstructorProps = {}) {
    this.title = title || "Test Account";
    this.accountNumber = accountNumber || 0;
    this.balance = balance || 0;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }
}

export class SavingsAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Multi-factor security";
  kind: AccountKind = AccountKind.SECURE;
  accountNumber: number;
  balance: number;
  unit: BitcoinUnit;
  customDescription?: string;
  customDisplayName?: string;

  constructor({
    title,
    accountNumber,
    balance,
    unit,
    customDisplayName,
    customDescription,
  }: ConstructorProps = {}) {
    this.title = title || "Savings Account";
    this.accountNumber = accountNumber || 0;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }
}

export class CheckingAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Fast and easy";
  kind: AccountKind = AccountKind.REGULAR;
  accountNumber: number;
  balance: number;
  unit: BitcoinUnit;
  customDescription?: string;
  customDisplayName?: string;

  constructor({
    title,
    accountNumber,
    balance,
    unit,
    customDisplayName,
    customDescription,
  }: ConstructorProps = {}) {
    this.title = title || "Checking Account";
    this.accountNumber = accountNumber || 0;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }
}


export class TrustedContactsAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Account with Trusted Contacts";
  kind: AccountKind = AccountKind.TRUSTED_CONTACTS;
  accountNumber: number;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName?: string;
  customDescription?: string;

  constructor({
    title,
    accountNumber,
    balance,
    unit,
    customDisplayName,
    customDescription,
  }: ConstructorProps = {}) {
    this.title = title || "Joint Account";
    this.accountNumber = accountNumber || 0;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }
}


export class DonationAccountPayload implements HexaAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Directly Accept Donations";
  kind: AccountKind = AccountKind.DONATION;
  accountNumber: number;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName?: string;
  customDescription?: string;

  constructor({
    title,
    accountNumber,
    balance,
    unit,
    customDisplayName,
    customDescription,
  }: ConstructorProps = {}) {
    this.title = title || "Donation Account";
    this.accountNumber = accountNumber || 0;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
  }

  get imageSource(): NodeRequire {
    return iconForAccountKind(this.kind);
  }
}
