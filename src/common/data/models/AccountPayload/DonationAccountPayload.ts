import { v4 as uuidv4 } from 'uuid';
import { iconForAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import { DonationReceivingAccountPayload } from './Interfaces';

interface ConstructorProps {
  title?: string;
  doneeName: string;
  causeName: string;
  accountNumber?: number;
  displayOrder?: number | null;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string | null;
  customDescription?: string | null;
  secondaryAccountUUIDs?: string[];
}

export default class DonationAccountPayload implements DonationReceivingAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string = "Directly Accept Donations";
  kind: AccountKind = AccountKind.DONATION;

  doneeName: string;
  causeName: string;

  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];

  constructor({
    title,
    doneeName,
    causeName,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    secondaryAccountUUIDs,
  }: ConstructorProps) {
    this.title = title || "Donation Account";
    this.doneeName = doneeName;
    this.causeName = causeName;
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
