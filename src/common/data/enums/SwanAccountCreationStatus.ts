enum SwanAccountCreationStatus {

  /**
   * Swan account creation has not started from either buy menu or add new account page.
   */
  NOT_INITIATED = 'NOT_INITIATED',

  /**
   * Add new account option has been used for Swan account creation
   */
  ADD_NEW_ACCOUNT_INITIATED = 'ADD_NEW_ACCOUNT_INITIATED',

  /**
   * Buy menu option has been used for Swan account creation
   */
  BUY_MENU_CLICKED = 'BUY_MENU_CLICKED',

  /**
   * User needs to login to Swan to authenticate.
   */
  INITIAL_USER_AUTHENTICATION_IN_PROGRESS = 'INITIAL_USER_AUTHENTICATION_IN_PROGRESS',

  /**
   * User has authenticated on Swan site and redirected back to Hexa
  */
  ROUTED_BACK_FROM_SWAN = 'ROUTED_BACK_FROM_SWAN',

  /**
   * Hexa has created a Swan account and a withdrawal wallet on Swan
  */
  WITHDRAWAL_WALLET_CREATED = 'WITHDRAWAL_WALLET_CREATED',

  /**
   * Hexa account Swan wallet have been linked
  */
  WALLET_LINKED_SUCCESSFULLY = 'WALLET_LINKED_SUCCESSFULLY',

  /**
   * Error encountered
  */
  ERROR = 'ERROR',
}

export default SwanAccountCreationStatus
