import { v4 as uuidV4 } from 'uuid';
import SubAccountKind from "../../enums/SubAccountKind";
import { DonationSubAccountDescribing, SubAccountDescribingConstructorProps } from './Interfaces';
import TransactionGroup from '../../enums/TransactionGroup';
import AccountVisibility from '../../enums/AccountVisibility';

type ConstructorProps = SubAccountDescribingConstructorProps & {
  doneeName: string;
  causeName: string;
}


export default class DonationSubAccountInfo implements DonationSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string;
  kind: SubAccountKind = SubAccountKind.DONATION;
  isPrimarySubAccount: boolean;
  balance: number;
  visibility: AccountVisibility;

  defaultTitle: string;
  defaultDescription: string = "Directly Accept Donations";
  customDisplayName: string | null;
  customDescription: string | null;

  doneeName: string;
  causeName: string;

  avatarImageSource = require('../../../../assets/images/icons/icon_donation_hexa.png');

  transactionIDs: string[];

  /**
   * Can either be `SINGLE_SIG_PUBLIC` or `MULTI_SIG_PUBLIC`,
   * depending on what the user chooses during creation.
   */
  transactionGroup: TransactionGroup;

  constructor({
    accountShellID,
    defaultTitle = "Donation Account",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    doneeName,
    causeName,
    visibility = AccountVisibility.DEFAULT,
    transactionIDs = [],
    isPrimarySubAccount = false,
    transactionGroup = TransactionGroup.MULTI_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.doneeName = doneeName;
    this.causeName = causeName;
    this.transactionIDs = transactionIDs;
    this.isPrimarySubAccount = isPrimarySubAccount;
    this.transactionGroup = transactionGroup;
  }
}
