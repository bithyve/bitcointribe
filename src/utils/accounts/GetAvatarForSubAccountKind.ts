import { ImageSourcePropType } from "react-native";

/**
 * TODO: Deprecate this in favor of calling `getIconByAccountKind` with a
 * a strongly-typed `AccountKind`.
 * (See: https://github.com/bithyve/hexa/blob/f247ab7ae05e52e23ec4fc773360ef84a063248f/src/utils/accounts/IconUtils.ts#L23)
 */
export default function getAvatarForSubAccountKind(accountKind: string): ImageSourcePropType | null {
  if (['saving', 'SAVINGS_ACCOUNT'].includes(accountKind)) {
    return require('../../assets/images/icons/icon_secureaccount.png');
  } else if (['regular', 'REGULAR_ACCOUNT'].includes(accountKind)) {
    return require('../../assets/images/icons/icon_regular.png');
  } else if (['secure', 'SECURE_ACCOUNT'].includes(accountKind)) {
    return require('../../assets/images/icons/icon_secureaccount.png');
  } else if (['test', 'TEST_ACCOUNT'].includes(accountKind)) {
    return require('../../assets/images/icons/icon_test.png');
  } else if (['Donation Account', 'DONATION_ACCOUNT'].includes(accountKind)) {
    return require('../../assets/images/icons/icon_donation_hexa.png');
  }
};
