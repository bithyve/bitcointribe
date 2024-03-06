import db from './realm'
import schema from './schema/Schema'
//import { Account } from '../../bitcoin/utilities/Interface'

const initDb = async ( key ) => {
  await db.init( key )
}

const createWallet = async ( wallet ) => {
  const data = {
    walletId: wallet.walletId,
    walletName: wallet.walletName,
    primaryMnemonic: wallet.primaryMnemonic,
    borderWalletMnemonic: wallet.borderWalletMnemonic,
    borderWalletGridType: wallet.borderWalletGridType
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
  if( wallet.primarySeed ) {
    data.primarySeed = wallet.primarySeed
  }
  try {
    db.create( schema.Wallet, data, true )
    return true
  } catch ( error ) {
    return false
  }
}

const createAccounts = accounts => {
  try {
    for ( const [ key1, account ] of Object.entries( accounts ) ) {
      createAccount ( account )
    }
  } catch ( error ) {
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
    // error
  }
}

const createAccount = async ( account ) => {
  try {
    const data = {
      ...account,
    }
    if( account.activeAddresses ) {
      data.activeAddresses = getActiveAddresses( account.activeAddresses )
    }
    if( account.transactionsNote && Object.keys( account.transactionsNote ).length > 0 ) {
      const notes = []
      for ( const [ key, value ] of Object.entries( account.transactionsNote ) ) {
        notes.push( {
          txId: key,
          note: value
        } )
      }
      data.transactionsNote = notes
    } else {
      data.transactionsNote = []
    }
    if( data.txIdMap ){
      if( Object.keys( data.txIdMap ).length === 0 ) {
        delete data.txIdMap
      } else {
        const map = []
        for ( const [ key, value ] of Object.entries( data.txIdMap ) ) {
          map.push( {
            id: key,
            txIds: value.txIds
          } )
        }
        data.txIdMap = map
      }
    }
    db.create( schema.Account, {
      ...data
    }, true )
  } catch ( error ) {
    // error
  }
}

const updateAccount = async ( accountId, account ) => {
  try {
    let acccountRef = db.objects( schema.Account ).filtered( `id = "${accountId}"` )
    const data = {
      ...account,
    }
    if( account.activeAddresses ) {
      data.activeAddresses = getActiveAddresses( account.activeAddresses )
    }
    if( Object.keys( account.transactionsNote ).length > 0 ) {
      const notes = []
      for ( const [ key, value ] of Object.entries( account.transactionsNote ) ) {
        notes.push( {
          txId: key,
          note: value
        } )
      }
      data.transactionsNote = notes
    } else {
      data.transactionsNote = []
    }
    if( data.txIdMap ){
      if( Object.keys( data.txIdMap ).length === 0 ) {
        delete data.txIdMap
      } else {
        const map = []
        for ( const [ key, value ] of Object.entries( data.txIdMap ) ) {
          map.push( {
            id: key,
            txIds: value.txIds
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

    acccountRef = data
    db.create( schema.Account, acccountRef, true )  }
  catch ( error ) {
  //  error
  }
}

const getActiveAddresses = ( activeAddresses ) => {
  try {
    const aa = {
      internal: [],
      external: []
    }
    if( Object.keys( activeAddresses.external ).length > 0 ) {
      aa.external = getActiveAddress( activeAddresses.external )
    }
    if( Object.keys( activeAddresses.internal ).length > 0 ) {
      aa.internal = getActiveAddress( activeAddresses.internal )
    }
    return aa
  } catch ( error ) {
    return []
  }
}

const getActiveAddress = ( address ) => {
  try {
    const addresses = []
    for ( const [ key, value ] of Object.entries( address ) ) {
      const obj = {
        address: key,
        index: value.index,
        assignee: {
          type: value.assignee.type,
          id: value.assignee.id,
        },
      }
      if( value.assignee.senderInfo ) {
        obj.assignee.senderInfo = value.assignee.senderInfo
      }
      if( value.assignee.recipientInfo ) {
        const recipientInfo = []
        for ( const [ txid, recipient ] of Object.entries( value.assignee.recipientInfo ) ) {
          recipientInfo.push( {
            txid,
            recipient,
          } )
        }
        obj.assignee.recipientInfo = recipientInfo
      }
      addresses.push( obj )
    }
    return addresses
  } catch ( error ) {
    return []
  }
}


const updateTransaction = async ( txId: string, params: object ) => {
  try {
    const txRef = db.objects( schema.Transaction ).filtered( `txid = "${txId}"` )
    if( txRef.length > 0 ) {
      db.write( ()=> {
        for ( const [ key, value ] of Object.entries( params ) ) {
          txRef[ 0 ][ key ] = value
        }
      } )
    }
  } catch ( error ) {
    // error
  }
}

const updateTransactions = async ( txIds: string[], params: object ) => {
  try {
    const idsQuery = txIds.map( id => `txid = "${id}"` ).join( ' OR ' )
    const txRef = db.objects( schema.Transaction ).filtered( idsQuery.toString() )
    if( txRef.length > 0 ) {
      db.write( ()=> {
        txRef.forEach( tx => {
          for ( const [ key, value ] of Object.entries( params ) ) {
            tx[ key ] = value
          }
        } )
      } )
    }
  } catch ( error ) {
  //  error
  }
}

const markAccountChecked = async ( accountId: string ) => {
  try {
    const acccountRef = db.objects( schema.Account ).filtered( `id = "${accountId}"` )
    if( acccountRef.length > 0 ) {
      db.write( ()=> {
        acccountRef[ 0 ].hasNewTxn = false
      } )
    }
  } catch ( error ) {
    // error
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
    data.unencryptedPermanentChannel = unencryptedPermanentChannel
    db.create( schema.TrustedContact, data, true )
    return true
  } catch ( error ) {
    return false
  }
}

const updateBHR = async ( data ) => {
  try {
    const dbRef = db.objects( schema.BHR )
    if( dbRef && dbRef.length ){
      db.write( () => {
        dbRef[ 0 ][ 'metaSharesKeeper' ] = data.metaSharesKeeper
        dbRef[ 0 ][ 'oldMetaSharesKeeper' ] = data.oldMetaSharesKeeper
      } )
    } else db.create( schema.BHR, data, true )
    return true
  } catch ( error ) {
    return false
  }
}

const createGifts = async ( gifts ) => {
  try {
    gifts.forEach( gift => {
      createGift( gift )
    } )
  } catch ( error ) {
    // error
  }
}

const createGift = async ( gift ) => {
  try {
    db.create( schema.Gifts, gift, true )
    return true
  } catch ( error ) {
    // error
  }
}

const updateGift = ( id, gift  ) => {
  try {
    let giftRef = db.objects( schema.Gifts ).filtered( `id = "${id}"` )
    if( giftRef.length > 0 ) {
      db.write( ()=> {
        giftRef = gift
      } )
    }
    //db.create( schema.Gifts, gift, true )
    return true
  } catch ( error ) {
    // error
  }
}

const getMetaShares = () => {
  // deprecated(to be only used by upgrade script)
  try {
    const dbRef = db.objects( schema.BHR )
    const bhr = Array.from( dbRef )
    if( bhr && bhr.length > 0 ) {
      return bhr[ 0 ]
    } else {
      return {
        metaSharesKeeper: [],
        oldMetaSharesKeeper:[],
      }
    }
  } catch ( error ) {
    // error
  }
}

const getSecondaryMnemonicShare = () => {
  // deprecated(to be only used by upgrade script)
  const walletsRef = db.objects( schema.Wallet )
  const wallets = Array.from( walletsRef )
  return ( wallets[ 0 ] as any ).smShare
}

const getWallet = () => {
  try {
    // deprecated(to be only used by upgrade script)
    const walletsRef = db.objects( schema.Wallet )
    const wallets = Array.from( walletsRef )
    return ( wallets[ 0 ] as any )
  } catch ( error ) {
    // error
  }
}

export default {
  initDb,
  createWallet,
  createAccounts,
  createAccount,
  updateAccount,
  updateContact,
  updateWallet,
  updateBHR,
  markAccountChecked,
  updateTransaction,
  updateTransactions,
  createGifts,
  createGift,
  updateGift,
  getMetaShares,
  getSecondaryMnemonicShare,
  getWallet
}
