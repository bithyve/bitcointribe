import { ContactRecipientDescribing, AccountRecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../../../common/data/enums/RecipientKind'
import ContactTrustKind from '../../../common/data/enums/ContactTrustKind'

export const sampleContactRecipients: ContactRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.CONTACT,
    displayedName: 'Elon Musk',
    walletName: 'Wallet 1',
    avatarImageSource: require( '../../../assets/images/icons/icon_bitcoin_light.png' ),
    availableBalance: 1248390,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 0.3 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 0.2 ),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
  },
  {
    id: '2',
    kind: RecipientKind.CONTACT,
    displayedName: 'Tony Stark',
    walletName: 'Savings Wallet',
    avatarImageSource: require( '../../../assets/images/icons/icon_bitcoin_light.png' ),
    availableBalance: 2000,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 100 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 20 ),
    trustKind: ContactTrustKind.USER_IS_KEEPING,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
  },
  {
    id: '3',
    kind: RecipientKind.CONTACT,
    displayedName: 'Ada Lovelace',
    walletName: 'Wallet With Really Long Name',
    avatarImageSource: require( '../../../assets/images/icons/icon_hexa.png' ),
    availableBalance: 1,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 3 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 0.1 ),
    trustKind: ContactTrustKind.OTHER,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
  },
  {
    id: '4',
    kind: RecipientKind.CONTACT,
    displayedName: 'John Galt',
    walletName: 'The Vault',
    avatarImageSource: null,
    availableBalance: 4939391,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 300 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 200 ),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
  },
]



export const sampleAccountRecipients: AccountRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: 'Savings Account',
    avatarImageSource: require( '../../../assets/images/icons/icon_regular_account.png' ),
    availableBalance: 342000,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 4 ),
  },
  {
    id: '2',
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: 'Checking Account',
    avatarImageSource: require( '../../../assets/images/icons/icon_secureaccount_white.png' ),
    availableBalance: 15642294,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 39 ),
  },
]

