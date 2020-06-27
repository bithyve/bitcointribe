export const ErrMap = {
  // Error Series 000: Generic Errors
  0o0: "Failed to get account Id", // getAccountId() >> supplies account Id
  0o1: "Unable to generate receiving address", // getAddress() >> provides receiving address
  0o2: "Fetch balance failed", // getBalance() >> provides balance
  0o3: "Unable to get transactions for your wallet", // getTransactions() >> provides tranasctions corresponding to the wallet
  0o4: "Unable to get the details for this transaction", // getTransactionDetails() >> provides details against a given txHash
  0o5: "Unable to fund the wallet with testcoins", // getTestcoins() >> provides testnet bitcoins
  0o6: "Insufficient balance to compensate for transfer amount and the txn fee", // transferST1() >> creates transacstion

  // Error Series 100: Regular(& Test) Account Errors
  101: "Failed to get mnemonic", // getMnemonic() >> supplied mnemonic
  102: "Failed to get wallet Id", // getWalletId() >> supplies wallet Id
  103: "Unable to generate Payment URI", // getPaymentURI() >> provides bitcoin payment URI
  104: "Unable to decode Payment URI", // decodePaymentURI() >> decodes payment URI
  105: "Invalid Bitcoin address/paymentURI", // addressDiff() >> address vs payment URI identifier
  106: "Transaction creation failed", // transferST1() >> creates  transaction
  107: "Transaction signing/broadcasting failed", // transferST2() >> signs and broadcast the transaction

  // Error Series 300: Secure Account Errors
  301: "Failed to setup secure account", // setupSecureAccount() >> generates the ingredients to form the secure account
  302: "Unable to import secure account", // importSecureAccount() >> imports a pre-registered secure account
  303: "Secondary xpub decryption failed", // decryptSecondaryXpub() >> decrypts the secondary xpub
  304: "Unable to check health of the secure account", // checkHealth() >> checks the health of the secure account
  305: "Unable to check whether the secure account is active or not", // isActive() >> secure account presence monitor
  306: "Failed to reset two factor authentication", // resetTwoFA() >> resets the twoFA secret
  307: "Unable to get the exit key", // getSecondaryMnemonic() >> provides the Exit Key
  308: "Unable to get the secondary xpub", // getSecondaryXpub() >> provides the secondary xpub
  309: "Transaction creation failed", // transferST1() >> creates transaction
  310: "Transaction signing failed", // transferST2() >> signs and partially builds the transaction
  311: "Failed to get the second signature from the server", // transferST3() >> sends the partially built txn to the server and broadcasts post signing

  // Error Series 500: SSS Errors
  501: "Unable to generate mnemonic from shares", // recoverFromShares() >> recovers the mnemonic given threshold number of shares
  502: "Failed to download the share", // downloadShare() >> downloads share from the server provided the key
  503: "Failed to decrypt and store the share", // decryptEncMetaShare() >> decrypts the downloaded share and stores it post validation
  504: "Unable to decrypt data using OTP", // decryptViaOTP() >> decrypts OTP encrypted data
  505: "Unable to recover share from QRs", // recoverMetaShareFromQR() >> reconstructs the share by combining the splitted QRs
  506: "Health updation failed", // updateHealth() >> updates the health of the supplied shares
  507: "Failed to generate the shareID", // getShareId() >> provides the shareID for a given share
  508: "Unable to generate encryption key", // generateKey() >> generates a pseudo-random encryption key
  509: "Unable to encrypt data via OTP", // encryptViaOTP() >> encrypts data(key) using OTP
  510: "Unable to generate shares", // generateShares() >> generate SSS shares and encrypt them using the supplied answer
  511: "Static nonPMDD encryption failed", // encryptStaticNonPMDD >> encrypts static non-PMDD
  512: "Failed to get wallet Id", // getWalletId() >> supplies wallet Id
  513: "Health check initialization failed", // initializeHealthCheck() >> initializes health check schema on the database server
  514: "Unable to check the health of your shares", // checkHealth() >> check the health of supplied shareIDs
  515: "Failed to update dynamic nonPMDD on the server", // updateDynamicNonPMDD() >> updates dynamic nonPMDD on the server
  516: "Failed to download dynamic nonPMDD from the server", // downloadDynamicNonPMDD() >> downloads dynamic nonPMDD from the server
  517: "Unable to restore the latest dynamic nonPMDD", // restoreDynamicNonPMDD() >> restores most up-to-date dynamic nonPMDD from occupied ones.
  518: "Unable to decrypt dynamic nonPMDD", // decryptDynamicNonPMDD() >> decrypts dynamic nonPMDD
  519: "Unable to decrypt static nonPMDD", // decryptStaticNonPMDD() >> decrypts static nonPMDD
  520: "Failed to create the share", // createMetaShare() >> creates the metaShare
  521: "Failed to split share into QRs", // createQR() >> creates qrStrings by splitting metaShare
  522: "Unable to encrypt the share", // generateEncryptedMetaShare() >> encrypts the metaShare via key
  523: "Unable to upload the share to the server", // uploadShare() >> uploads the share to the server
};
