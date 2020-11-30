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
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.DONATION;
  balance: number;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

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
    accountShellID = null,
    defaultTitle = "Donation Account",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    doneeName,
    causeName,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactionIDs = [],
    transactionGroup = TransactionGroup.MULTI_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.isTFAEnabled = isTFAEnabled;
    this.doneeName = doneeName;
    this.causeName = causeName;
    this.transactionIDs = transactionIDs;
    this.transactionGroup = transactionGroup;
  }
}
