import React from "react";
import Navigator from "./src/navigation/Navigator";
import { store, Provider } from "./src/store";

export default () => {
  console.disableYellowBox = true;
  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
};
