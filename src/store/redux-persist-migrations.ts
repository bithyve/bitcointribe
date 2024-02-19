/**
 * Migrations for Redux Persist
 * Every migration runs sequentially(from the current version of the persisted state) and introduces changes to the state
 */

import { INITIAL_STATE as NodeSettingsInitialState } from './reducers/nodeSettings'

const migrations = {
// // Reference:
  0: ( state: any ) => {
    return {
      ...state,
      nodeSettings: {
        ...state.nodeSettings,
        defaultNodesSaved: NodeSettingsInitialState.defaultNodesSaved,
        defaultNodes: NodeSettingsInitialState.defaultNodes,
        electrumClientConnectionStatus: NodeSettingsInitialState.electrumClientConnectionStatus
      }
    }
  },
//   1: ( state:any ) => {
//     return {
//       ...state
//     }
//   }
}

export default migrations
