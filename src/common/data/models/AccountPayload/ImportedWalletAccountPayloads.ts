import { v4 as uuidv4 } from 'uuid';
import { iconForAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { ImportedWalletAccountPayload } from './AccountPayload';


interface ConstructorProps {
  title?: string;
  accountNumber?: number;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string;
  customDescription?: string;
}

export class WatchOnlyImportedWalletAccountPayload implements ImportedWalletAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "View a non-Hexa wallet as an account.";
  kind: AccountKind = AccountKind.WATCH_ONLY_IMPORTED_WALLET
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
    this.title = title || "Watch Only";
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


export class FullyImportedWalletAccountPayload implements ImportedWalletAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Fully import and manage a non-Hexa wallet.";
  kind: AccountKind = AccountKind.FULLY_IMPORTED_WALLET;
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
    this.title = title || "Full Import";
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
