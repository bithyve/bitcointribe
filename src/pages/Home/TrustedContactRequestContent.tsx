import React from 'react'
import TrustedContactRequest from '../Contacts/TrustedContactRequest'
import BottomSheet from '@gorhom/bottom-sheet'
import { DeepLinkEncryptionType } from '../../bitcoin/utilities/Interface'

export interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  trustedContactRequest: any;
  onPressAccept: ( key: any ) => void;
  onPressReject: ( key: any ) => void;
  onPhoneNumberChange: ( key: any ) => void;
}

const TrustedContactRequestContent: React.FC<Props> = ( {
  bottomSheetRef,
  trustedContactRequest,
  onPressAccept,
  onPressReject,
  onPhoneNumberChange,
}: Props ) => {
  if ( !trustedContactRequest ) return
  const { walletName, isKeeper, encryptionType, encryptionHint } = trustedContactRequest

  return (
    <TrustedContactRequest
      inputNotRequired={encryptionType === DeepLinkEncryptionType.DEFAULT }
      inputType={encryptionType}
      isGuardian={isKeeper}
      isRecovery={false}
      hint={encryptionHint}
      bottomSheetRef={bottomSheetRef}
      trustedContactName={walletName}
      onPressAccept={onPressAccept}
      onPressReject={onPressReject}
      onPhoneNumberChange={( text ) => {
        onPhoneNumberChange( text )
      }}
    />
  )
}

export default TrustedContactRequestContent
