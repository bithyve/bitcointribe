import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import useActiveAccountPayload from './UseActiveAccountPayload';


function useAccountPayloadFromNavigation(navigation: any): AccountPayload | undefined {
  const accountID: string = useMemo(() => {
    return navigation.getParam('accountID') || '';
  }, [navigation]);

  return useActiveAccountPayload(accountID);
}

export default useAccountPayloadFromNavigation;
