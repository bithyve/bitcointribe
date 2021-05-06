import {
  SPLITED_DATA,
} from '../actions/restore'
export interface QRcodes {
    index: number,
    share: string,
    // requester: string,
    // publicKey: string
    // info: [],
    // uploadedAt: number
    // type: string,
    // ver: string,
    totalCode: number,
    AnimatedQR: boolean
  }
  const initialState: {
    multipleQr: QRcodes[],
  }= {
    multipleQr: []
  }

  export default ( state = initialState, { type, payload } ) => {
    switch ( type ) {
        case SPLITED_DATA:
          return {
            ...state,
            multipleQr: payload,
          }
  
        default:
          return state
    }
  }