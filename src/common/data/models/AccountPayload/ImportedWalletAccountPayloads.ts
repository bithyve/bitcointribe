import { v4 as uuidv4 } from 'uuid';
import { iconForAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { ImportedWalletAccountPayload } from './Interfaces';


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

export class WatchOnlyImportedWalletAccountPayload implements ImportedWalletAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "View a non-Hexa wallet as an account.";
  kind: AccountKind = AccountKind.WATCH_ONLY_IMPORTED_WALLET
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
    this.title = title || "Watch Only";
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


export class FullyImportedWalletAccountPayload implements ImportedWalletAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Fully import and manage a non-Hexa wallet.";
  kind: AccountKind = AccountKind.FULLY_IMPORTED_WALLET;
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
    this.title = title || "Full Import";
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
