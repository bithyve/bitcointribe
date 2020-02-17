import React from "react";
import Navigator from "./src/navigation/Navigator";
// import DummyNav from "./src/navigation/Dummy-Navigator";
import { store, Provider } from "./src/store";
const prefix = 'hexa://'
export default () => {
  console.disableYellowBox = true;
  return (
    <Provider store={store} uriPrefix={prefix}>
      <Navigator />
    </Provider>
  );
};
