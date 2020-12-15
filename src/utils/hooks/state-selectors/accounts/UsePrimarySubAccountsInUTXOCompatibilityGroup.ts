import UTXOCompatibilityGroup from '../../../../common/data/enums/UTXOCompatibilityGroup';
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces';
import useAccountShellsInUTXOCompatibilityGroup from './UseAccountShellsInUTXOCompatibilityGroup';
import { useMemo } from 'react';


export default function usePrimarySubAccountsInUTXOCompatibilityGroup(
  utxoCompatibilityGroup: UTXOCompatibilityGroup,
): SubAccountDescribing[] {
  const accountShells = useAccountShellsInUTXOCompatibilityGroup(utxoCompatibilityGroup);

  return useMemo(() => {
    return accountShells.map(shell => shell.primarySubAccount);
  }, [accountShells]);
}

