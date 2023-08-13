import Realm from 'realm'
import schema from './schema'


class Database  {
  db: Realm

  deleteAll( ...args ) {
    return this.getDb().write( () => this.getDb().deleteAll( ...args ) )
  }

  delete( ...args ) {
    return this.getDb().delete( ...args )
  }

  write( ...args ) {
    return this.getDb().write( ...args )
  }

  create( ...args ) {
    try {
      this.getDb().write( () => {
        const res = this.db.create( ...args )
      } )
    } catch ( error ) {
      console.log( error )
    }
  }

  close() {
    if( this.db ) {
      this.db.close()
    }
  }

  objects( ...args ) {
    try {
      const res = this.getDb().objects( ...args )
      return res
    } catch ( error ) {
      console.log( error )
    }
  }

  getDb() {
    if( this.db ) {
      return this.db
    } else {
      // TODO
    }
  }

  init( key ) {
    Realm.open( {
      schema, schemaVersion: 9, path: 'hexa.realm', encryptionKey: key,
      migration: ( oldRealm, newRealm ) => {
      }
    } )
      .then( ( res ) => {
        this.db = res
        console.log( res )
      } )
      .catch( ( e ) => {
        console.log( e )
      } )
  }
}
export default new Database()
