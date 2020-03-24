// types and action creators: dispatched by components and sagas
export const SHARE_PDF = 'SHARE_PDF';
export const requestSharePdf = (type, item) => {
  return { type: SHARE_PDF, payload: { type, item } };
};

// types and action creators (saga): dispatched by saga workers
export const FETCH_PDF_SHARE_DETAILS = 'FETCH_PDF_SHARE_DETAILS';
export const DBUPDATE_PDF_SEND = 'DBUPDATE_PDF_SEND';
export const PERSONAL_COPY_SHARED = 'PERSONAL_COPY_SHARED';
export const PDF_SHARING_FAILED = 'PDF_SHARING_FAILED';

export const dbUpdatePdfSharing = detials => {
  console.log({ detials });
  return { type: DBUPDATE_PDF_SEND, payload: { ...detials } };
};

export const personalCopyShared = item => {
  return { type: PERSONAL_COPY_SHARED, payload: { item } };
};

export const PDFSharingFailed = isFailed => {
  return { type: PDF_SHARING_FAILED, payload: { isFailed } };
};
