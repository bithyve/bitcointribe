import { useSelector } from 'react-redux';
import { TrustedContactsState } from '../../../../store/reducers/trustedContacts';

function useTrustedContactsState(): TrustedContactsState {
  return useSelector(state => state.trustedContacts);
}

export default useTrustedContactsState;
