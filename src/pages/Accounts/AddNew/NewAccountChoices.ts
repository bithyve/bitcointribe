import ServiceAccountKind from "../../../common/data/enums/ServiceAccountKind";
import { CheckingAccountPayload, SavingsAccountPayload, TestAccountPayload, TrustedContactsAccountPayload } from "../../../common/data/models/AccountPayload/HexaAccountPayloads";
import { FullyImportedWalletAccountPayload, WatchOnlyImportedWalletAccountPayload } from "../../../common/data/models/AccountPayload/ImportedWalletAccountPayloads";
import ServiceAccountPayload from "../../../common/data/models/AccountPayload/ServiceAccountPayload";
import DonationAccountPayload from "../../../common/data/models/AccountPayload/DonationAccountPayload";

// TODO: Make this a reusable hook that dynamically computes default properties
const NEW_ACCOUNT_CHOICES = {
  hexaAccounts: [
    new TestAccountPayload(),
    new SavingsAccountPayload(),
    new CheckingAccountPayload(),
    new TrustedContactsAccountPayload(),
    new DonationAccountPayload({
      doneeName: 'Sample Donee',
      causeName: 'Bitcoin Development Fund',
    }),
  ],

  serviceAccounts: [
    new ServiceAccountPayload({
      defaultTitle: "Swan Bitcoin",
      defaultDescription: "Stack Sats with Swan.",
      serviceAccountKind: ServiceAccountKind.SWAN,
    }),
    new ServiceAccountPayload({
      defaultTitle: "FastBitcoins.com",
      defaultDescription: "Use FastBitcoin Vouchers.",
      serviceAccountKind: ServiceAccountKind.FAST_BITCOINS,
    }),
    new ServiceAccountPayload({
      defaultTitle: "Whirlpool Account",
      defaultDescription: "Powered by Samurai.",
      serviceAccountKind: ServiceAccountKind.WHIRLPOOL,
    }),
  ],

  importedWalletAccounts: [
    new WatchOnlyImportedWalletAccountPayload(),
    new FullyImportedWalletAccountPayload(),
  ],
};

export default NEW_ACCOUNT_CHOICES;
