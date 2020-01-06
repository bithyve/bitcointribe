import { FETCH_PDF_SHARE_DETAILS } from '../actions/manageBackup';

const initialState = {
  shareDetails: {},
};

export default ( state = initialState, action ) => {
  switch ( action.type ) {
    case FETCH_PDF_SHARE_DETAILS:
      const shareDetials = {
        ...state,
        res: {
          ...action.payload.database,
        },
      };
      return {
        ...shareDetials,
      };
  }
  return state;
};
