import { ImageSourcePropType } from "react-native";

export enum HomeAddMenuKind {
  BUY_BITCOIN_FROM_FAST_BITCOINS,
  ADD_CONTACT,
  ADD_SWAN_ACCOUNT,
}

export type HomeAddMenuItem = {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  screenName?: string;
  kind: HomeAddMenuKind
}


const homeAddMenuItems: HomeAddMenuItem[] = [
  {
    title: `Buy bitcoin into Hexa wallet`,
    subtitle: 'Redeem a FastBitcoins voucher',
    imageSource: require('../../assets/images/icons/icon_fastbicoin.png'),
    kind: HomeAddMenuKind.BUY_BITCOIN_FROM_FAST_BITCOINS,
  },
  {
    title: 'Add a Contact',
    subtitle: 'Add contacts from your Address Book',
    imageSource: require('../../assets/images/icons/icon_addcontact.png'),
    kind: HomeAddMenuKind.ADD_CONTACT,
  },
  {
    title: 'Add a Swan Bitcoin Account',
    subtitle: 'Buy Bitcoin into Hexa Wallet from SwanBitcoin',
    imageSource: require('../../assets/images/icons/swan_temp.png'),
    kind: HomeAddMenuKind.ADD_SWAN_ACCOUNT,
  },
];

export default homeAddMenuItems;
