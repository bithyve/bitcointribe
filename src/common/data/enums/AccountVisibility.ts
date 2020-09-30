enum AccountVisibility {
  /**
  * Always show
  */
  DEFAULT,

  /**
   * Show this account in Duress mode (i.e. when wrong security-question answer is provided).
   */
  DURESS,

  /**
  * Only show after "Show All" is selected and the Security question is correctly answered.
  */
  HIDDEN,

  /**
  * The account is no longer active.
  */
  ARCHIVED,
}

export default AccountVisibility;
