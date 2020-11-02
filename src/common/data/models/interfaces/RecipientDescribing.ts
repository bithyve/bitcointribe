import { ImageSourcePropType } from "react-native";
import RecipientKind from "../../enums/RecipientKind";
import { Satoshis } from "../../typealiases/UnitAliases";

export interface RecipientDescribing {
  id: string;
  kind: RecipientKind;
  displayedName: string;

  /**
   * Available balance in Satoshis
   */
  availableBalance: Satoshis;

  avatarImageSource: ImageSourcePropType | null;
}


export interface ContactRecipientDescribing extends RecipientDescribing {
  contactsWalletName: string;
  lastSeenActive: number | null;
}

export interface AccountRecipientDescribing extends RecipientDescribing {

}
