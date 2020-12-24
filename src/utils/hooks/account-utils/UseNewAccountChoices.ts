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

  return useMemo<Choices>( () => {
    return {
      hexaAccounts: [
        // 📝 Holding off on allowing multiple test accounts for now.
        // (See: https://github.com/bithyve/hexa/issues/2236#issuecomment-743180907)
        // new TestSubAccountInfo({
        //   defaultTitle: `Test Account${
        //     hexaAccountCounts[SubAccountKind.TEST_ACCOUNT] > 0 ?
        //     ` ${hexaAccountCounts[SubAccountKind.TEST_ACCOUNT] + 1}`
        //     : ''
        //   }`,
        // }),
        new CheckingSubAccountInfo( {
          defaultTitle: `Checking Account${hexaAccountCounts[ SubAccountKind.REGULAR_ACCOUNT ] > 0 ?
            ` ${hexaAccountCounts[ SubAccountKind.REGULAR_ACCOUNT ] + 1}`
            : ''
          }`,
        } ),
        new SavingsSubAccountInfo( {
          defaultTitle: `Savings Account${
            hexaAccountCounts[ SubAccountKind.SECURE_ACCOUNT ] > 0 ?
              ` ${hexaAccountCounts[ SubAccountKind.SECURE_ACCOUNT ] + 1}`
              : ''
          }`,
        } ),
        new DonationSubAccountInfo( {
          defaultTitle: `Donation Account${
            hexaAccountCounts[ SubAccountKind.DONATION_ACCOUNT ] > 0 ?
              ` ${hexaAccountCounts[ SubAccountKind.DONATION_ACCOUNT ] + 1}`
              : ''
          }`,
          defaultDescription: 'Directly Accept Donations',
          doneeName: '',
          causeName: '',
        } ),
      ].sort( sortHexaAccountChoices ),

      serviceAccounts: [
        new ExternalServiceSubAccountInfo( {
          instanceNumber: 1,
          defaultTitle: 'Swan Bitcoin',
          defaultDescription: 'Stack Sats with Swan',
          serviceAccountKind: ServiceAccountKind.SWAN,
        } ),
        new ExternalServiceSubAccountInfo( {
          instanceNumber: 1,
          defaultTitle: 'FastBitcoins.com',
          defaultDescription: 'Use FastBitcoin Vouchers',
          serviceAccountKind: ServiceAccountKind.FAST_BITCOINS,
        } ),
        new ExternalServiceSubAccountInfo( {
          instanceNumber: 1,
          defaultTitle: 'Whirlpool Account',
          defaultDescription: 'Powered by Samurai',
          serviceAccountKind: ServiceAccountKind.WHIRLPOOL,
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
