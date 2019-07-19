import bip32 from "bip32";
import bip39 from "react-native-bip39";
import bitcoinJS, { TransactionBuilder } from "bitcoinjs-lib";
import coinselect from "coinselect";
import crypto from "crypto";
import config from "../Config";
import Bitcoin from "./Bitcoin";

export default class HDSegwitWallet extends Bitcoin {
  public mnemonic: string;
  public passphrase: string;
  public purpose: number;
  public derivationPath: string;
  public xpub: string;
  public usedAddresses: string[];
  public nextFreeAddressIndex: number;
  public nextFreeChangeAddressIndex: number;
  public internalAddresssesCache: {};
  public externalAddressesCache: {};
  public addressToWIFCache: {};

  constructor (
    mnemonic: string,
    passphrase?: string,
    dPathPurpose?: number,
    stateVars?: {
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
    },
  ) {
    super();
    this.mnemonic = mnemonic;
    this.passphrase = passphrase;
    this.purpose = dPathPurpose ? dPathPurpose : config.DPATH_PURPOSE;
    this.derivationPath =
      config.NETWORK === bitcoinJS.networks.bitcoin
        ? `m/${ this.purpose }'/0'/0`
        : `m/${ this.purpose }'/1'/0'`;

    this.usedAddresses = stateVars ? stateVars.usedAddresses : [];
    this.nextFreeAddressIndex = stateVars ? stateVars.nextFreeAddressIndex : 0;
    this.nextFreeChangeAddressIndex = stateVars
      ? stateVars.nextFreeChangeAddressIndex
      : 0;
    this.internalAddresssesCache = stateVars
      ? stateVars.internalAddresssesCache
      : {}; // index => address
    this.externalAddressesCache = stateVars
      ? stateVars.externalAddressesCache
      : {}; // index => address
    this.addressToWIFCache = stateVars ? stateVars.addressToWIFCache : {};
  }

  public getMnemonic = (): { mnemonic: string } => {
    return { mnemonic: this.mnemonic };
  }

  public getWalletId = (): { walletId: string } => {
    const seed = bip39.mnemonicToSeed( this.mnemonic, this.passphrase );
    return {
      walletId: crypto
        .createHash( "sha512" )
        .update( seed )
        .digest( "hex" ),
    };
  }

  public getAccountId = (): { accountId: string } => {
    const node = bip32.fromBase58( this.getXpub(), this.network );
    const keyPair = node.derive( 0 ).derive( 0 );
    const address = this.getAddress( keyPair ); // getting the first receiving address
    return {
      accountId: crypto
        .createHash( "sha256" )
        .update( address )
        .digest( "hex" ),
    };
  }

  public getXpub = () => {
    if ( this.xpub ) {
      return this.xpub;
    }
    const seed = bip39.mnemonicToSeed( this.mnemonic, this.passphrase );
    const root = bip32.fromSeed( seed, this.network );
    const child = root.derivePath( this.derivationPath ).neutered();
    this.xpub = child.toBase58();

    return this.xpub;
  }

  public getWIFbyIndex = ( change: boolean, index: number ) => {
    const seed = bip39.mnemonicToSeed( this.mnemonic, this.passphrase );
    const root = bip32.fromSeed( seed, this.network );
    const path = `${ this.derivationPath }/${ change ? 1 : 0 }/${ index }`;
    const child = root.derivePath( path );
    return child.toWIF();
  }

  public getExternalWIFByIndex = ( index: number ): string => {
    return this.getWIFbyIndex( false, index );
  }

  public getInternalWIFByIndex = ( index: number ): string => {
    return this.getWIFbyIndex( true, index );
  }

  public getExternalAddressByIndex = ( index: number ): string => {
    if ( this.externalAddressesCache[ index ] ) {
      return this.externalAddressesCache[ index ];
    } // cache hit

    const node = bip32.fromBase58( this.getXpub(), this.network );
    const keyPair = node.derive( 0 ).derive( index );

    const address = this.getAddress( keyPair );
    return ( this.externalAddressesCache[ index ] = address );
  }

  public getInternalAddressByIndex = ( index: number ): string => {
    if ( this.internalAddresssesCache[ index ] ) {
      return this.internalAddresssesCache[ index ];
    } // cache hit

    const node = bip32.fromBase58( this.getXpub(), this.network );
    const keyPair = node.derive( 1 ).derive( index );
    const address = this.getAddress( keyPair );
    return ( this.internalAddresssesCache[ index ] = address );
  }

  public getWifForAddress = ( address: string ): string => {
    if ( this.addressToWIFCache[ address ] ) {
      return this.addressToWIFCache[ address ];
    } // cache hit

    // fast approach, first lets iterate over all addressess we have in cache
    for ( const index of Object.keys( this.internalAddresssesCache ) ) {
      if ( this.getInternalAddressByIndex( parseInt( index, 10 ) ) === address ) {
        return ( this.addressToWIFCache[ address ] = this.getInternalWIFByIndex(
          parseInt( index, 10 ),
        ) );
      }
    }

    for ( const index of Object.keys( this.externalAddressesCache ) ) {
      if ( this.getExternalAddressByIndex( parseInt( index, 10 ) ) === address ) {
        return ( this.addressToWIFCache[ address ] = this.getExternalWIFByIndex(
          parseInt( index, 10 ),
        ) );
      }
    }

    // cache miss: lets iterate over all addresses we have up to first unused address index
    for ( let itr = 0; itr <= this.nextFreeChangeAddressIndex + 5; itr++ ) {
      const possibleAddress = this.getInternalAddressByIndex( itr );
      if ( possibleAddress === address ) {
        return this.getInternalWIFByIndex( itr );
      }
    }

    for ( let itr = 0; itr <= this.nextFreeAddressIndex + 5; itr++ ) {
      const possibleAddress = this.getExternalAddressByIndex( itr );
      if ( possibleAddress === address ) {
        return this.getExternalWIFByIndex( itr );
      }
    }
    throw new Error( "Could not find WIF for " + address );
  }

  public getReceivingAddress = async (): Promise<{ address: string }> => {
    try {
      // finding free external address
      let freeAddress = "";
      let itr;
      for ( itr = 0; itr < Math.max( 5, this.usedAddresses.length ); itr++ ) {
        if ( this.nextFreeAddressIndex + itr < 0 ) {
          continue;
        }
        const address = this.getExternalAddressByIndex(
          this.nextFreeAddressIndex + itr,
        );

        this.externalAddressesCache[ this.nextFreeAddressIndex + itr ] = address; // updating cache just for any case

        let totalTransactions: number;

        const { transactions } = await this.fetchTransactionsByAddresses( [
          address,
        ] );
        totalTransactions = transactions.totalTransactions;

        if ( totalTransactions === 0 ) {
          // free address found
          freeAddress = address;
          this.nextFreeAddressIndex += itr;
          break;
        }
      }

      if ( !freeAddress ) {
        console.log(
          "Failed to find a free address in the external address cycle, using the next address without checking",
        );
        // giving up as we could find a free address in the above cycle
        freeAddress = this.getExternalAddressByIndex(
          this.nextFreeAddressIndex + itr,
        ); // not checking this one, it might be free
        this.nextFreeAddressIndex += itr + 1;
      }
      return { address: freeAddress };
    } catch ( err ) {
      throw new Error( `Unable to generate receiving address: ${ err.message }` );
    }
  }

  public getChangeAddress = async (): Promise<{ address: string }> => {
    try {
      // looking for free internal address
      let freeAddress = "";
      let itr;
      for ( itr = 0; itr < Math.max( 5, this.usedAddresses.length ); itr++ ) {
        if ( this.nextFreeChangeAddressIndex + itr < 0 ) {
          continue;
        }
        const address = this.getInternalAddressByIndex(
          this.nextFreeChangeAddressIndex + itr,
        );
        this.internalAddresssesCache[
          this.nextFreeChangeAddressIndex + itr
        ] = address; // updating cache just for any case

        const txs = await this.fetchTransactionsByAddresses( [ address ] );
        const { totalTransactions } = txs.transactions;

        if ( totalTransactions === 0 ) {
          // free address found
          freeAddress = address;
          this.nextFreeChangeAddressIndex += itr;
          break;
        }
      }

      if ( !freeAddress ) {
        console.log(
          "Failed to find a free address in the change address cycle, using the next address without checking",
        );
        // giving up as we could find a free address in the above cycle
        freeAddress = this.getInternalAddressByIndex(
          this.nextFreeChangeAddressIndex + itr,
        ); // not checking this one, it might be free
        this.nextFreeChangeAddressIndex += itr + 1;
      }

      return { address: freeAddress };
    } catch ( err ) {
      throw new Error( `Change address generation failed: ${ err.message }` );
    }
  }

  public binarySearchIterationForInternalAddress = async (
    index: number,
    maxUsedIndex: number = config.BSI.MAXUSEDINDEX,
    minUnusedIndex: number = config.BSI.MINUNUSEDINDEX,
    depth: number = config.BSI.DEPTH.INIT,
  ): Promise<number> => {
    if ( depth >= config.BSI.DEPTH.LIMIT ) {
      return maxUsedIndex + 1;
    } // fail
    const txs = await this.fetchTransactionsByAddresses( [
      this.getInternalAddressByIndex( index ),
    ] );

    if ( txs.transactions.totalTransactions === 0 ) {
      if ( index === 0 ) {
        return 0;
      }
      minUnusedIndex = Math.min( minUnusedIndex, index ); // set
      index = Math.floor( ( index - maxUsedIndex ) / 2 + maxUsedIndex );
    } else {
      maxUsedIndex = Math.max( maxUsedIndex, index ); // set
      const txs2 = await this.fetchTransactionsByAddresses( [
        this.getInternalAddressByIndex( index + 1 ),
      ] );
      if ( txs2.transactions.totalTransactions === 0 ) {
        return index + 1;
      } // thats our next free address

      index = Math.round( ( minUnusedIndex - index ) / 2 + index );
    }

    return this.binarySearchIterationForInternalAddress(
      index,
      maxUsedIndex,
      minUnusedIndex,
      depth + 1,
    );
  }

  public binarySearchIterationForExternalAddress = async (
    index: number,
    maxUsedIndex: number = config.BSI.MAXUSEDINDEX,
    minUnusedIndex: number = config.BSI.MINUNUSEDINDEX,
    depth: number = config.BSI.DEPTH.INIT,
  ): Promise<number> => {
    if ( depth >= config.BSI.DEPTH.LIMIT ) {
      return maxUsedIndex + 1;
    } // fail

    const txs = await this.fetchTransactionsByAddresses( [
      this.getExternalAddressByIndex( index ),
    ] );

    if ( txs.transactions.totalTransactions === 0 ) {
      if ( index === 0 ) {
        return 0;
      }
      minUnusedIndex = Math.min( minUnusedIndex, index ); // set
      index = Math.floor( ( index - maxUsedIndex ) / 2 + maxUsedIndex );
    } else {
      maxUsedIndex = Math.max( maxUsedIndex, index ); // set
      const txs2 = await this.fetchTransactionsByAddresses( [
        this.getExternalAddressByIndex( index + 1 ),
      ] );
      if ( txs2.transactions.totalTransactions === 0 ) {
        return index + 1;
      } // thats our next free address

      index = Math.round( ( minUnusedIndex - index ) / 2 + index );
    }

    return this.binarySearchIterationForExternalAddress(
      index,
      maxUsedIndex,
      minUnusedIndex,
      depth + 1,
    );
  }

  public fetchBalance = async (): Promise<{
    balance: number;
    unconfirmedBalance: number;
  }> => {
    try {
      console.log( "Executing internal binary search" );
      this.nextFreeChangeAddressIndex = await this.binarySearchIterationForInternalAddress(
        config.BSI.INIT_INDEX,
      );

      console.log( "Executing external binary search" );
      this.nextFreeAddressIndex = await this.binarySearchIterationForExternalAddress(
        config.BSI.INIT_INDEX,
      );

      this.usedAddresses = [];
      // generating all involved addresses:
      for ( let itr = 0; itr < this.nextFreeAddressIndex; itr++ ) {
        this.usedAddresses.push( this.getExternalAddressByIndex( itr ) );
      }
      for ( let itr = 0; itr < this.nextFreeChangeAddressIndex; itr++ ) {
        this.usedAddresses.push( this.getInternalAddressByIndex( itr ) );
      }

      const { balance, unconfirmedBalance } = await this.getBalanceByAddresses(
        this.usedAddresses,
      );
      return { balance, unconfirmedBalance };
    } catch ( err ) {
      throw new Error( `Unable to get balance: ${ err.message }` );
    }
  }

  public fetchUtxo = async () => {
    try {
      console.log( "USED ADDRESSES:", this.usedAddresses );
      if ( this.usedAddresses.length === 0 ) {
        // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
        await this.fetchBalance();
      }
      console.log( "USED ADDRESSES:", this.usedAddresses );

      // let addresses = this.usedAddresses.join("|");
      // addresses +=
      //   "|" + this.getExternalAddressByIndex(this.nextFreeAddressIndex);
      // addresses +=
      //   "|" + this.getInternalAddressByIndex(this.nextFreeChangeAddressIndex);

      const { UTXOs } = await this.multiFetchUnspentOutputs( this.usedAddresses );
      return UTXOs;

      // try {
      //  res = await axios.get(
      //   `${TESTNET.BLOCKCHAIN_INFO_BASE}unspent?active=${addresses}`,
      // );
      // this endpoint does not support offset of some kind o_O
      // so doing only one call
      // const json = res.data;
      // if (
      //   typeof json === "undefined" ||
      //   typeof json.unspent_outputs === "undefined"
      // ) {
      //   throw new Error("Could not fetch UTXO from API " + res.err);
      // }
      // for (const unspent of json.unspent_outputs) {
      //   // a lil transform for signer module
      //   unspent.txid = unspent.tx_hash_big_endian;
      //   unspent.vout = unspent.tx_output_n;
      //   unspent.amount = unspent.value;
      //   const chunksIn = bitcoinJS.script.decompile(
      //     Buffer.from(unspent.script, "hex"),
      //   );
      //   unspent.address = bitcoinJS.address.fromOutputScript(chunksIn);
      //   utxos.push(unspent);
      // }
      // } catch (err) {
      //   console.log(err);
      // }

      // this.utxo = utxos;
    } catch ( err ) {
      throw new Error( `Unable to fetch UTXOs: ${ err.message }` );
    }
  }

  public fetchTransactions = async (): Promise<{
    transactions: {
      totalTransactions: number;
      confirmedTransactions: number;
      unconfirmedTransactions: number;
      transactionDetails: any[];
      address: string;
    };
  }> => {
    if ( this.usedAddresses.length === 0 ) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    return this.fetchTransactionsByAddresses( this.usedAddresses );
  }

  public sortOutputs = async (
    outputs: Array<{
      address: string;
      value: number;
    }>,
  ): Promise<
    Array<{
      address: string;
      value: number;
    }>
  > => {
    for ( const output of outputs ) {
      if ( !output.address ) {
        const { address } = await this.getChangeAddress();
        output.address = address;
        console.log( `adding the change address: ${ output.address }` );
      }
    }

    outputs.sort( ( out1, out2 ) => {
      if ( out1.address < out2.address ) {
        return -1;
      }
      if ( out1.address > out2.address ) {
        return 1;
      }
      return 0;
    } );

    return outputs;
  }

  public createHDTransaction = async (
    recipientAddress: string,
    amount: number,
    txnPriority?: string,
    nSequence?: number,
  ): Promise<
    | {
      fee: number;
      inputs?: undefined;
      txb?: undefined;
    }
    | {
      inputs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
      }>;
      txb: bitcoinJS.TransactionBuilder;
      fee: number;
    }
  > => {
    try {
      const inputUTXOs = await this.fetchUtxo();
      console.log( "Input UTXOs:", inputUTXOs );
      const outputUTXOs = [ { address: recipientAddress, value: amount } ];
      console.log( "Output UTXOs:", outputUTXOs );
      const txnFee = await this.feeRatesPerByte( txnPriority );
      console.log( { txnFee } );
      const { inputs, outputs, fee } = coinselect(
        inputUTXOs,
        outputUTXOs,
        txnFee,
      );
      console.log( "-------Transaction--------" );
      console.log( "\tFee", fee );
      console.log( "\tInputs:", inputs );
      console.log( "\tOutputs:", outputs );

      if ( !inputs ) {
        // insufficient input utxos to compensate for output utxos + fee
        return { fee };
      }

      const txb: TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      );

      inputs.forEach( ( input ) => txb.addInput( input.txId, input.vout, nSequence ) );
      const sortedOuts = await this.sortOutputs( outputs );
      sortedOuts.forEach( ( output ) => {
        console.log( "Adding Output:", output );
        txb.addOutput( output.address, output.value );
      } );

      return {
        inputs,
        txb,
        fee,
      };
    } catch ( err ) {
      throw new Error( `Transaction creation failed: ${ err.message }` );
    }
  }

  public signHDTransaction = (
    inputs: any,
    txb: TransactionBuilder,
    witnessScript?: any,
  ): TransactionBuilder => {
    try {
      console.log( "------ Transaction Signing ----------" );
      let vin = 0;
      inputs.forEach( ( input ) => {
        console.log( "Signing Input:", input );
        console.log( "Creating priv key" );
        const privateKey = this.getWifForAddress( input.address );
        console.log( { privateKey } );

        const keyPair = this.getKeyPair( privateKey );
        console.log( { keyPair } );

        txb.sign(
          vin,
          keyPair,
          this.getP2SH( keyPair ).redeem.output,
          null,
          input.value,
          witnessScript,
        );
        vin += 1;
      } );

      return txb;
    } catch ( err ) {
      throw new Error( `Transaction signing failed: ${ err.message }` );
    }
  }

  public transfer = async (
    recipientAddress: string,
    amount: number,
  ): Promise<{
    txid: string;
  }> => {
    try {
      if ( this.isValidAddress( recipientAddress ) ) {
        amount = amount * 1e8; // converting into sats
        const { balance } = await this.fetchBalance();

        const { inputs, txb, fee } = await this.createHDTransaction(
          recipientAddress,
          amount,
        );
        console.log( "---- Transaction Created ----" );

        if ( balance < amount + fee ) {
          throw new Error(
            "Insufficient balance to compensate for transfer amount and the txn fee",
          );
        }

        const signedTxb = this.signHDTransaction( inputs, txb );
        console.log( "---- Transaction Signed ----" );

        const txHex = signedTxb.build().toHex();
        const { txid } = await this.broadcastTransaction( txHex );
        console.log( "---- Transaction Broadcasted ----" );

        return { txid };
      } else {
        throw new Error( "Recipient address is wrong" );
      }
    } catch ( err ) {
      throw new Error( `Unable to transfer: ${ err.message }` );
    }
  }
}
