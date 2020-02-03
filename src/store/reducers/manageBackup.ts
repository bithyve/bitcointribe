import {
  FETCH_PDF_SHARE_DETAILS,
  PERSONAL_COPY_SHARED,
} from '../actions/manageBackup';

const initialState = {
  shareDetails: {},
  shared: {
    personalCopy1: false,
    personalCopy2: false,
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
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
    case PERSONAL_COPY_SHARED:
      const item = action.payload.item;
      if (item.type === 'copy1')
        return {
          ...state,
          shared: {
            ...state.shared,
            personalCopy1: true,
          },
        };
      if (item.type === 'copy2')
        return {
          ...state,
          shared: {
            ...state.shared,
            personalCopy2: true,
          },
        };
  }
  return state;
};
