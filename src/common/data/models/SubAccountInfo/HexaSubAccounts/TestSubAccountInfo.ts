import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import BitcoinUnit from '../../../enums/BitcoinUnit';
import SubAccountKind from '../../../enums/SubAccountKind';
import TransactionGroup from '../../../enums/TransactionGroup';
import { HexaSubAccountDescribing, SubAccountDescribingConstructorProps } from "../Interfaces";

type ConstructorProps = SubAccountDescribingConstructorProps & {};

export default class TestSubAccountInfo implements HexaSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string;
  kind: SubAccountKind = SubAccountKind.TEST;
  isPrimarySubAccount: boolean;
  balance: number;

  defaultTitle: string;
  defaultDescription: string = "Learn Bitcoin";
  customDisplayName: string | null;
  customDescription: string | null;

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.TESTNET;

  constructor({
    accountShellID,
    defaultTitle = "Test Account",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    transactionIDs = [],
    isPrimarySubAccount = false,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.transactionIDs = transactionIDs;
    this.isPrimarySubAccount = isPrimarySubAccount;
  }
}
