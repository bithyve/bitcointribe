import { useSelector } from 'react-redux'
import { RescannedTransactionData } from '../../../../store/reducers/wallet-rescanning'

const useFoundTransactionsFromReScan: () => RescannedTransactionData[] = () => {
  return useSelector( state => state.walletRescanning.foundTransactions )
}

export default useFoundTransactionsFromReScan
