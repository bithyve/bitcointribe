import Realm from 'realm'
import schema from './schema'

class Database {
  database: Realm = {
  };

  init() {
    return ( this.database = new Realm( {
      path: 'hexa.realm',
      schema,
      schemaVersion: 1,
    } ) )
  }

  deleteAll( ...args ) {
    return this.database.write( () => this.database.deleteAll( ...args ) )
  }

  delete( ...args ) {
    return this.database.delete( ...args )
  }

  write( ...args ) {
    return this.database.write( ...args )
  }

  create( ...args ) {
    return this.database.create( ...args )
  }

  objects( ...args ) {
    return this.database.objects( ...args )
  }

  // get database() {
  //   return this.database
  // }

}
export default new Database()
