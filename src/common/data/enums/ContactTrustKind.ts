enum ContactTrustKind {

  /**
   * This contact can help the user restore their wallet.
   */
  KEEPER_OF_USER,

  /**
   * The user can help this contact restore their wallet.
   */
  USER_IS_KEEPING,

  /**
   * This contact can be paid directly, but can't participate in restoring
   * the user's wallet (or vice-versa).
   */
  OTHER,
}

export default ContactTrustKind
