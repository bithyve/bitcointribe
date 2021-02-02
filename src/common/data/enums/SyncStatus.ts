enum SyncStatus {

  /**
   * The shell sub account balances and transactions have not been refreshed since login.
   */
  PENDING = 'PENDING',

  /**
   * The shell sub account balances and transactions are being refreshed now.
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * The shell sub account balances and transactions have been refreshed since login.
   */
  COMPLETED = 'COMPLETED',
}

export default SyncStatus
