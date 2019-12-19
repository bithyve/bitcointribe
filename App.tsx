import React from "react";
import Navigator from "./src/navigation/Navigator";
// import DummyNav from "./src/navigation/Dummy-Navigator";
import { store, Provider } from "./src/store";

export default () => {
  console.disableYellowBox = true;

  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
};
