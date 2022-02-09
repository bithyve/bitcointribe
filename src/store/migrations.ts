<<<<<<< HEAD
//write reducer imports
import { initialState as accountReducerState } from './reducers/accounts'

const migrations:any = {
  0: ( state:any ) => {
    //do something
  },
=======
const migrations = {
//   0: ( state: any ) => {
//     console.log( 'migration state', state )
//     return {
//       ...state,
//       accounts: {
//         ...state.accounts,
//         myIdExists: false
//       }
//     }
//   },
//   1: ( state:any ) => {
//     return {
//       ...state
//     }
//   }
>>>>>>> feature/2.0.70
}

export default migrations
