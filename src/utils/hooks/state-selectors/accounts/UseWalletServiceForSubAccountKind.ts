import SubAccountKind from '../../../../common/data/enums/SubAccountKind';
import RegularAccount from '../../../../bitcoin/services/accounts/RegularAccount';
import TestAccount from '../../../../bitcoin/services/accounts/TestAccount';
import SecureAccount from '../../../../bitcoin/services/accounts/SecureAccount';
import BaseAccount from '../../../../bitcoin/utilities/accounts/BaseAccount';


export default function useWalletServiceForSubAccountKind(subAccountKind: SubAccountKind) {
  switch (subAccountKind) {
    case SubAccountKind.TEST:
      return TestAccount;
    case SubAccountKind.REGULAR:
      return RegularAccount;
    case SubAccountKind.SECURE:
      return SecureAccount;
    default:
      return BaseAccount;
  }
}
