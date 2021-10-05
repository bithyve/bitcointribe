import { ImageSourcePropType } from 'react-native'
import RecipientKind from '../../enums/RecipientKind'
import { Satoshis } from '../../typealiases/UnitAliases'
import ContactTrustKind from '../../enums/ContactTrustKind'
import SourceAccountKind from '../../enums/SourceAccountKind'
import SubAccountKind from '../../enums/SubAccountKind'
import ServiceAccountKind from '../../enums/ServiceAccountKind'

export interface RecipientDescribing {
  id: string;
  kind: RecipientKind;
  displayedName: string;
  amount?: Satoshis;
  avatarImageSource: ImageSourcePropType | null;
}

export type AddressRecipientDescribing = RecipientDescribing

export interface ContactRecipientDescribing extends RecipientDescribing {
  isActive: boolean,
  channelKey: string,
  lastSeenActive: number | null;
  walletName: string | null;
  trustKind: ContactTrustKind;
  walletId?: string;
  streamId?: string;
}

export interface AccountRecipientDescribing extends RecipientDescribing {

  /**
  * Current balance of the account in Satoshis.
  */
  currentBalance: Satoshis;
  type: SubAccountKind,
  serviceType?: ServiceAccountKind,
  sourceAccount: SourceAccountKind;
  instanceNumber: number;
}
