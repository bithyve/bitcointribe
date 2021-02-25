import UTXOCompatibilityGroup from '../../../../common/data/enums/UTXOCompatibilityGroup'
import AccountShell from '../../../../common/data/models/AccountShell'
import useAccountsState from './UseAccountsState'
import { useMemo } from 'react'
import CheckingSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import BitcoinUnit from '../../../../common/data/enums/BitcoinUnit'
import SavingsSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import TestSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo'

const sampleShellsForTestingTransactionReassignment: AccountShell[] = [
  new AccountShell( {
    primarySubAccount: new CheckingSubAccountInfo( {
    } ),
    unit: BitcoinUnit.SATS,
  } ),
  new AccountShell( {
    primarySubAccount: new SavingsSubAccountInfo( {
    } ),
    unit: BitcoinUnit.SATS,
  } ),
  new AccountShell( {
    primarySubAccount: new TestSubAccountInfo( {
    } ),
    unit: BitcoinUnit.TSATS,
  } ),
]


function useAccountShellsInUTXOCompatibilityGroup( utxoCompatibilityGroup: UTXOCompatibilityGroup ): AccountShell[] {
  const accountsState = useAccountsState()

  return useMemo( () => {
    return accountsState
      .accountShells
      // .concat(sampleShellsForTestingTransactionReassignment)
      .filter( shell => AccountShell.getUTXOCompatibilityGroup( shell ) == utxoCompatibilityGroup )
  }, [ accountsState.accountShells ] )
}

export default useAccountShellsInUTXOCompatibilityGroup
