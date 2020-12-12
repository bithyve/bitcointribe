import { ImageSourcePropType } from "react-native";
import ServiceAccountKind from "../../common/data/enums/ServiceAccountKind";

export default function getAvatarForServiceAccountKind(
  serviceAccountKind: ServiceAccountKind,
): ImageSourcePropType {
  switch (serviceAccountKind) {
    case ServiceAccountKind.FAST_BITCOINS:
      return require('../../assets/images/icons/icon_fastbitcoins_hex_dark.png');
    case ServiceAccountKind.SWAN:
      return require('../../assets/images/icons/icon_swan.png');
    default:
      return require('../../assets/images/icons/icon_hexa.png');
  }
}
