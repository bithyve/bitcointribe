import { useMemo, useState } from "react";
import useAccountsState from "../state-selectors/accounts/UseAccountsState";
import { TEST_ACCOUNT, REGULAR_ACCOUNT, SECURE_ACCOUNT, TRUSTED_CONTACTS } from "../../../common/constants/wallet-service-types";
import moment from "moment";
import btcConfig from '../../../bitcoin/HexaConfig';



export default function useAllAccountTransactions() {
  const accountsState = useAccountsState();

  const [isLoading, setIsLoading] = useState(false);

  // 📝 Note: Much of the current code here was simply copied over from `Home` while breaking `Transactions` out into its own screen. It should be a high priority to refactor this after implementing the new data structures and architecture of `feature/account-management`.
  const transactions = useMemo(() => {
    setIsLoading(true);

    const testTransactions = accountsState[TEST_ACCOUNT].service ?
      accountsState[TEST_ACCOUNT]
        .service
        .hdWallet
        .transactions
        .transactionDetails
      : [];

    let regularTransactions = accountsState[REGULAR_ACCOUNT].service ?
      accountsState[REGULAR_ACCOUNT]
        .service
        .hdWallet
        .transactions
        .transactionDetails
      : [];

    // regular derivative accounts
    for (const dAccountType of btcConfig.DERIVATIVE_ACC_TO_SYNC) {
      const derivativeAccount =
        accountsState[REGULAR_ACCOUNT]
          .service
          .hdWallet
          .derivativeAccounts[dAccountType];

      if (derivativeAccount && derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          if (derivativeAccount[accountNumber].transactions) {
            derivativeAccount[accountNumber].transactions.transactionDetails.forEach((tx) => {
              let include = true;

              for (const regularTransaction of regularTransactions) {
                if (tx.txid === regularTransaction.txid) {
                  include = false;
                  break;
                }
              }
              if (include) regularTransactions.push(tx);
            });
          }
        }
      }
    }

    const secureTransactions = accountsState[SECURE_ACCOUNT].service ?
      accountsState[SECURE_ACCOUNT]
        .service
        .secureHDWallet
        .transactions
        .transactionDetails
      : [];

    // secure derivative accounts
    for (const dAccountType of btcConfig.DERIVATIVE_ACC_TO_SYNC) {
      if (dAccountType === TRUSTED_CONTACTS) continue;

      const derivativeAccount =
        accountsState[SECURE_ACCOUNT]
          .service
          .secureHDWallet
          .derivativeAccounts[dAccountType];

      if (derivativeAccount && derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          if (derivativeAccount[accountNumber].transactions) {
            derivativeAccount[accountNumber]
              .transactions
              .transactionDetails
              .forEach((tx) => {
                let include = true;

                for (const secureTransaction of secureTransactions) {
                  if (tx.txid === secureTransaction.txid) {
                    include = false;
                    break;
                  }
                }
                if (include) secureTransactions.push(tx);
              });
          }
        }
      }
    }

    // donation transactions
    const additionalTxs = [];

    for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {
      const derivativeAccounts = accountsState[serviceType]
        .service[serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet']
        .derivativeAccounts;

      for (const additionAcc of btcConfig.EJECTED_ACCOUNTS) {
        if (!derivativeAccounts[additionAcc]) continue;

        for (
          let index = 1;
          index <= derivativeAccounts[additionAcc].instance.using;
          index++
        ) {
          const account = derivativeAccounts[additionAcc][index];

          if (
            account.transactions &&
            account.transactions.transactionDetails.length
          ) {
            additionalTxs.push(...account.transactions.transactionDetails);
          }
        }
      }
    }

    const allTransactions = [
      ...testTransactions,
      ...regularTransactions,
      ...secureTransactions,
      ...additionalTxs,
    ];

    if (allTransactions.length) {
      allTransactions.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
    }

    setIsLoading(false);

    return allTransactions;
  }, [accountsState]);

  return {
    transactions,
    isLoadingTransactions: isLoading
  };
}
