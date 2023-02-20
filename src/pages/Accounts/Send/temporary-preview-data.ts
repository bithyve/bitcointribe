import { ContactRecipientDescribing, AccountRecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../../../common/data/enums/RecipientKind'
import ContactTrustKind from '../../../common/data/enums/ContactTrustKind'

export const sampleContactRecipients: ContactRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.CONTACT,
    displayedName: 'Elon Musk',
    amount: 0,
    walletName: 'Wallet 1',
    avatarImageSource: require( '../../../assets/images/icons/icon_bitcoin_light.png' ),
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 0.3 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 0.2 ),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
  },
  {
    id: '2',
    kind: RecipientKind.CONTACT,
    displayedName: 'Tony Stark',
    amount: 0,
    walletName: 'Savings Wallet',
    avatarImageSource: require( '../../../assets/images/icons/icon_bitcoin_light.png' ),
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 100 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 20 ),
    trustKind: ContactTrustKind.USER_IS_KEEPING,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
  },
  {
    id: '3',
    kind: RecipientKind.CONTACT,
    displayedName: 'Ada Lovelace',
    amount: 0,
    walletName: 'Wallet With Really Long Name',
    avatarImageSource: require( '../../../assets/images/icons/icon_qr_logo.png' ),
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 3 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 0.1 ),
    trustKind: ContactTrustKind.OTHER,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
  },
  {
    id: '4',
    kind: RecipientKind.CONTACT,
    displayedName: 'John Galt',
    amount: 0,
    walletName: 'The Vault',
    avatarImageSource: null,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 300 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 200 ),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
  },
]



export const sampleAccountRecipients: AccountRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: 'Savings Account',
    avatarImageSource: require( '../../../assets/images/icons/icon_regular_account.png' ),
    currentBalance: 342000,
  },
  {
    id: '2',
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: 'Checking Account',
    avatarImageSource: require( '../../../assets/images/icons/icon_secureaccount_white.png' ),
    currentBalance: 15642294,
  },
]

