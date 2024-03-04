import { call, put, select } from 'redux-saga/effects'
import { RGBConfig } from '../../bitcoin/utilities/Interface'
import RGBServices from '../../services/RGBServices'
import { RECEIVE_RGB_ASSET, setNextFreeAddress, setReceiveData, setRgb121Assets, setRgb20Assets, setRgbOnchainBalances, setRgbSyncing, setRgbTxns, SYNC_RGB } from '../actions/rgb'
import { createWatcher } from '../utils/utilities'

export function* syncRgbWorker(  ) {
  try{
    yield put( setRgbSyncing( true ) )
    const { mnemonic, xpub }: RGBConfig = yield select( state => state.rgb.config )
    const address = yield call( RGBServices.getAddress, mnemonic )
    if( address ) yield put( setNextFreeAddress( address ) )
    // const sync = yield call( RGBServices.sync, mnemonic )
    const balances = yield call( RGBServices.getBalance, mnemonic )
    if( balances ) yield put( setRgbOnchainBalances( balances ) )
    const transactions = yield call( RGBServices.getTransactions, mnemonic )
    yield put( setRgbTxns( transactions ) )
    const assets = yield call( RGBServices.syncRgbAssets, mnemonic, xpub )
    if( assets.nia ) yield put( setRgb20Assets( assets.nia ) )
    if( assets.cfa ) yield put( setRgb121Assets( assets.cfa ) )
    yield put( setRgbSyncing( false ) )
  }
  catch( err ){
    yield put( setRgbSyncing( false ) )
  }
}

export const rgbSyncWatcher = createWatcher(
  syncRgbWorker,
  SYNC_RGB,
)

export function* receiveRgbAssetWorker(  ) {
  const { receiveAssets } = yield select( state => state.rgb )
  const { mnemonic }: RGBConfig = yield select( state => state.rgb.config )

  try{
    yield put( setReceiveData( {
      message: '',
      loading: true,
      isError: false,
      data:receiveAssets.data
    } ) )

    const invoiceData = yield call( RGBServices.receiveAsset, mnemonic )

    if( invoiceData.error ) {
      yield put( setReceiveData( {
        message: invoiceData.error,
        loading: false,
        isError: true,
        data:receiveAssets.data
      } ) )
    } else {
      yield put( setReceiveData( {
        message: '',
        loading: false,
        isError: false,
        data:invoiceData
      } ) )
    }
  }
  catch( err ){
    yield put( setReceiveData( {
      message: 'Failed to generate invoice',
      loading: false,
      isError: true,
      data:receiveAssets.data
    } ) )
  }
}

export const receiveRgbAssetWatcher = createWatcher(
  receiveRgbAssetWorker,
  RECEIVE_RGB_ASSET,
)
