import { ContactRecipientDescribing, AccountRecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../../../common/data/enums/RecipientKind'
import ContactTrustKind from '../../../common/data/enums/ContactTrustKind'

export const sampleContactRecipients: ContactRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.CONTACT,
    displayedName: 'Elon Musk',
    walletName: 'Wallet 1',
<<<<<<< HEAD
    avatarImageSource: require( '../../../assets/images/icons/icon_bitcoin_light.png' ),
    availableBalance: 1248390,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 0.3 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 0.2 ),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
=======
    avatarImageSource: require('../../../assets/images/icons/icon_bitcoin_light.png'),
    initiatedAt: Date.now() - (1000 * 60 * 60 * 24 * 0.3),
    lastSeenActive: Date.now() - (1000 * 60 * 60 * 24 * 0.2),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
>>>>>>> c2d3ac13... Begin refactoring Send UI components around new trustedContacts structure.
  },
  {
    id: '2',
    kind: RecipientKind.CONTACT,
    displayedName: 'Tony Stark',
    walletName: 'Savings Wallet',
<<<<<<< HEAD
    avatarImageSource: require( '../../../assets/images/icons/icon_bitcoin_light.png' ),
    availableBalance: 2000,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 100 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 20 ),
    trustKind: ContactTrustKind.USER_IS_KEEPING,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
=======
    avatarImageSource: require('../../../assets/images/icons/icon_bitcoin_light.png'),
    initiatedAt: Date.now() - (1000 * 60 * 60 * 24 * 100),
    lastSeenActive: Date.now() - (1000 * 60 * 60 * 24 * 20),
    trustKind: ContactTrustKind.USER_IS_KEEPING,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
>>>>>>> c2d3ac13... Begin refactoring Send UI components around new trustedContacts structure.
  },
  {
    id: '3',
    kind: RecipientKind.CONTACT,
    displayedName: 'Ada Lovelace',
    walletName: 'Wallet With Really Long Name',
<<<<<<< HEAD
    avatarImageSource: require( '../../../assets/images/icons/icon_hexa.png' ),
    availableBalance: 1,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 3 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 0.1 ),
    trustKind: ContactTrustKind.OTHER,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
=======
    avatarImageSource: require('../../../assets/images/icons/icon_hexa.png'),
    initiatedAt: Date.now() - (1000 * 60 * 60 * 24 * 3),
    lastSeenActive: Date.now() - (1000 * 60 * 60 * 24 * 0.1),
    trustKind: ContactTrustKind.OTHER,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
>>>>>>> c2d3ac13... Begin refactoring Send UI components around new trustedContacts structure.
  },
  {
    id: '4',
    kind: RecipientKind.CONTACT,
    displayedName: 'John Galt',
    walletName: 'The Vault',
    avatarImageSource: null,
<<<<<<< HEAD
    availableBalance: 4939391,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 300 ),
    lastSeenActive: Date.now() - ( 1000 * 60 * 60 * 24 * 200 ),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasXPub: true,
    hasTrustedAddress: false,
    isPendingRequestAcceptance: false,
=======
    initiatedAt: Date.now() - (1000 * 60 * 60 * 24 * 300),
    lastSeenActive: Date.now() - (1000 * 60 * 60 * 24 * 200),
    trustKind: ContactTrustKind.KEEPER_OF_USER,
    hasTrustedAddress: true,
    hasTrustedChannelWithUser: true,
>>>>>>> c2d3ac13... Begin refactoring Send UI components around new trustedContacts structure.
  },
]



export const sampleAccountRecipients: AccountRecipientDescribing[] = [
  {
    id: '1',
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: 'Savings Account',
<<<<<<< HEAD
    avatarImageSource: require( '../../../assets/images/icons/icon_regular_account.png' ),
    availableBalance: 342000,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 4 ),
=======
    avatarImageSource: require('../../../assets/images/icons/icon_regular_account.png'),
    currentBalance: 342000,
>>>>>>> c2d3ac13... Begin refactoring Send UI components around new trustedContacts structure.
  },
  {
    id: '2',
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: 'Checking Account',
<<<<<<< HEAD
    avatarImageSource: require( '../../../assets/images/icons/icon_secureaccount_white.png' ),
    availableBalance: 15642294,
    initiatedAt: Date.now() - ( 1000 * 60 * 60 * 24 * 39 ),
=======
    avatarImageSource: require('../../../assets/images/icons/icon_secureaccount_white.png'),
    currentBalance: 15642294,
>>>>>>> c2d3ac13... Begin refactoring Send UI components around new trustedContacts structure.
  },
]

