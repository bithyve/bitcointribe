import ServiceAccountKind from "../../../common/data/enums/ServiceAccountKind";
import DonationSubAccountInfo from "../../../common/data/models/SubAccountInfo/DonationSubAccountInfo";
import ExternalServiceSubAccountInfo from "../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo";
import CheckingSubAccountInfo from "../../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo";
import SavingsSubAccountInfo from "../../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo";
import TestSubAccountInfo from "../../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo";
import TrustedContactsSubAccountInfo from "../../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo";
import FullyImportedWalletSubAccountInfo from "../../../common/data/models/SubAccountInfo/ImportedWalletSubAccounts/FullyImportedWalletSubAccountInfo";
import WatchOnlyImportedWalletSubAccountInfo from "../../../common/data/models/SubAccountInfo/ImportedWalletSubAccounts/WatchOnlyImportedWalletSubAccountInfo";
import SubAccountDescribing from "../../../common/data/models/SubAccountInfo/Interfaces";

export default function useNewAccountChoices(): Record<string, SubAccountDescribing[]> {
  return {
    hexaAccounts: [
      new TestSubAccountInfo({
        isPrimarySubAccount: true,
      }),
      new SavingsSubAccountInfo({
        isPrimarySubAccount: true,
      }),
      new CheckingSubAccountInfo({
        isPrimarySubAccount: true,
      }),
      new TrustedContactsSubAccountInfo({
        isPrimarySubAccount: true,
      }),

      new DonationSubAccountInfo({
        doneeName: 'Sample Donee',
        causeName: 'Bitcoin Development Fund',
        isPrimarySubAccount: true,
      }),
    ],

    serviceAccounts: [
      new ExternalServiceSubAccountInfo({
        defaultTitle: "Swan Bitcoin",
        defaultDescription: "Stack Sats with Swan",
        serviceAccountKind: ServiceAccountKind.SWAN,
        isPrimarySubAccount: true,
      }),
      new ExternalServiceSubAccountInfo({
        defaultTitle: "FastBitcoins.com",
        defaultDescription: "Use FastBitcoin Vouchers",
        serviceAccountKind: ServiceAccountKind.FAST_BITCOINS,
        isPrimarySubAccount: true,
      }),
      new ExternalServiceSubAccountInfo({
        defaultTitle: "Whirlpool Account",
        defaultDescription: "Powered by Samurai",
        serviceAccountKind: ServiceAccountKind.WHIRLPOOL,
        isPrimarySubAccount: true,
      }),
    ],

    importedWalletAccounts: [
      new WatchOnlyImportedWalletSubAccountInfo({
        isPrimarySubAccount: true,
      }),
      new FullyImportedWalletSubAccountInfo({
        isPrimarySubAccount: true,
      }),
    ],
  };
}
