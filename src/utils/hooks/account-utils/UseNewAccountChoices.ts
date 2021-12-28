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
import { AccountType, Wallet } from '../../../bitcoin/utilities/Interface'
import TestSubAccountInfo from '../../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo'
import useWallet from '../state-selectors/UseWallet'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import config from '../../../bitcoin/HexaConfig'
import LightningSubAccountInfo from '../../../common/data/models/SubAccountInfo/HexaSubAccounts/LightningSubAccountInfo'

const isEnabled = ( accountType: AccountType, wallet: Wallet ) => {
  switch ( accountType ) {
      case AccountType.SAVINGS_ACCOUNT:
        if( !wallet.secondaryXpub && !wallet.details2FA )
          return false
        break
  }

  // check whether the account type has exceeded the maximum number of instances allowed
  const instanceNumber = wallet.accounts[ accountType ]?.length || 0
  const { upperBound } = config.ACCOUNT_INSTANCES[ accountType ]
  if( instanceNumber > ( upperBound - 1 ) ) return false
  else return true
}

type Choices = {
  hexaAccounts: SubAccountDescribing[];
  serviceAccounts: SubAccountDescribing[];
  importedWalletAccounts: SubAccountDescribing[];
};

type Counts = Record<string, number>;

export default function useNewAccountChoices() {
  const accountShells = useActiveAccountShells()
  const wallet = useWallet()

  const hexaAccountCounts: Counts = {
    [ SubAccountKind.SECURE_ACCOUNT ]: 0,
    [ SubAccountKind.REGULAR_ACCOUNT ]: 0,
    [ SubAccountKind.TEST_ACCOUNT ]: 0,
    [ SubAccountKind.DONATION_ACCOUNT ]: 0,
    [ SubAccountKind.LIGHTNING_ACCOUNT ]: 0,
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
        case SubAccountKind.LIGHTNING_ACCOUNT:
          hexaAccountCounts[ SubAccountKind.LIGHTNING_ACCOUNT ] += 1
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
    const hexaAccounts = [
      new CheckingSubAccountInfo( {
        defaultTitle: 'Checking Account',
        defaultDescription: 'User Checking Account',
        visibility: isEnabled( AccountType.CHECKING_ACCOUNT, wallet )? AccountVisibility.DEFAULT: AccountVisibility.HIDDEN,
      } ),
      new SavingsSubAccountInfo( {
        defaultTitle: 'Savings Account',
        defaultDescription: 'User Savings Account',
        visibility: isEnabled( AccountType.SAVINGS_ACCOUNT, wallet )? AccountVisibility.DEFAULT: AccountVisibility.HIDDEN
      } ),
      new DonationSubAccountInfo( {
        defaultTitle: 'Donation Account',
        defaultDescription: 'Receive bitcoin donations',
        doneeName: '',
        causeName: '',
        visibility: isEnabled( AccountType.DONATION_ACCOUNT, wallet )? AccountVisibility.DEFAULT: AccountVisibility.HIDDEN,
      } ),
      new TestSubAccountInfo( {
        defaultTitle: 'Test Account',
        defaultDescription: 'Learn Bitcoin',
        visibility: isEnabled( AccountType.TEST_ACCOUNT, wallet )? AccountVisibility.DEFAULT: AccountVisibility.HIDDEN,
      } ),
      new LightningSubAccountInfo ( {
        defaultTitle: 'Lightning Account',
        defaultDescription: 'User Lightning Account',
        visibility: AccountVisibility.DEFAULT,
      } ),
    ]

    const serviceAccounts = [
      // new ExternalServiceSubAccountInfo( {
      //   instanceNumber: 1,
      //   defaultTitle: 'Collaborative Custody',
      //   defaultDescription: 'Multi-sig Vault with a co-signer',
      //   serviceAccountKind: ServiceAccountKind.COLLABORATIVE_CUSTODY,
      //   type: AccountType.SWAN_ACCOUNT, // TODO: assign appropriate type once activated
      // } ),
      new ExternalServiceSubAccountInfo( {
        instanceNumber: 1,
        defaultTitle: 'F&F Account',
        defaultDescription: 'Account for your contacts',
        serviceAccountKind: ServiceAccountKind.FNF_ACCOUNT,
        type: AccountType.FNF_ACCOUNT, // TODO: assign appropriate type once activated
      } ),
      new ExternalServiceSubAccountInfo( {
        instanceNumber: 1,
        defaultTitle: 'Joint Account',
        defaultDescription: 'MultiSig account with a contact',
        serviceAccountKind: ServiceAccountKind.JOINT_ACCOUNT,
        type: AccountType.SWAN_ACCOUNT, // TODO: assign appropriate type once activated
      } ),
      new ExternalServiceSubAccountInfo( {
        instanceNumber: 1,
        defaultTitle: 'Community Account',
        defaultDescription: 'MultiSig Account for a group',
        serviceAccountKind: ServiceAccountKind.COMMUNITY_ACCOUNT,
        type: AccountType.FNF_ACCOUNT, // TODO: assign appropriate type once activated
      } ),
    ]

    const importedWalletAccounts = [
      new WatchOnlyImportedWalletSubAccountInfo( {
        instanceNumber: 1,
      } ),
      new FullyImportedWalletSubAccountInfo( {
        instanceNumber: 1,
      } ),
    ]

    return {
      hexaAccounts: hexaAccounts.sort( sortHexaAccountChoices ),
      serviceAccounts,
      importedWalletAccounts,
    }
  }, [ wallet ] )
}
