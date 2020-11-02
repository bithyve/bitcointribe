import { ContactRecipientDescribing, AccountRecipientDescribing } from "../../../common/data/models/interfaces/RecipientDescribing";
import RecipientKind from "../../../common/data/enums/RecipientKind";

export const sampleContactRecipients: ContactRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.CONTACT,
    displayedName: 'Elon Musk',
    contactsWalletName: 'Wallet 1',
    avatarImageSource: require('../../../assets/images/icons/icon_bitcoin_light.png'),
    lastSeenActive: Date.now() - (1000 * 60 * 60 * 24 * 3),
    availableBalance: 1248390,
  },
  {
    id: '2',
    kind: RecipientKind.CONTACT,
    displayedName: 'Tony Stark',
    contactsWalletName: 'Savings Wallet',
    avatarImageSource: require('../../../assets/images/icons/icon_bitcoin_light.png'),
    lastSeenActive: Date.now() - (1000 * 60 * 60 * 24 * 20),
    availableBalance: 2000,
  },
];



export const sampleAccountRecipients: AccountRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.SUB_ACCOUNT,
    displayedName: 'Savings Account',
    avatarImageSource: require('../../../assets/images/icons/icon_regular_account.png'),
    availableBalance: 342000,
  },
  {
    id: '2',
    kind: RecipientKind.SUB_ACCOUNT,
    displayedName: 'Checking Account',
    avatarImageSource: require('../../../assets/images/icons/icon_secureaccount_white.png'),
    availableBalance: 15642294,
  },
]

