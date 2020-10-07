import { v4 as uuidV4 } from 'uuid';
import { iconForAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { DonationReceivingAccountPayload } from './Interfaces';
import AccountVisibility from '../../enums/AccountVisibility';
import TransactionGroup from '../../enums/TransactionGroup';

interface ConstructorProps {
  defaultTitle?: string;
  doneeName: string;
  causeName: string;
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

export default class DonationAccountPayload implements DonationReceivingAccountPayload {
  uuid: string = uuidV4();
  defaultTitle: string;
  defaultDescription: string = "Directly Accept Donations";
  kind: AccountKind = AccountKind.DONATION;

  doneeName: string;
  causeName: string;

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
    doneeName,
    causeName,
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
    this.defaultTitle = defaultTitle || "Donation Account";
    this.doneeName = doneeName;
    this.causeName = causeName;
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
