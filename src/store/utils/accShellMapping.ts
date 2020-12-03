import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import {
  Balances,
  DerivativeAccount,
  DerivativeAccountTypes,
} from '../../bitcoin/utilities/Interface';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';
import BitcoinUnit from '../../common/data/enums/BitcoinUnit';
import SubAccountKind from '../../common/data/enums/SubAccountKind';
import AccountShell from '../../common/data/models/AccountShell';
import CheckingSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo';
import SavingsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo';
import TestSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo';
import TrustedContactsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo';
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces';
import config from '../../bitcoin/HexaConfig';
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo';
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind';
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces';

const initAccountShells = (services) => {
  const testAcc: TestAccount = services[TEST_ACCOUNT];
  const regularAcc: RegularAccount = services[REGULAR_ACCOUNT];
  const secureAcc: SecureAccount = services[SECURE_ACCOUNT];
  return [
    new AccountShell({
      primarySubAccount: new TestSubAccountInfo({
        id: testAcc.getAccountId(),
      }),
      unit: BitcoinUnit.TSATS,
      displayOrder: 1,
    }),
    new AccountShell({
      primarySubAccount: new CheckingSubAccountInfo({
        id: regularAcc.getAccountId(),
      }),
      unit: BitcoinUnit.SATS,
      displayOrder: 2,
    }),
    new AccountShell({
      primarySubAccount: new SavingsSubAccountInfo({
        id: secureAcc.getAccountId(),
      }),
      unit: BitcoinUnit.SATS,
      displayOrder: 3,
    }),
  ];
};

const updatePrimarySubAccounts = (
  services,
  accountShells: AccountShell[],
): AccountShell[] => {
  const testAcc: TestAccount = services[TEST_ACCOUNT];
  const regularAcc: RegularAccount = services[REGULAR_ACCOUNT];
  const secureAcc: SecureAccount = services[SECURE_ACCOUNT];

  const updatedAccountShells = accountShells.map((shell: AccountShell) => {
    let balances: Balances = {
      confirmed: 0,
      unconfirmed: 0,
    };
    let transactions: TransactionDescribing[] = [];

    switch (shell.primarySubAccount.kind) {
      case SubAccountKind.TEST_ACCOUNT:
        balances = {
          confirmed: testAcc.hdWallet.balances.balance,
          unconfirmed: testAcc.hdWallet.balances.unconfirmedBalance,
        };
        transactions = testAcc.hdWallet.transactions.transactionDetails;
        break;

      case SubAccountKind.REGULAR_ACCOUNT:
        balances = {
          confirmed: regularAcc.hdWallet.balances.balance,
          unconfirmed: regularAcc.hdWallet.balances.unconfirmedBalance,
        };
        transactions = regularAcc.hdWallet.transactions.transactionDetails;

        break;

      case SubAccountKind.SECURE_ACCOUNT:
        balances = {
          confirmed: secureAcc.secureHDWallet.balances.balance,
          unconfirmed: secureAcc.secureHDWallet.balances.unconfirmedBalance,
        };
        transactions = secureAcc.secureHDWallet.transactions.transactionDetails;

        break;
    }

    AccountShell.updatePrimarySubAccountBalanceTx(
      shell,
      balances,
      transactions,
    );

    return shell;
  });

  return updatedAccountShells;
};

const updateSecondarySubAccounts = (
  services,
  accountShells: AccountShell[],
): AccountShell[] => {
  const regularAcc: RegularAccount = services[REGULAR_ACCOUNT];
  const secureAcc: SecureAccount = services[SECURE_ACCOUNT];

  const updatedAccountShells = accountShells.map((shell: AccountShell) => {
    let derivativeAccounts;
    switch (shell.primarySubAccount.kind) {
      case SubAccountKind.REGULAR_ACCOUNT:
        derivativeAccounts = regularAcc.hdWallet.derivativeAccounts;
        break;

      case SubAccountKind.SECURE_ACCOUNT:
        derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts;
        break;
    }

    if (!derivativeAccounts) return shell;

    for (const dAccountType of config.DERIVATIVE_ACC_TO_SYNC) {
      const derivativeAccount: DerivativeAccount =
        derivativeAccounts[dAccountType];

      if (derivativeAccount && derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          let dervBalances: Balances = {
            confirmed: 0,
            unconfirmed: 0,
          };
          let dervTransactions: TransactionDescribing[] = [];

          if (derivativeAccount[accountNumber].balances)
            dervBalances = {
              confirmed: derivativeAccount[accountNumber].balances.balance,
              unconfirmed:
                derivativeAccount[accountNumber].balances.unconfirmedBalance,
            };

          if (derivativeAccount[accountNumber].transactions)
            dervTransactions =
              derivativeAccount[accountNumber].transactions.transactionDetails;

          const derivativeId = derivativeAccount[accountNumber].xpubId;

          if (shell.secondarySubAccounts[derivativeId]) {
            AccountShell.updateSecondarySubAccountBalanceTx(
              shell,
              derivativeId,
              dervBalances,
              dervTransactions,
            );
          } else {
            // backward compatibiliy for versions < 1.4.0 (adding the sub-account)
            let secondarySubAccount: SubAccountDescribing;
            switch (dAccountType) {
              case DerivativeAccountTypes.TRUSTED_CONTACTS:
                secondarySubAccount = new TrustedContactsSubAccountInfo({
                  id: derivativeId,
                  accountShellID: shell.id,
                  balances: dervBalances,
                  transactions: dervTransactions,
                });
                break;

              case DerivativeAccountTypes.FAST_BITCOINS:
                secondarySubAccount = new ExternalServiceSubAccountInfo({
                  id: derivativeId,
                  accountShellID: shell.id,
                  serviceAccountKind: ServiceAccountKind.FAST_BITCOINS,
                  balances: dervBalances,
                  transactions: dervTransactions,
                });
                break;
            }

            AccountShell.addSecondarySubAccount(
              shell,
              derivativeId,
              secondarySubAccount,
            );
          }
        }
      }
    }

    return shell;
  });

  return updatedAccountShells;
};

export const updateAccountShells = (
  services,
  accountShells: AccountShell[],
): AccountShell[] => {
  // init out-of-the-box account shells
  if (!accountShells.length) {
    accountShells = initAccountShells(services);
  }

  // update primary sub-accounts
  let updatedAccountShells = updatePrimarySubAccounts(services, accountShells);

  // insert/update secondary sub-accounts
  updatedAccountShells = updateSecondarySubAccounts(
    services,
    updatedAccountShells,
  );

  return updatedAccountShells;
};
