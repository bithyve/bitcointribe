// types and action creators: dispatched by components and sagas
export const SHARE_PDF = 'SHARE_PDF';

export const requestSharePdf = type => {
  return { type: SHARE_PDF, payload: type };
};

// types and action creators (saga): dispatched by saga workers
export const FETCH_PDF_SHARE_DETAILS = 'FETCH_PDF_SHARE_DETAILS';
