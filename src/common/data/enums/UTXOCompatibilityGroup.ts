/**
 * Determines whether or not an account is a compatible for:
 *  - Having another account's transactions re-mapped to it.
 *  - Receiving funds as part of a Send from a separate account.
 */
enum UTXOCompatibilityGroup {
  SINGLE_SIG_PUBLIC = 'SINGLE_SIG_PUBLIC',
  SINGLE_SIG_PRIVATE = 'SINGLE_SIG_PRIVATE',
  MULTI_SIG_PUBLIC = 'MULTI_SIG_PUBLIC',
  MULTI_SIG_PRIVATE = 'MULTI_SIG_PRIVATE',
  TESTNET = 'TESTNET',
}

export default UTXOCompatibilityGroup
