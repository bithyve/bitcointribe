import { useSelector } from 'react-redux'
import { AccountsState } from '../../../../store/reducers/accounts'

const useAccountsState: () => AccountsState = () => useSelector( state => state.accounts )

export default useAccountsState
