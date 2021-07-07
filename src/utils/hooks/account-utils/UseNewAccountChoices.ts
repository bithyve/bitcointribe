import { useCallback, useMemo } from 'react'
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind'
import DonationSubAccountInfo from '../../../common/data/models/SubAccountInfo/DonationSubAccountInfo'
import ExternalServiceSubAccountInfo from '../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import CheckingSubAccountInfo from '../../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import SavingsSubAccountInfo from '../../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import FullyImportedWalletSubAccountInfo from '../../../common/data/models/SubAccountInfo/ImportedWalletSubAccounts/FullyImportedWalletSubAccountInfo'
import WatchOnlyImportedWalletSubAccountInfo from '../../../common/data/models/SubAccountInfo/ImportedWalletSubAccounts/WatchOnlyImportedWalletSubAccountInfo'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import useActiveAccountShells from '../state-selectors/accounts/UseActiveAccountShells'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import { AccountType } from '../../../bitcoin/utilities/Interface'

type Choices = {
  hexaAccounts: SubAccountDescribing[];
  serviceAccounts: SubAccountDescribing[];
  importedWalletAccounts: SubAccountDescribing[];
};

type Counts = Record<string, number>;

export default function useNewAccountChoices() {
  const accountShells = useActiveAccountShells()

  const hexaAccountCounts: Counts = {
    [ SubAccountKind.SECURE_ACCOUNT ]: 0,
    [ SubAccountKind.REGULAR_ACCOUNT ]: 0,
    [ SubAccountKind.TEST_ACCOUNT ]: 0,
    [ SubAccountKind.DONATION_ACCOUNT ]: 0,
  }

  accountShells.forEach( ( shell ) => {
    switch ( shell.primarySubAccount.kind ) {
        case SubAccountKind.TEST_ACCOUNT:
          hexaAccountCounts[ SubAccountKind.TEST_ACCOUNT ] += 1
          break
        case SubAccountKind.REGULAR_ACCOUNT:
          hexaAccountCounts[ SubAccountKind.REGULAR_ACCOUNT ] += 1
          break
        case SubAccountKind.SECURE_ACCOUNT:
          hexaAccountCounts[ SubAccountKind.SECURE_ACCOUNT ] += 1
          break
        case SubAccountKind.DONATION_ACCOUNT:
          hexaAccountCounts[ SubAccountKind.DONATION_ACCOUNT ] += 1
          break
        default:
          break
    }
  } )

  const sortHexaAccountChoices = useCallback( ( subAccountA, _subAccountB ) => {
    if ( hexaAccountCounts[ subAccountA.kind ] == 0 ) {
      return -1
    } else {
      return 1
    }
  }, [ accountShells ] )

  return useMemo( () => {
    return {
      hexaAccounts: [
        new CheckingSubAccountInfo( {
          defaultTitle: 'Checking Account',
          defaultDescription: 'User Checking Account'
        } ),
        new SavingsSubAccountInfo( {
          defaultTitle: 'Savings Account',
          defaultDescription: 'User Savings Account'
        } ),
        new DonationSubAccountInfo( {
          defaultTitle: 'Donation Account',
          defaultDescription: 'Accept donations',
          doneeName: '',
          causeName: '',
        } ),
      ].sort( sortHexaAccountChoices ),

      serviceAccounts: [
        new ExternalServiceSubAccountInfo( {
          instanceNumber: 1,
          defaultTitle: 'Collaborative Custody',
          defaultDescription: 'Multi-sig Vault with a co-signer',
          serviceAccountKind: ServiceAccountKind.COLLABORATIVE_CUSTODY,
          type: AccountType.SWAN_ACCOUNT, // TODO: assign appropriate type once activated
        } ),
      ],

      importedWalletAccounts: [
        new WatchOnlyImportedWalletSubAccountInfo( {
          instanceNumber: 1,
        } ),
        new FullyImportedWalletSubAccountInfo( {
          instanceNumber: 1,
        } ),
      ],
    }
  }, [] )
}
