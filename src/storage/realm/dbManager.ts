import db from './realm'
import schema from './schema/Schema'

const initDb = () => db.init()

const createWallet = async ( wallet ) => {
  const accountIds = []
  for ( const [ key, value ] of Object.entries( wallet.accounts ) ) {
    accountIds.push( value )
  }
  try {
    db.create( schema.Wallet, {
      ...wallet,
      accountIds,
    }, true )
    return true
  } catch ( error ) {
    return false
    console.log( error )
  }
}

const createAccounts = accounts => {
  try {
    for ( const [ key1, account ] of Object.entries( accounts ) ) {
      for ( const [ key2, acc ] of Object.entries( account ) ) {
        createAccount ( acc )
      }
    }
  } catch ( error ) {
    console.log( error )
    return false
  }
}

const createAccount = async ( account ) => {
  try {
    db.create( schema.Account, {
      ...account, addressQueryList: []
    }, true )
  } catch ( error ) {
    console.log( error )
  }
}

const getWallets = () => {
  const walletsRef = db.objects( schema.Wallet )
  const wallets = Array.from( walletsRef )
  console.log( 'wallets',  JSON.stringify( wallets ) )
}

const getAccounts = () => {
  const accountsRef = db.objects( schema.Account )
  const accounts = Array.from( accountsRef )
  console.log( 'accounts',  JSON.stringify( accounts ) )
}

export default {
  initDb,
  createWallet,
  getWallets,
  getAccounts,
  createAccounts,
  createAccount,
}
