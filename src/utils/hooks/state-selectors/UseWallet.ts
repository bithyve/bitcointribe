import { useSelector } from 'react-redux'
import { Wallet } from '../../../bitcoin/utilities/Interface'

const useWallet: () => Wallet = () => useSelector( state => state.storage.wallet )
export default useWallet
