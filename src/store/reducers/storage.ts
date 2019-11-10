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
  // database: {
  //   // develop an evolutionary schema for the database
  //   wallet_name: null,
  //   security_ans: null,
  //   regular_acc: null,
  //   secure_acc: null,
  //   S3_service: null
  // }
  database: {
    titles: []
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
