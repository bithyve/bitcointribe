import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import ServiceAccountKind from "../../enums/ServiceAccountKind";


export interface HexaAccountPayload {
  uuid: string;
  kind: AccountKind;
  title: string;
  shortDescription: string;
  accountNumber: number;
  balance: number;
  unit: BitcoinUnit;
  customDisplayName?: string;
  customDescription?: string;
  imageSource: NodeRequire;
}

export interface ExternalServiceAccountPayload extends HexaAccountPayload {
  serviceAccountKind: ServiceAccountKind;
}

export interface ImportedWalletAccountPayload extends HexaAccountPayload {
}


type AccountPayload =
  HexaAccountPayload |
  ExternalServiceAccountPayload |
  ImportedWalletAccountPayload;


export default AccountPayload;
