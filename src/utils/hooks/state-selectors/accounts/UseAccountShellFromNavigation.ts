import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountShell from './UseAccountShell';


function useAccountShellFromNavigation(navigation: any): AccountShell | undefined {
  const accountShellID: string = useMemo(() => {
    return navigation.getParam('accountShellID') || '';
  }, [navigation]);

  return useAccountShell(accountShellID);
}

export default useAccountShellFromNavigation;
