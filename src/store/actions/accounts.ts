// types and action creators: dispatched by components and sagas
export const FETCH_ADDR = "FETCH_ADDR";

export const fetchAddress = accountType => {
  return { type: FETCH_ADDR, payload: { accountType } };
};

// types and action creators (saga): dispatched by saga workers
export const ADDR_FETCHED = "ADDR_FETCHED";

export const addressFetched = (accountType, address) => {
  return { type: ADDR_FETCHED, payload: { accountType, address } };
};
