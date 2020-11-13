import { useMemo } from 'react';
import { ContactRecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing';
import useTrustedContactsState from './UseTrustedContactsState';


export default function useTrustedContactRecipients(): ContactRecipientDescribing[] {
  const trustedContactsState = useTrustedContactsState();

  return useMemo(() => {
    return trustedContactsState.trustedContactRecipients;
  }, [trustedContactsState.trustedContactRecipients]);
}
