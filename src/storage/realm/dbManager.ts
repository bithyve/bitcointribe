import db from './realm'
import schema from './schema/Schema'

const initDb = ( key ) => {
  db.init( key )
}

const createWallet = async ( wallet ) => {
  const accountIds = []
  for ( const [ key, value ] of Object.entries( wallet.accounts ) ) {
    accountIds.push( {
      derivationPath: key,
      accountId: value
    } )  }
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
      createAccount ( account )
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

const updateAccount = async ( accountId, account ) => {
  try {
    let acccountRef = db.objects( schema.Account ).filtered( `id = "${accountId}"` )
    const data = {
      ...account, txIdMap: [],
    }
    for ( let i = 0; i < data.transactions.length; i++ ) {
      if( !data.transactions[ i ].senderAddresses ) {
        data.transactions[ i ].senderAddresses = []
      }
      if( !data.transactions[ i ].recipientAddresses ) {
        data.transactions[ i ].recipientAddresses = []
      }
    }
    data.addressQueryList = []
    acccountRef = data
    db.create( schema.Account, acccountRef, true )  } catch ( error ) {
    console.log( error )
  }
}

const addContact = async ( contact ) => {
  try {
    const data = {
      ...contact
    }
    const permanentChannel = []
    const unencryptedPermanentChannel = []
    for ( const [ key, value ] of Object.entries( contact.permanentChannel ) ) {
      permanentChannel.push( value )
    }
    for ( const [ key, value ] of Object.entries( contact.unencryptedPermanentChannel ) ) {
      unencryptedPermanentChannel.push( value )
    }
    data.permanentChannel = permanentChannel
    data.unencryptedPermanentChannel = permanentChannel
    db.create( schema.TrustedContact, data, true )
    return true
  } catch ( error ) {
    return false
    console.log( error )
  }
}

const getWallets = () => {
  const walletsRef = db.objects( schema.Wallet )
  const wallets = Array.from( walletsRef )
  console.log( 'wallets',  JSON.stringify( wallets ) )
  return wallets
}

const getTrustedContacts = () => {
  const rrustedContactRef = db.objects( schema.TrustedContact )
  const contacts = Array.from( rrustedContactRef )
  console.log( 'getTrustedContacts',  JSON.stringify( contacts ) )
  return contacts

}

const getAccounts = () => {
  try {
    const accountsRef = db.objects( schema.Account )
    const accounts = Array.from( accountsRef )
    console.log( 'accounts',  JSON.stringify( accounts ) )
    return accounts
  } catch ( error ) {
    console.log( error )
  }
}

export default {
  initDb,
  createWallet,
  getWallets,
  getAccounts,
  createAccounts,
  createAccount,
  updateAccount,
  addContact,
  getTrustedContacts,
}
