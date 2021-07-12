import { useSelector } from 'react-redux'
import { Trusted_Contacts } from '../../../../bitcoin/utilities/Interface'

function useTrustedContacts(): Trusted_Contacts {
  return useSelector( state => state.trustedContacts.contacts )
}

export default useTrustedContacts
