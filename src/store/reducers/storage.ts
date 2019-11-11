import {
  DB_INITIALIZED,
  DB_FETCHED,
  DB_INSERTED,
  KEY_FETCHED
} from "../actions/storage";

const initialState = {
  databaseInitialized: false,
  insertedIntoDB: false,
  key: "",
  database: {
    // develop an evolutionary schema for the database
  }
};

export default (state = initialState, action) => {
  const newState = { ...state };
  switch (action.type) {
    case DB_INITIALIZED:
      newState.databaseInitialized = action.payload.initialized;
      break;
    case DB_FETCHED:
      newState.database = action.payload.database;
      newState.insertedIntoDB = true;
      break;
    case DB_INSERTED:
      newState.database = action.payload.updatedDatabase;
      newState.insertedIntoDB = true;
      break;
    case KEY_FETCHED:
      newState.key = action.payload.key;
      break;
  }
  return newState;
};
