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
        //console.log( 'created', res )
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
      //console.log( 'objects$$$$', Array.from( res ) )
      return res
    } catch ( error ) {
      console.log( error )
    }
  }

  getDb() {
    if( this.db ) {
      return this.db
    } else {
      Realm.open( {
        schema, schemaVersion: 1, path: 'hexa.realm',
      } )
        .then( ( res ) => {
          this.db = res
          return res
        } )
        .catch( ( e ) => console.log( e ) )
    }
  }

  init() {
    Realm.open( {
      schema, schemaVersion: 1, path: 'hexa.realm',
    } )
      .then( ( res ) => {
        this.db = res
        console.log( res )
      } )
      .catch( ( e ) => console.log( e ) )
  }
}
export default new Database()
