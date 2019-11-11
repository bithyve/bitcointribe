import { ADDR_FETCHED } from "../actions/accounts";

const initialState = {
  REGULAR_ACCOUNT: {
    address: ""
  },
  TEST_ACCOUNT: {},
  SECURE_ACCOUNT: {}
};

export default (state = initialState, action) => {
  const newState = { ...state };
  switch (action.type) {
    case ADDR_FETCHED:
      newState[action.payload.accountType].address = action.payload.address;
      break;
  }
  return newState;
};
