import { v4 as uuidV4 } from 'uuid';
import { iconForAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { ImportedWalletAccountPayload } from './Interfaces';
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
  visibility?: AccountVisibility;
  secondaryAccountUUIDs?: string[];
  transactionIDs?: string[];
}

export class WatchOnlyImportedWalletAccountPayload implements ImportedWalletAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string = "View a non-Hexa wallet as an account.";
  kind: AccountKind = AccountKind.WATCH_ONLY_IMPORTED_WALLET
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  visibility: AccountVisibility;
  secondaryAccountUUIDs: string[];
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
    secondaryAccountUUIDs,
    transactionIDs,
  }: ConstructorProps = {}) {
    this.defaultTitle = defaultTitle || "Watch Only";
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


export class FullyImportedWalletAccountPayload implements ImportedWalletAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string = "Fully import and manage a non-Hexa wallet.";
  kind: AccountKind = AccountKind.FULLY_IMPORTED_WALLET;
  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  visibility: AccountVisibility;
  secondaryAccountUUIDs: string[];
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
    secondaryAccountUUIDs,
    transactionIDs,
  }: ConstructorProps = {}) {
    this.defaultTitle = defaultTitle || "Full Import";
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
