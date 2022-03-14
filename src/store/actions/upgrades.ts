import { Accounts } from '../../bitcoin/utilities/Interface'

export const RECREATE_MISSING_ACCOUNTS = 'RECREATE_MISSING_ACCOUNTS'
export const SYNC_MISSING_ACCOUNTS = 'SYNC_MISSING_ACCOUNTS'
export const UPDATE_SYNCHED_MISSING_ACCOUNTS = 'UPDATE_SYNCHED_MISSING_ACCOUNTS'
export const SWEEP_MISSING_ACCOUNTS = 'SWEEP_MISSING_ACCOUNTS'

export const recreateAccounts = () => {
  return {
    type: RECREATE_MISSING_ACCOUNTS
  }
}

export const syncMissingAccounts = ( ) => {
  return {
    type: SYNC_MISSING_ACCOUNTS,
  }
}

export const updateSynchedMissingAccount = ( synchedMissingAccounts: Accounts ) => {
  return {
    type: UPDATE_SYNCHED_MISSING_ACCOUNTS,
    payload: {
      synchedMissingAccounts
    }
  }
}

export const sweepMissingAccounts = ( { address, token }: { address: string, token?: number } ) => {
  return {
    type: SWEEP_MISSING_ACCOUNTS,
    payload: {
      address,
      token
    }
  }
}



