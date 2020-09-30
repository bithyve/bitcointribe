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
  displayOrder?: number | null;
  balance?: number;
  unit?: BitcoinUnit;
  customDisplayName?: string | null;
  customDescription?: string | null;
  secondaryAccountUUIDs?: string[];
}

export default class ServiceAccountPayload implements ExternalServiceAccountPayload {
  uuid: string = uuidv4();
  title: string;
  shortDescription: string;
  kind: AccountKind = AccountKind.SERVICE;
  serviceAccountKind: ServiceAccountKind;

  accountNumber: number;
  displayOrder: number | null;
  balance: number;
  unit: BitcoinUnit = BitcoinUnit.SATS;
  customDisplayName: string | null;
  customDescription: string | null;
  secondaryAccountUUIDs: string[];


  constructor({
    title,
    shortDescription,
    serviceAccountKind,
    accountNumber,
    displayOrder,
    balance,
    unit,
    customDisplayName,
    customDescription,
    secondaryAccountUUIDs,
  }: ConstructorProps) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.serviceAccountKind = serviceAccountKind;
    this.accountNumber = accountNumber || 0;
    this.displayOrder = displayOrder || null;
    this.balance = balance || 0;
    this.unit = unit || BitcoinUnit.SATS;
    this.customDisplayName = customDisplayName || null;
    this.customDescription = customDescription || null;
    this.secondaryAccountUUIDs = secondaryAccountUUIDs || [];
  }

  get imageSource(): NodeRequire {
    return iconForServiceAccountKind(this.serviceAccountKind);
  }

  get isPrimaryAccount(): boolean {
    return this.secondaryAccountUUIDs.length === 0;
  }
}

