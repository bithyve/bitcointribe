import { chain } from 'icepick'
import {
  DB_INITIALIZED,
  DB_FETCHED,
  DB_INSERTED,
  KEY_FETCHED,
} from '../actions/storage';
import { Database } from '../../common/interfaces/Interfaces';

const initialState: {
  databaseInitialized: Boolean;
  insertedIntoDB: Boolean;
  key: String;
  database: Database;
  dbFetched: Boolean;
  databaseSSS: {};
} = {
  databaseInitialized: false,
  insertedIntoDB: false,
  key: '',
  database: { WALLET_SETUP: null, DECENTRALIZED_BACKUP: null },
  dbFetched: false,
  databaseSSS: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case DB_INITIALIZED:
      return chain(state).setIn(["databaseInitialized"], action.payload.initialized).value()


    case DB_FETCHED:
      return chain(state).setIn(['database'], action.payload.database)
        .setIn(['insertedIntoDB'], true)
        .setIn(['dbFetched'], true).value()

    case DB_INSERTED:
      return chain(state).setIn(['database'], {
        ...state.database,
        ...action.payload.updatedEntity,
      }).setIn(['insertedIntoDB'], true).value()

    case KEY_FETCHED:
      return chain(state).setIn(['key'], action.payload.key).value()


  }
  return state;
};
