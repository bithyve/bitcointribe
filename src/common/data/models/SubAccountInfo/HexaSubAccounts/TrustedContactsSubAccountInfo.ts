import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import SubAccountKind from '../../../enums/SubAccountKind';
import UTXOCompatibilityGroup from '../../../enums/UTXOCompatibilityGroup';
import { HexaSubAccountDescribing, SubAccountDescribingConstructorProps } from "../Interfaces";
import { ImageSourcePropType } from 'react-native';

type ConstructorProps = SubAccountDescribingConstructorProps & {};


export default class TrustedContactsSubAccountInfo implements HexaSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.TRUSTED_CONTACTS;
  balance: number;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string = "Account with Trusted Contacts";
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource: ImageSourcePropType;

  transactionIDs: string[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup;

  constructor({
    accountShellID = null,
    defaultTitle = "Joint Account",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactionIDs = [],
    utxoCompatibilityGroup = UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.isTFAEnabled = isTFAEnabled;
    this.transactionIDs = transactionIDs;
    this.utxoCompatibilityGroup = utxoCompatibilityGroup;

    // TODO: Define some way to generate this from the address book avatar.
    this.avatarImageSource = require('../../../../../assets/images/icons/icon_hexa.png');
  }
}
