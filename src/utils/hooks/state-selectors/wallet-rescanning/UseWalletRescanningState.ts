import { useSelector } from 'react-redux'
import { WalletRescanningState } from '../../../../store/reducers/wallet-rescanning'

const useWalletRescanningState: () => WalletRescanningState = () => {
  return useSelector( state => state.walletRescanning )
}

export default useWalletRescanningState
