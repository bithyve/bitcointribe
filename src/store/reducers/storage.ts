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
  if (database) {
    services.REGULAR_ACCOUNT = RegularAccount.fromJSON(
      database.REGULAR_ACCOUNT
    );
    services.TEST_ACCOUNT = TestAccount.fromJSON(database.TEST_ACCOUNT);
    services.SECURE_ACCOUNT = SecureAccount.fromJSON(database.SECURE_ACCOUNT);
    services.S3_SERVICE = S3Service.fromJSON(database.S3_SERVICE);
    return services;
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
  database: null,
  services: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case DB_INITIALIZED:
      return {
        ...state,
        databaseInitialized: action.payload.initialized
      };

    case DB_FETCHED:
      const newState = {
        ...state,
        database: action.payload.database,
        insertedIntoDB: true
      };
      return {
        ...newState,
        services: setServices(newState)
      };

    case DB_INSERTED:
      const updatedState = {
        ...state,
        database: action.payload.updatedDatabase,
        insertedIntoDB: true
      };
      return {
        ...updatedState,
        services: setServices(updatedState)
      };

    case KEY_FETCHED:
      return {
        ...state,
        key: action.payload.key
      };
  }
  return state;
};
