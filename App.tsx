import React from "react";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { composeWithDevTools } from "redux-devtools-extension";

import Navigator from "./src/navigation/Navigator";
import storageReducer from "./src/store/reducers/storage";
import { rootSaga } from "./src/store/sagas/root";

const rootReducer = combineReducers({
  storage: storageReducer
});
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);
sagaMiddleware.run(rootSaga);

export default () => {
  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
};
