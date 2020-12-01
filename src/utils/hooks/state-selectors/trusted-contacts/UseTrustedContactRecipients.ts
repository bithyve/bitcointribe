import { useMemo } from 'react';
import { ContactRecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing';
import useTrustedContactsState from './UseTrustedContactsState';
import { sampleContactRecipients } from '../../../../pages/Accounts/Send/temporary-preview-data';



export default function useTrustedContactRecipients(): ContactRecipientDescribing[] {
  const trustedContactsState = useTrustedContactsState();

  return useMemo(() => {
    // return trustedContactsState.trustedContactRecipients;
    return sampleContactRecipients;
  }, [trustedContactsState.trustedContactRecipients]);
}
