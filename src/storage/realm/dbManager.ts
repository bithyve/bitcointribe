import db from './realm'
import schema from './schema/Schema'
//import { Account } from '../../bitcoin/utilities/Interface'

const initDb = ( key ) => {
  db.init( key )
}

const createWallet = async ( wallet ) => {
  const data = {
    walletId: wallet.walletId,
    walletName: wallet.walletName,
    primaryMnemonic: wallet.primaryMnemonic,
  }
  if( Object.entries( wallet.accounts ).length > 0 ) {
    let accountIds = []
    for ( const [ key, value ] of Object.entries( wallet.accounts ) ) {
      accountIds  = [ ...accountIds, ...value ]
    }
    data.accountIds = accountIds
    if( wallet.details2FA ) {
      data.details2FA = wallet.details2FA
    }
    if( wallet.security ) {
      data.security = wallet.security
    }
    if( wallet.version ) {
      data.version = wallet.version
    }
  }
  try {
    db.create( schema.Wallet, data, true )
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

const updateWallet = async ( newWalletProps ) => {
  try {
    const walletsRef = db.objects( schema.Wallet )
    const wallet = walletsRef[ 0 ]
    for ( const [ key, value ] of Object.entries( newWalletProps ) ) {
      db.write( () => {
        wallet[ key ] = value
      } )
    }
  } catch ( error ) {
    console.log( error )
  }
}

const createAccount = async ( account ) => {
  console.log( account )
  try {
    const data = {
      ...account,
    }
    if( account.activeAddresses ) {
      const aa = {
        internal: {
        },
        external: {
        }
      }
      if( Object.keys( account.activeAddresses.external ).length > 0 ) {
        for ( const [ key, value ] of Object.entries( account.activeAddresses.external ) ) {
          aa.external.address = key
          aa.external ={
            ...value, ...aa
          }
        }
      }
      if( Object.keys( account.activeAddresses.internal ).length > 0 ) {
        for ( const [ key, value ] of Object.entries( account.activeAddresses.external ) ) {
          aa.internal.address = key
          aa.internal ={
            ...value, ...aa
          }
        }
      }
      data.activeAddresses = aa
    }
    if( data.txIdMap ){
      if( Object.keys( data.txIdMap ).length === 0 ) {
        delete data.txIdMap
      } else {
        const map = []
        for ( const [ key, value ] of Object.entries( data.txIdMap ) ) {
          map.push( {
            id: key,
            txIds: value
          } )
        }
        data.txIdMap = map
      }
    }
    db.create( schema.Account, {
      ...data, addressQueryList: []
    }, true )
  } catch ( error ) {
    console.log( error )
  }
}

const updateAccount = async ( accountId, account ) => {
  try {
    let acccountRef = db.objects( schema.Account ).filtered( `id = "${accountId}"` )
    const data = {
      ...account,
    }
    if( account.activeAddresses ) {
      const aa = {
        internal: {
        },
        external: {
        }
      }
      if( Object.keys( account.activeAddresses.external ).length > 0 ) {
        for ( const [ key, value ] of Object.entries( account.activeAddresses.external ) ) {
          aa.external.address = key
          aa.external ={
            ...aa, ...value
          }
        }
      }
      if( Object.keys( account.activeAddresses.internal ).length > 0 ) {
        for ( const [ key, value ] of Object.entries( account.activeAddresses.internal ) ) {
          aa.internal.address = key
          aa.internal ={
            ...aa, ...value
          }
        }
      }
      data.activeAddresses = aa
    }
    if( data.txIdMap ){
      if( Object.keys( data.txIdMap ).length === 0 ) {
        delete data.txIdMap
      } else {
        const map = []
        for ( const [ key, value ] of Object.entries( data.txIdMap ) ) {
          map.push( {
            id: key,
            txIds: value
          } )
        }
        data.txIdMap = map
      }
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
    db.create( schema.Account, acccountRef, true )  }
  catch ( error ) {
    console.log( error )
  }
}

const updateContact = async ( contact ) => {
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

const updateS3Services = async ( data ) => {
  try {
    const dbRef = db.objects( schema.S3Services )
    if( dbRef && dbRef.length ){
      let s3 = dbRef[ 0 ]
      db.write( () => {
        s3 = data
      } )
    } else db.create( schema.S3Services, data, true )
    return true
  } catch ( error ) {
    return false
    console.log( error )
  }
}

const getWallet = () => {
  const walletsRef = db.objects( schema.Wallet )
  const wallets = Array.from( walletsRef )
  return wallets[ 0 ]
}

const getS3Services = () => {
  try {
    const dbRef = db.objects( schema.S3Services )
    const s3Services = Array.from( dbRef )
    if( s3Services && s3Services.length > 0 ) {
      return s3Services[ 0 ]
    } else {
      return {
        encryptedSecretsKeeper: [],
        metaSharesKeeper: [],
        encryptedSMSecretsKeeper: [],
        oldMetaSharesKeeper:[],
      }
    }
  } catch ( error ) {
    console.log( error )
  }
}

const getTrustedContacts = () => {
  const rrustedContactRef = db.objects( schema.TrustedContact )
  const contacts = Array.from( rrustedContactRef )
  return contacts
}

const getAccounts = () => {
  try {
    const accountsRef = db.objects( schema.Account )
    const accounts = Array.from( accountsRef )
    return accounts
  } catch ( error ) {
    console.log( error )
  }
}

export default {
  initDb,
  createWallet,
  getWallet,
  getAccounts,
  createAccounts,
  createAccount,
  updateAccount,
  updateContact,
  updateWallet,
  getTrustedContacts,
  getS3Services,
  updateS3Services,
}
