/**
 * Determines whether or not an account is a compatible destination
 * for re-mapping another account's transactions.
 */
enum TransactionGroup {
  SINGLE_SIG_PUBLIC,
  SINGLE_SIG_PRIVATE,
  MULTI_SIG_PUBLIC,
  MULTI_SIG_PRIVATE,
  TESTNET,
}

export default TransactionGroup
