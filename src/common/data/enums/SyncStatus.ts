enum SyncStatus {

  /**
   * The shell sub acount balances and transactions have not been refreshed since login.
   */
  PENDING,

  /**
   * The shell sub acount balances and transactions are being refreshed now.
   */
  IN_PROGRESS,

  /**
   * The shell sub acount balances and transactions have been refreshed since login.
   */
  COMPLETED,
}

export default SyncStatus
