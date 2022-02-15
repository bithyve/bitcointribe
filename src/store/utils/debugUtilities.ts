import HexaConfig from '../../bitcoin/HexaConfig'
import { upgradeAccountToMultiSig } from '../../bitcoin/utilities/accounts/AccountFactory'
import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { Account, AccountType, NetworkType } from '../../bitcoin/utilities/Interface'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import { APP_STAGE } from '../../common/interfaces/Interfaces'

export function generateDummyAccountFromXpubs(
  { xpubs }: {
  xpubs: Array<string>,
}
): Account {
  const networkType = HexaConfig.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET: NetworkType.MAINNET
  let dummyAccount: Account = {
    id: 'dummy-id',
    isUsable: true,
    walletId: 'dummy-wallet-id',
    type: AccountType.CHECKING_ACCOUNT,
    instanceNum: 0,
    networkType,
    derivationPath: 'dummy-path',
    xpub: xpubs[ 0 ],
    xpriv: 'dummy-xpriv',
    accountName: 'dummy-account-name',
    accountDescription: 'dummy-description',
    accountVisibility: AccountVisibility.DEFAULT,
    activeAddresses: {
      external: {
      },
      internal: {
      },
    },
    receivingAddress: 'dummy-initialRecevingAddress',
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    lastSynched: 0,
    txIdMap: {
    },
    transactionsNote: {
    },
    importedAddresses: {
    },
  }

  if( xpubs.length > 1 ){
    dummyAccount.type = AccountType.SAVINGS_ACCOUNT
    dummyAccount = upgradeAccountToMultiSig( {
      account: dummyAccount,
      secondaryXpub: xpubs[ 1 ],
      bithyveXpub: xpubs[ 2 ],
    } )
  }

  return dummyAccount
}

export const checkBalanceByXpubs =  async ( xpubs ) => {
  const temporaryAccount = generateDummyAccountFromXpubs( {
    xpubs,
  } )
  const accountsToSync =  {
    [ temporaryAccount.id ]: temporaryAccount
  }
  const network =  AccountUtilities.getNetworkByType( temporaryAccount.networkType )
  const hardRefresh = true
  const { synchedAccounts } = await AccountOperations.syncAccounts( accountsToSync, network, hardRefresh )
  const synchedTemporaryAccount = synchedAccounts[ temporaryAccount.id ]
  return synchedTemporaryAccount.balances.confirmed + synchedTemporaryAccount.balances.unconfirmed
}
