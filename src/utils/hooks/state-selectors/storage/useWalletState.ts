import { useSelector } from 'react-redux'
import { Wallet } from '../../../../bitcoin/utilities/Interface'

function useWalletState( ): Wallet {
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  return wallet
}

export default useWalletState
