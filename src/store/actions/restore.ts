export const GET_SPLITED_DATA = 'GET_SPLITED_DATA'
export const GET_METADATA = 'GET_METADATA'
export const SPLITED_DATA = 'SPLITED_DATA'

export const getSplitedMetaData = (data) => {
  return {
      type: SPLITED_DATA,
      payload: data
  }
}

export const requestSplitedMetaData = ( requester ) =>  {
// console.log('requestSplitedMetaData >>>', requester);
  return {
    type: GET_METADATA,
    payload: { requester }
  }
  
  }