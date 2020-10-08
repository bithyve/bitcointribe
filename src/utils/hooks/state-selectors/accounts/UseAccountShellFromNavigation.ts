import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountShell from './UseAccountShell';


function useAccountShellFromNavigation(navigation: any): AccountShell | undefined {
  const accountID: string = useMemo(() => {
    return navigation.getParam('accountID') || '';
  }, [navigation]);

  return useAccountShell(accountID);
}

export default useAccountShellFromNavigation;
