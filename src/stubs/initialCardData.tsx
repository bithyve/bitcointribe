import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
} from '../common/constants/serviceTypes';

export const initialCardData = [
  {
    id: 1,
    title: 'Test Account',
    unit: 't-sats',
    amount: 0,
    account: `Learn Bitcoin`,
    accountType: TEST_ACCOUNT,
    bitcoinicon: require('../assets/images/icons/icon_bitcoin_gray.png'),
  },
  {
    id: 2,
    title: 'Savings Account',
    unit: 'sats',
    amount: 0,
    account: 'Multi-factor security',
    accountType: SECURE_ACCOUNT,
    bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
  },
  {
    id: 3,
    title: 'Checking Account',
    unit: 'sats',
    amount: 0,
    account: 'Fast and easy',
    accountType: REGULAR_ACCOUNT,
    bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
  },
];

export const closingCardData = [
  {
    id: 4,
    title: 'Add Account',
    unit: '',
    amount: '',
    account: '',
    accountType: 'add',
    bitcoinicon: require('../assets/images/icons/icon_add.png'),
  },
];
