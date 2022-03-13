
export const RECREATE_MISSING_ACCOUNTS = 'RECREATE_MISSING_ACCOUNTS'

export const recreateAccounts = () => {
  return {
    type: RECREATE_MISSING_ACCOUNTS
  }
}

export const SWEEP_MISSING_ACCOUNTS = 'SWEEP_MISSING_ACCOUNTS'

export const sweepMissingAccounts = ( { address, token }: { address: string, token?: number } ) => {
  return {
    type: SWEEP_MISSING_ACCOUNTS,
    payload: {
      address,
      token
    }
  }
}


