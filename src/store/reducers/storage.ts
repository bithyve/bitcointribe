import {
  DB_INITIALIZED,
  DB_FETCHED,
  DB_INSERTED,
  KEY_FETCHED
} from "../actions/storage";
import { Database, Services } from "../../common/interfaces/Interfaces";
import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";

const setServices = newState => {
  const { database, services } = newState;
  if (database.accounts) {
    services.REGULAR_ACCOUNT = RegularAccount.fromJSON(
      database.accounts.REGULAR_ACCOUNT
    );
    services.TEST_ACCOUNT = TestAccount.fromJSON(
      database.accounts.TEST_ACCOUNT
    );
    services.SECURE_ACCOUNT = SecureAccount.fromJSON(
      database.accounts.SECURE_ACCOUNT
    );
    services.S3_SERVICE = S3Service.fromJSON(database.accounts.S3_SERVICE);
    newState.services = services;
  }
};

const initialState: {
  databaseInitialized: Boolean;
  insertedIntoDB: Boolean;
  key: String;
  database: Database;
  services: Services;
} = {
  databaseInitialized: false,
  insertedIntoDB: false,
  key: "",
  database: {},
  services: {}
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
      setServices(newState);
      break;
    case DB_INSERTED:
      newState.database = action.payload.updatedDatabase;
      newState.insertedIntoDB = true;
      setServices(newState);
      break;
    case KEY_FETCHED:
      newState.key = action.payload.key;
      break;
  }
  return newState;
};
