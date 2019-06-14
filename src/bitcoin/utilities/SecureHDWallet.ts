import axios from "axios";
import bip32 from "bip32";
import bip39 from "react-native-bip39";
import bitcoinJS, { TransactionBuilder } from "bitcoinjs-lib";
import coinselect from "coinselect";
import crypto from "crypto";
import config from "../Config";
import Bitcoin from "./Bitcoin";

export default class SecureHDWallet extends Bitcoin {
  public primaryMnemonic: string;
  public secondaryMnemonic: string;
  public walletID: string;
  public xpubs: {
    primary: string;
    secondary: string;
    bh: string;
  };
  public path: string;
  public network;
  public consumedAddresses: string[];
  public nextFreeChildIndex: number;
  public primaryXpriv: string;
  public multiSigCache;
  public signingEssentialsCache;
  public cipherSpec;

  constructor ( primaryMnemonic: string ) {
    super();
    this.primaryMnemonic = primaryMnemonic;
    this.walletID = this.getWalletId();
    this.network = config.NETWORK;
    this.consumedAddresses = [];
    this.nextFreeChildIndex = 0;
    this.multiSigCache = {};
    this.signingEssentialsCache = {};
    this.cipherSpec = {
      algorithm: "aes-192-cbc",
      salt: "bithyeSalt", // NOTE: The salt should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
      keyLength: 24,
      iv: Buffer.alloc( 16, 0 ),
    };
  }

  public deriveChildXKey = ( extendedKey: string, childIndex: number ) => {
    const xKey = bip32.fromBase58( extendedKey, this.network );
    const childXKey = xKey.derive( childIndex );
    return childXKey.toBase58();
  }

  public importBHXpub = async ( token: number ) => {
    const res = await axios.post( config.SERVER + "/importBHXpub", {
      token,
      walletID: this.getWalletId(),
    } );
    const { bhXpub, err } = res.data;
    if ( err ) {
      throw new Error( err );
    }

    return {
      bhXpub,
    };
  }

  public getPub = ( extendedKey: string ) => {
    const xKey = bip32.fromBase58( extendedKey, this.network );
    return xKey.publicKey.toString( "hex" );
  }

  public getWalletId = () => {
    const hash = crypto.createHash( "sha512" );
    const seed = bip39.mnemonicToSeed( this.primaryMnemonic );
    hash.update( seed );
    return hash.digest( "hex" );
  }

  public getSecondaryMnemonic = () => this.secondaryMnemonic;

  public getRecoverableXKey = (
    mnemonic: string,
    path: string,
    priv?: boolean,
  ) => {
    const seed = bip39.mnemonicToSeed( mnemonic );
    const root = bip32.fromSeed( seed, this.network );
    if ( !priv ) {
      const xpub = root
        .derivePath( "m/" + path )
        .neutered()
        .toBase58();
      return xpub;
    } else {
      const xpriv = root.derivePath( "m/" + path ).toBase58();
      return xpriv;
    }
  }

  public getAccountId = () => {
    const mutliSig = this.createSecureMultiSig( 0 );
    const { address } = mutliSig; // getting the first receiving address
    return crypto
      .createHash( "sha256" )
      .update( address )
      .digest( "hex" );
  }

  public checkHealth = async ( pos: string ) => {
    const res = await axios.post( config.SERVER + "/checkSecureHealth", {
      pos,
      walletID: this.getWalletId(),
    } );

    return res.data;
  }

  public fetchBalance = async () => {
    try {
      const binarySearchIterationForConsumedAddresses = async (
        index,
        maxUsedIndex = 0,
        minUnusedIndex = 100500100,
        depth = 0,
      ) => {
        console.log( { depth } );
        if ( depth >= 20 ) {
          return maxUsedIndex + 1;
        } // fail

        const multiSig = this.createSecureMultiSig( index );
        const txs = await this.fetchTransactionsByAddresses( [ multiSig.address ] );

        console.log( txs );
        if ( txs.totalTransactions === 0 ) {
          console.log( { index } );
          if ( index === 0 ) {
            return 0;
          }
          minUnusedIndex = Math.min( minUnusedIndex, index ); // set
          index = Math.floor( ( index - maxUsedIndex ) / 2 + maxUsedIndex );
        } else {
          maxUsedIndex = Math.max( maxUsedIndex, index ); // set
          const nextMultiSig = this.createSecureMultiSig( index + 1 );
          const txs2 = await this.fetchTransactionsByAddresses( [
            nextMultiSig.address,
          ] );
          if ( txs2.totalTransactions === 0 ) {
            return index + 1;
          } // thats our next free address

          index = Math.round( ( minUnusedIndex - index ) / 2 + index );
        }

        return binarySearchIterationForConsumedAddresses(
          index,
          maxUsedIndex,
          minUnusedIndex,
          depth + 1,
        );
      };

      console.log( "Executing consumed binary search" );
      this.nextFreeChildIndex = await binarySearchIterationForConsumedAddresses(
        100,
      );
      console.log( this.nextFreeChildIndex );
      this.consumedAddresses = [];

      // generating all consumed addresses:
      for ( let itr = 0; itr < this.nextFreeChildIndex; itr++ ) {
        const multiSig = this.createSecureMultiSig( itr );
        this.consumedAddresses.push( multiSig.address );
      }

      console.log( this.consumedAddresses );
      const res = await this.getBalanceByAddresses( this.consumedAddresses );
      return res;
    } catch ( err ) {
      console.warn( err );
    }
  }

  public fetchTransactions = async () => {
    if ( this.consumedAddresses.length === 0 ) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    return await this.fetchTransactionsByAddresses( this.consumedAddresses );
  }

  public fetchUtxo = async () => {
    if ( this.consumedAddresses.length === 0 ) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    const UTXOs = await this.multiFetchUnspentOutputs( this.consumedAddresses );
    return UTXOs;
  }

  public getSigningEssentials = ( address: string ) => {
    if ( this.signingEssentialsCache[ address ] ) {
      return this.signingEssentialsCache[ address ];
    } // cache hit

    for ( let itr = 0; itr <= this.nextFreeChildIndex + 3; itr++ ) {
      const multiSig = this.createSecureMultiSig( itr );

      if ( multiSig.address === address ) {
        return ( this.signingEssentialsCache[ address ] = {
          multiSig,
          keyPair: bip32.fromBase58(
            this.deriveChildXKey( this.primaryXpriv, itr ),
            this.network,
          ),
          childIndex: itr,
        } );
      }
    }

    throw new Error( "Could not find WIF for " + address );
  }

  public getReceivingAddress = async () => {
    // looking for free external address
    let freeAddress = "";
    let itr;
    for ( itr = 0; itr < Math.max( 5, this.consumedAddresses.length ); itr++ ) {
      if ( this.nextFreeChildIndex + itr < 0 ) {
        continue;
      }
      const { address } = this.createSecureMultiSig(
        this.nextFreeChildIndex + itr,
      );
      console.log( "From create multiSig: ", address );

      const { totalTransactions } = await this.fetchTransactionsByAddresses( [
        address,
      ] );
      if ( totalTransactions === 0 ) {
        // free address found
        freeAddress = address;
        this.nextFreeChildIndex += itr;
        break;
      }
    }

    if ( !freeAddress ) {
      // giving up as we could find a free address in the above cycle

      console.log(
        "Failed to find a free address in the above cycle, using the next address without checking",
      );
      const multiSig = this.createSecureMultiSig( this.nextFreeChildIndex + itr );
      freeAddress = multiSig.address; // not checking this one, it might be free
      this.nextFreeChildIndex += itr + 1;
    }
    return freeAddress;
  }

  public derivePath = ( bhXpub: string ) => {
    const bhxpub = bip32.fromBase58( bhXpub, this.network );
    let path;
    if ( bhxpub.index === 0 ) {
      path = config.DERIVATION_BRANCH;
    } else {
      path = config.WALLET_XPUB_PATH + config.DERIVATION_BRANCH;
    }
    return path;
  }

  public generateKey = ( psuedoKey: string ): string => {
    const hashRounds = 5048;
    let key = psuedoKey;
    for ( let itr = 0; itr < hashRounds; itr++ ) {
      const hash = crypto.createHash( "sha512" );
      key = hash.update( key ).digest( "hex" );
    }
    return key.slice( key.length - this.cipherSpec.keyLength );
  }

  public decryptSecondaryXpub = ( encryptedSecXpub: string ) => {
    console.log( { primaryMnemonic: this.primaryMnemonic } );

    const key = this.generateKey(
      bip39.mnemonicToSeed( this.primaryMnemonic ).toString( "hex" ),
    );
    const decipher = crypto.createDecipheriv(
      this.cipherSpec.algorithm,
      key,
      this.cipherSpec.iv,
    );
    let decrypted = decipher.update( encryptedSecXpub, "hex", "utf8" );
    decrypted += decipher.final( "utf8" );
    return { secondaryXpub: decrypted };
  }

  public prepareSecureAccount = async ( bhXpub, secondaryXpub?) => {
    const path = this.derivePath( bhXpub );
    const primaryXpub = this.getRecoverableXKey( this.primaryMnemonic, path );
    console.log( { path } );

    if ( !secondaryXpub ) {
      this.secondaryMnemonic = await bip39.generateMnemonic( 256 );
      secondaryXpub = this.getRecoverableXKey( this.secondaryMnemonic, path );
    }
    this.primaryXpriv = this.getRecoverableXKey(
      this.primaryMnemonic,
      path,
      true,
    );

    this.xpubs = {
      primary: primaryXpub,
      secondary: secondaryXpub,
      bh: bhXpub,
    };

    console.log( { xpubs: this.xpubs } );

    return {
      prepared: true
    }
  }

  public createSecureMultiSig = ( childIndex ) => {
    if ( this.multiSigCache[ childIndex ] ) {
      return this.multiSigCache[ childIndex ];
    } // cache hit

    console.log( `creating multiSig against index: ${ childIndex }` );
    console.log( this.xpubs );

    const childPrimaryPub = this.getPub(
      this.deriveChildXKey( this.xpubs.primary, childIndex ),
    );
    const childRecoveryPub = this.getPub(
      this.deriveChildXKey( this.xpubs.secondary, childIndex ),
    );
    const childBHPub = this.getPub(
      this.deriveChildXKey( this.xpubs.bh, childIndex ),
    );

    // public keys should be aligned in the following way: [bhPub, primaryPub, recoveryPub]
    // for generating ga_recovery based recoverable multiSigs
    const pubs = [ childBHPub, childPrimaryPub, childRecoveryPub ];
    // console.log({ pubs });
    const multiSig = this.generateMultiSig( 2, pubs );

    return ( this.multiSigCache[ childIndex ] = {
      scripts: {
        redeem: multiSig.p2sh.redeem.output.toString( "hex" ),
        witness: multiSig.p2wsh.redeem.output.toString( "hex" ),
      },
      address: multiSig.address,
    } );
  }

  public setupSecureAccount = async () => {
    let res;
    try {
      res = await axios.get( config.SERVER + "/setup2FA" );
    } catch ( err ) {
      console.log( "An error occured:", err );
      return {
        status: err.response.status,
        errorMessage: err.response.data,
      };
    }

    await this.prepareSecureAccount( res.data.bhXpub );

    return {
      status: res.status,
      data: { setupData: res.data, secondaryXpub: this.xpubs.secondary },
    };
  }

  public validateSecureAccountSetup = async (
    token: number,
    secret: string,
    xIndex: number,
  ) => {
    try {
      console.log( token, secret, xIndex, this.walletID );

      const res = await axios.post( config.SERVER + "/validate2FASetup", {
        token,
        secret,
        xIndex,
        walletID: this.walletID,
      } );
      return { status: res.status, data: res.data };
    } catch ( err ) {
      console.log( "Error:", err.response.data );
      return {
        status: err.response.status,
        errorMessage: err.response.data,
      };
    }
  }

  public createSecureHDTransaction = async (
    recipientAddress: string,
    amount: number,
    nSequence?: number,
    txnPriority?: string,
  ): Promise<{ inputs: object[]; txb: TransactionBuilder; fee: number }> => {
    const inputUTXOs = await this.fetchUtxo();
    console.log( "Input UTXOs:", inputUTXOs );
    const outputUTXOs = [ { address: recipientAddress, value: amount } ];
    console.log( "Output UTXOs:", outputUTXOs );
    const txnFee = await this.feeRatesPerByte( txnPriority );

    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      txnFee,
    );
    console.log( "-------Transaction--------" );
    console.log( "\tFee", fee );
    console.log( "\tInputs:", inputs );
    console.log( "\tOutputs:", outputs );

    const txb: TransactionBuilder = new bitcoinJS.TransactionBuilder(
      this.network,
    );

    inputs.forEach( ( input ) => txb.addInput( input.txId, input.vout, nSequence ) );

    for ( const output of outputs ) {
      if ( !output.address ) {
        output.address = await this.getReceivingAddress();
        console.log( `adding the change address: ${ output.address }` );
      }
      console.log( "Added Output:", output );
      txb.addOutput( output.address, output.value );
    }

    return {
      inputs,
      txb,
      fee,
    };
  }

  public signHDTransaction = ( inputs: any, txb: TransactionBuilder ): any => {
    console.log( "------ Transaction Signing ----------" );
    let vin = 0;
    const childIndexArray = [];
    inputs.forEach( ( input ) => {
      console.log( "Signing Input:", input );
      const { multiSig, keyPair, childIndex } = this.getSigningEssentials(
        input.address,
      );
      txb.sign(
        vin,
        keyPair,
        Buffer.from( multiSig.scripts.redeem, "hex" ),
        null,
        input.value,
        Buffer.from( multiSig.scripts.witness, "hex" ),
      );
      childIndexArray.push( {
        childIndex,
        inputIdentifier: { txId: input.txId, vout: input.vout },
      } );
      vin += 1;
    } );

    return { signedTxb: txb, childIndexArray };
  }
}
