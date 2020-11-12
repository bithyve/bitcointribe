import { useMemo } from "react";
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
  return useMemo(() => {
    return {
      hexaAccounts: [
        new TestSubAccountInfo({}),
        new SavingsSubAccountInfo({}),
        new CheckingSubAccountInfo({}),
        new TrustedContactsSubAccountInfo({}),

        new DonationSubAccountInfo({
          doneeName: 'Sample Donee',
          causeName: 'Bitcoin Development Fund',
        }),
      ],

      serviceAccounts: [
        new ExternalServiceSubAccountInfo({
          defaultTitle: "Swan Bitcoin",
          defaultDescription: "Stack Sats with Swan",
          serviceAccountKind: ServiceAccountKind.SWAN,
        }),
        new ExternalServiceSubAccountInfo({
          defaultTitle: "FastBitcoins.com",
          defaultDescription: "Use FastBitcoin Vouchers",
          serviceAccountKind: ServiceAccountKind.FAST_BITCOINS,
        }),
        new ExternalServiceSubAccountInfo({
          defaultTitle: "Whirlpool Account",
          defaultDescription: "Powered by Samurai",
          serviceAccountKind: ServiceAccountKind.WHIRLPOOL,
        }),
      ],

      importedWalletAccounts: [
        new WatchOnlyImportedWalletSubAccountInfo({}),
        new FullyImportedWalletSubAccountInfo({}),
      ],
    };
  }, []);
}
