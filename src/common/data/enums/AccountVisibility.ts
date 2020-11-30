enum AccountVisibility {
  /**
  * Always show
  */
  DEFAULT,

  /**
   * Show this account in Duress mode (i.e. when wrong security-question answer
   * is provided).
   *
   * 📝 The idea is for these accounts to serve as decoys. So in terms of visibility,
   * think of it as "Show Despite" being in duress (as opposed to "Show All").
   */
  DURESS,

  /**
  * Only show after "Show All" is selected and the Security question
  * is correctly answered.
  */
  HIDDEN,

  /**
  * The account is no longer active.
  *
  * 📝 Archived accounts will still appear when "Show All" mode is enabled,
  * and functionality will be implemented for un-archiving them from here.
  */
  ARCHIVED,
}

export default AccountVisibility;
