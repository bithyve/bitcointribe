import { v4 as uuidv4 } from 'uuid';
import { iconForServiceAccountKind } from '../../../../utils/accounts/IconUtils';
import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import ServiceAccountKind from "../../enums/ServiceAccountKind";
import { ExternalServiceAccountPayload } from './AccountPayload';

interface ConstructorProps {
  title: string;
  shortDescription: string;
  serviceAccountKind: ServiceAccountKind;
  accountNumber?: number;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string;
  customDescription?: string;
}

export default class ServiceAccountPayload implements ExternalServiceAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string;
  kind: AccountKind = AccountKind.SERVICE;
  serviceAccountKind: ServiceAccountKind;

  accountNumber: number;
  balance: number;
  unit: BitcoinUnit = BitcoinUnit.SATS;
  customDisplayName?: string;
  customDescription?: string;


  constructor({
    title,
    shortDescription,
    serviceAccountKind,
    accountNumber,
    balance,
    unit,
    customDisplayName,
    customDescription,
  }: ConstructorProps) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.serviceAccountKind = serviceAccountKind;
    this.accountNumber = accountNumber || 0;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
  }

  get imageSource(): NodeRequire {
    return iconForServiceAccountKind(this.serviceAccountKind);
  }
}

