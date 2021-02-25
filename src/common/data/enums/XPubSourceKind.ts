enum XPubSourceKind {

  /**
   * An xPub that is associated to a known, specific source (e.g.: a
   * service or a contact).
   */
  DESIGNATED,

  /**
   * An xPub that does not have a known source (e.g.: Checking Account xPubs).
   * These xPubs can receive funds from any source.
   */
  ANONYMOUS,
}


export default XPubSourceKind
