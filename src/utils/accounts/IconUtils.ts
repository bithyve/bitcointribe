import AccountKind from "../../common/data/enums/AccountKind";
import ServiceAccountKind from "../../common/data/enums/ServiceAccountKind";

// TODO: Deprecate this in favor of calling `getIconByAccountKind` with a
// a strongly-typed `AccountKind`.
export function getIconByAccountType(type: string): NodeRequire {
  if (type === 'saving') {
    return require('../../assets/images/icons/icon_regular.png');
  } else if (type === 'regular') {
    return require('../../assets/images/icons/icon_regular.png');
  } else if (type === 'secure') {
    return require('../../assets/images/icons/icon_secureaccount.png');
  } else if (type === 'test') {
    return require('../../assets/images/icons/icon_test.png');
  } else if (type === 'Donation Account') {
    return require('../../assets/images/icons/icon_donation_hexa.png');
  } else {
    return require('../../assets/images/icons/icon_test.png');
  }
};


export function iconForAccountKind(kind: AccountKind): NodeRequire {
  switch (kind) {
    case AccountKind.TEST:
      return require('../../assets/images/icons/icon_test.png');
    case AccountKind.REGULAR:
      return require('../../assets/images/icons/icon_checking.png');
    case AccountKind.SECURE:
      return require('../../assets/images/icons/icon_savings.png');
    case AccountKind.TRUSTED_CONTACTS:
      return require('../../assets/images/icons/icon_wallet.png');
    case AccountKind.DONATION:
      return require('../../assets/images/icons/icon_donation_hexa.png');
    case AccountKind.WATCH_ONLY_IMPORTED_WALLET:
      return require('../../assets/images/icons/icon_import_watch_only_wallet.png');
    case AccountKind.FULLY_IMPORTED_WALLET:
      return require('../../assets/images/icons/icon_wallet.png');
    default:
      return require('../../assets/images/icons/icon_wallet.png');
  }
}


export function iconForServiceAccountKind(kind: ServiceAccountKind): NodeRequire {
  switch (kind) {
    case ServiceAccountKind.FAST_BITCOINS:
      return require('../../assets/images/icons/fastbitcoin.png');
    case ServiceAccountKind.WHIRLPOOL:
      // TODO: Figure out the right icon for this
      return require('../../assets/images/icons/icon_wallet.png');
    case ServiceAccountKind.S3:
      // TODO: Figure out the right icon for this
      return require('../../assets/images/icons/icon_cloud.png');
    case ServiceAccountKind.SWAN:
      return require('../../assets/images/icons/icon_swan.png');
    default:
      return require('../../assets/images/icons/icon_wallet.png');
  }
}
