
export const RECREATE_MISSING_ACCOUNTS = 'RECREATE_MISSING_ACCOUNTS'

export const recreateAccounts = () => {
  return {
    type: RECREATE_MISSING_ACCOUNTS
  }
}

export const SWEEP_MISSING_ACCOUNTS = 'SWEEP_MISSING_ACCOUNTS'

export const sweepMissingAccounts = () => {
  return {
    type: SWEEP_MISSING_ACCOUNTS
  }
}


