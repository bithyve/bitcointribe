import { v4 as uuidV4 } from 'uuid'
import AccountVisibility from '../enums/AccountVisibility'
import BitcoinUnit from '../enums/BitcoinUnit'
import UTXOCompatibilityGroup from '../enums/UTXOCompatibilityGroup'
import SubAccountDescribing from './SubAccountInfo/Interfaces'
import { Satoshis } from '../typealiases/UnitAliases'
import TransactionDescribing from './Transactions/Interfaces'
import { Balances } from '../../../bitcoin/utilities/Interface'
import SyncStatus from '../enums/SyncStatus'

type ConstructorProps = {
  displayOrder?: number | null;
  unit: BitcoinUnit;
  primarySubAccount: SubAccountDescribing;
  secondarySubAccounts?: { [id: string]: SubAccountDescribing };
};

export default class AccountShell {
  /**
   * Unique Identifier
   */
  id: string;

  /**
   * The order in which this account should be displayed to the user within
   * a list of accounts.
   */
  displayOrder: number | null;

  /**
   * The unit to be used for displaying the account's balance to the user.
   */
  unit: BitcoinUnit;

  /**
   * Indicates if the account has completed syncing this happens once per session.
   * A sync icon is diplayed on the home screen tile if this has not be done
   */
  syncStatus: SyncStatus | SyncStatus.COMPLETED;

  primarySubAccount: SubAccountDescribing;
  secondarySubAccounts: { [id: string]: SubAccountDescribing };


  constructor( {
    displayOrder = null,
    unit = BitcoinUnit.BTC,
    primarySubAccount,
    secondarySubAccounts = {
    },
  }: ConstructorProps ) {
    this.id = uuidV4()

    this.primarySubAccount = primarySubAccount
    this.primarySubAccount.accountShellID = this.id

    this.secondarySubAccounts = secondarySubAccounts

    Object.values( this.secondarySubAccounts ).forEach(
      ( s ) => ( s.accountShellID = this.id ),
    )

    this.displayOrder = displayOrder
    this.unit = unit
    this.syncStatus = SyncStatus.PENDING
  }

  static getUTXOCompatibilityGroup(
    shell: AccountShell,
  ): UTXOCompatibilityGroup {
    return shell.primarySubAccount.utxoCompatibilityGroup
  }

  static getSubAccounts( shell: AccountShell ): SubAccountDescribing[] {
    return [
      shell.primarySubAccount,
      ...Object.values( shell.secondarySubAccounts ),
    ]
  }

  /**
   * Total balance of all sub-accounts in Satoshis.
   */
  static getTotalBalance = ( shell: AccountShell ): Satoshis => {
    return AccountShell.getSubAccounts( shell ).reduce(
      ( accumulated, current ) =>
        accumulated +
        ( current.balances.confirmed + current.balances.unconfirmed ),
      0,
    )
  };

  /**
   * Spendable balance of all sub-accounts in Satoshis.
   */
  static getSpendableBalance = ( shell: AccountShell ): Satoshis => {
    return AccountShell
      .getSubAccounts( shell )
      .reduce(
        ( accumulated, current ) => accumulated + current.balances.confirmed,
        0
      )
  };

  /**
   * Transactions of all sub-accounts.
   */
  static getAllTransactions = (
    shell: AccountShell,
  ): TransactionDescribing[] => {
    return AccountShell
      .getSubAccounts( shell )
      .flatMap( subAccount => subAccount.transactions )
  };

  static getVisibility( shell: AccountShell ): AccountVisibility {
    return shell.primarySubAccount.visibility
  }

  static setPrimarySubAccount(
    shell: AccountShell,
    subAccount: SubAccountDescribing,
  ) {
    subAccount.accountShellID = shell.id
    shell.primarySubAccount = subAccount
  }

  /**
   * Updates primary sub-account w/ latest balance and transactions
   */
  static updatePrimarySubAccountDetails(
    shell: AccountShell,
    isUsable: boolean,
    newbalance: Balances,
    newTransactions: TransactionDescribing[],
    accountDetails?: {
      accountName?: string,
      accountDescription?: string,
      accountXpub?: string,
      accountVisibility?: AccountVisibility,
      hasNewTxn: boolean
    }
  ) {
    shell.primarySubAccount.isUsable = isUsable
    shell.primarySubAccount.balances = newbalance
    shell.primarySubAccount.transactions = newTransactions
    if( accountDetails ){
      const { accountName, accountDescription, accountXpub, accountVisibility, hasNewTxn } = accountDetails
      if( accountName ) shell.primarySubAccount.customDisplayName = accountName
      if( accountDescription ) shell.primarySubAccount.customDescription = accountDescription
      if( accountXpub ) shell.primarySubAccount.xPub = accountXpub
      if( accountVisibility ) shell.primarySubAccount.visibility = accountVisibility
      if( hasNewTxn ) shell.primarySubAccount.hasNewTxn = hasNewTxn
    }
  }

  static addSecondarySubAccount(
    shell: AccountShell,
    subAccId: string,
    subAccount: SubAccountDescribing,
  ) {
    shell.secondarySubAccounts[ subAccId ] = subAccount
  }

  /**
   * Updates secondary sub-account w/ latest balance and transactions
   */
  static updateSecondarySubAccountBalanceTx(
    shell: AccountShell,
    subAccId: string,
    newbalance: Balances,
    newTransactions: TransactionDescribing[],
    accountDetails?: {
      accountXpub?: string,
    }  ) {
    let secondarySub = shell.secondarySubAccounts[ subAccId ]
    if ( secondarySub ) {
      secondarySub = {
        ...secondarySub,
        balances: newbalance,
        transactions: newTransactions,
      }

      if( accountDetails ){
        const { accountXpub } = accountDetails
        if( accountXpub ) secondarySub.xPub = accountXpub
      }

      shell.secondarySubAccounts[ subAccId ] = secondarySub
    }
  }
}
