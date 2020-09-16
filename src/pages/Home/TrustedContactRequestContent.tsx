import React from 'react';
import TrustedContactRequest from '../Contacts/TrustedContactRequest';
import BottomSheet from 'reanimated-bottom-sheet';

export interface Props {
  bottomSheetRef: React.Ref<BottomSheet>;
  trustedContactRequest: any;
  recoveryRequest: any;
  onPressAccept: (key: any) => void;
  onPressReject: (key: any) => void;
  onPhoneNumberChange: (key: any) => void;
  isRequestModalOpened: boolean;
}

const TrustedContactRequestContent: React.FC<Props> = ({
  bottomSheetRef,
  trustedContactRequest,
  recoveryRequest,
  onPressAccept,
  onPressReject,
  onPhoneNumberChange,
  isRequestModalOpened,
}: Props) => {
  if (!trustedContactRequest && !recoveryRequest) return;

  let { requester, hintType, hint, isGuardian, isQR, isRecovery } =
    trustedContactRequest || recoveryRequest;

  return (
    <TrustedContactRequest
      isRequestModalOpened={isRequestModalOpened}
      isQR={isQR}
      inputType={
        hintType === 'num' ? 'phone' : hintType === 'eml' ? 'email' : null
      }
      isGuardian={isGuardian}
      isRecovery={isRecovery}
      hint={hint}
      bottomSheetRef={bottomSheetRef}
      trustedContactName={requester}
      onPressAccept={(key) => onPressAccept(key)}
      onPressReject={(key) => {
        onPressReject(key);
      }}
      onPhoneNumberChange={(text) => {
        onPhoneNumberChange(text);
      }}
    />
  );
};

export default TrustedContactRequestContent;
