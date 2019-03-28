import bip32 from "bip32";
import bip39 from "bip39";
import bitcoinJS, { TransactionBuilder } from "bitcoinjs-lib";
import coinselect from "coinselect";
import Bitcoin from "./Bitcoin";

export default class HDSegwitWallet extends Bitcoin {
  public mnemonic: string;
  public xpub: string;
  public usedAddresses: string[];
  public nextFreeAddressIndex: number;
  public nextFreeChangeAddressIndex: number;

  constructor() {
    super();
    // this.mnemonic = bip39.generateMnemonic();
    // //console.log({ mnemonic: this.mnemonic });
    this.mnemonic =
      "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
    this.nextFreeAddressIndex = 0;
    this.nextFreeChangeAddressIndex = 0;
    this.usedAddresses = [];
    this.nextFreeAddressIndex = 0;
    this.nextFreeChangeAddressIndex = 0;
  }

  public getXpub = () => {
    if (this.xpub) {
      return this.xpub;
    }
    const seed = bip39.mnemonicToSeed(this.mnemonic);
    const root = bip32.fromSeed(seed, this.network);

    const path = "m/44'/0'/0'";
    const child = root.derivePath(path).neutered();
    this.xpub = child.toBase58();

    return this.xpub;
  };

  public getWIFbyIndex = (change: boolean, index: number) => {
    const seed = bip39.mnemonicToSeed(this.mnemonic);
    const root = bip32.fromSeed(seed, this.network);
    const path = `m/44'/0'/0'/${change ? 1 : 0}/${index}`;
    const child = root.derivePath(path);

    return child.toWIF();
  };

  public getExternalWIFByIndex = (index: number) => {
    return this.getWIFbyIndex(false, index);
  };

  public getInternalWIFByIndex = (index: number) => {
    return this.getWIFbyIndex(true, index);
  };

  public getExternalAddressByIndex = (index: number) => {
    const node = bip32.fromBase58(this.getXpub(), this.network);
    const keyPair = node.derive(0).derive(index);

    return this.getAddress(keyPair);
  };

  public getInternalAddressByIndex = (index: number) => {
    const node = bip32.fromBase58(this.getXpub(), this.network);
    const keyPair = node.derive(1).derive(index);

    return this.getAddress(keyPair);
  };

  public getWifForAddress = (address: string) => {
    // TODO: Implement caching
    // lets iterate over all addresses we have up to first unused address index
    for (let itr = 0; itr <= this.nextFreeChangeAddressIndex + 3; itr++) {
      const possibleAddress = this.getInternalAddressByIndex(itr);
      if (possibleAddress === address) {
        return this.getInternalWIFByIndex(itr);
      }
    }

    for (let itr = 0; itr <= this.nextFreeAddressIndex + 3; itr++) {
      const possibleAddress = this.getExternalAddressByIndex(itr);
      if (possibleAddress === address) {
        return this.getExternalWIFByIndex(itr);
      }
    }
    throw new Error("Could not find WIF for " + address);
  };

  public multiGetBalanceByAddress = async addresses => {
    let bal = 0;
    let unconfirmedBal = 0;
    for (const addr of addresses) {
      const { balanceData } = await this.getBalance(addr);
      bal += balanceData.balance;
      unconfirmedBal += balanceData.unconfirmed_balance;
    }

    return { balance: bal, unconfirmedBalance: unconfirmedBal };
  };

  public getReceivingAddress = async () => {
    // looking for free external address
    let freeAddress = "";
    let itr;
    for (itr = 0; itr < Math.max(5, this.usedAddresses.length); itr++) {
      if (this.nextFreeAddressIndex + itr < 0) {
        continue;
      }
      const address = this.getExternalAddressByIndex(
        this.nextFreeAddressIndex + itr
      );
      const { totalTransactions } = await this.fetchTransactions(address);
      if (totalTransactions === 0) {
        // free address found
        freeAddress = address;
        this.nextFreeAddressIndex += itr;
        break;
      }
    }

    if (!freeAddress) {
      // giving up as we could find a free address in the above cycle
      freeAddress = this.getExternalAddressByIndex(
        this.nextFreeAddressIndex + itr
      ); // not checking this one, it might be free
      this.nextFreeAddressIndex += itr + 1;
    }
    return freeAddress;
  };

  public getChangeAddressAsync = async () => {
    // looking for free internal address
    let freeAddress = "";
    let itr;
    for (itr = 0; itr < Math.max(5, this.usedAddresses.length); itr++) {
      if (this.nextFreeChangeAddressIndex + itr < 0) {
        continue;
      }
      const address = this.getInternalAddressByIndex(
        this.nextFreeChangeAddressIndex + itr
      );

      const { totalTransactions } = await this.fetchTransactions(address);
      if (totalTransactions === 0) {
        // free address found
        freeAddress = address;
        this.nextFreeChangeAddressIndex += itr;
        break;
      }
    }

    if (!freeAddress) {
      // giving up as we could find a free address in the above cycle
      freeAddress = this.getInternalAddressByIndex(
        this.nextFreeChangeAddressIndex + itr
      ); // not checking this one, it might be free
      this.nextFreeChangeAddressIndex += itr + 1;
    }

    return freeAddress;
  };

  public fetchBalance = async () => {
    try {
      const binarySearchIterationForInternalAddress = async (
        index,
        maxUsedIndex = 0,
        minUnusedIndex = 100500100,
        depth = 0
      ) => {
        //console.log({ depth });
        if (depth >= 20) {
          return maxUsedIndex + 1;
        } // fail
        const txs = await this.fetchTransactions(
          this.getInternalAddressByIndex(index)
        );
        //console.log(txs);
        if (txs.totalTransactions === 0) {
          //console.log({ index });
          if (index === 0) {
            return 0;
          }
          minUnusedIndex = Math.min(minUnusedIndex, index); // set
          index = Math.floor((index - maxUsedIndex) / 2 + maxUsedIndex);
        } else {
          maxUsedIndex = Math.max(maxUsedIndex, index); // set
          const txs2 = await this.fetchTransactions(
            this.getInternalAddressByIndex(index + 1)
          );
          if (txs2.totalTransactions === 0) {
            return index + 1;
          } // thats our next free address

          index = Math.round((minUnusedIndex - index) / 2 + index);
        }

        return binarySearchIterationForInternalAddress(
          index,
          maxUsedIndex,
          minUnusedIndex,
          depth + 1
        );
      };
      //console.log("Executing internal binary search");
      this.nextFreeChangeAddressIndex = await binarySearchIterationForInternalAddress(
        100
      );
      //console.log(this.nextFreeAddressIndex);

      const binarySearchIterationForExternalAddress = async (
        index,
        maxUsedIndex = 0,
        minUnusedIndex = 100500100,
        depth = 0
      ) => {
        //console.log({ depth });
        if (depth >= 20) {
          return maxUsedIndex + 1;
        } // fail
        const txs = await this.fetchTransactions(
          this.getExternalAddressByIndex(index)
        );

        //console.log(txs);
        if (txs.totalTransactions === 0) {
          //console.log({ index });
          if (index === 0) {
            return 0;
          }
          minUnusedIndex = Math.min(minUnusedIndex, index); // set
          index = Math.floor((index - maxUsedIndex) / 2 + maxUsedIndex);
        } else {
          maxUsedIndex = Math.max(maxUsedIndex, index); // set
          const txs2 = await this.fetchTransactions(
            this.getExternalAddressByIndex(index + 1)
          );
          if (txs2.totalTransactions === 0) {
            return index + 1;
          } // thats our next free address

          index = Math.round((minUnusedIndex - index) / 2 + index);
        }

        return binarySearchIterationForExternalAddress(
          index,
          maxUsedIndex,
          minUnusedIndex,
          depth + 1
        );
      };

      //console.log("Executing external binary search");
      this.nextFreeAddressIndex = await binarySearchIterationForExternalAddress(
        100
      );
      //console.log(this.nextFreeAddressIndex);
      this.usedAddresses = [];

      // generating all involved addresses:
      for (let itr = 0; itr < this.nextFreeAddressIndex; itr++) {
        this.usedAddresses.push(this.getExternalAddressByIndex(itr));
      }
      for (let itr = 0; itr < this.nextFreeChangeAddressIndex; itr++) {
        this.usedAddresses.push(this.getInternalAddressByIndex(itr));
      }

      //console.log(this.usedAddresses);
      const res = await this.multiGetBalanceByAddress(this.usedAddresses);
      return res;
    } catch (err) {
      console.warn(err);
    }
  };

  public fetchUtxo = async () => {
    if (this.usedAddresses.length === 0) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    // let addresses = this.usedAddresses.join("|");
    // addresses +=
    //   "|" + this.getExternalAddressByIndex(this.nextFreeAddressIndex);
    // addresses +=
    //   "|" + this.getInternalAddressByIndex(this.nextFreeChangeAddressIndex);

    const UTXOs = [];
    // tslint:disable-next-line:forin
    for (const address of this.usedAddresses) {
      const utxos = await this.fetchUnspentOutputs(address);
      UTXOs.push(...utxos);
    }

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
    //   //console.log(err);
    // }

    // this.utxo = utxos;
  };

  public createHDTransaction = async (
    recipientAddress: string,
    amount: number,
    nSequence?: number,
    txnPriority?: string
  ): Promise<{ inputs: object[]; txb: TransactionBuilder; fee: number }> => {
    const inputUTXOs = await this.fetchUtxo();
    //console.log("Input UTXOs:", inputUTXOs);
    const outputUTXOs = [{ address: recipientAddress, value: amount }];
    //console.log("Output UTXOs:", outputUTXOs);
    const txnFee = await this.feeRatesPerByte(txnPriority);

    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      txnFee
    );
    //console.log("-------Transaction--------");
    //console.log("\tFee", fee);
    //console.log("\tInputs:", inputs);
    //console.log("\tOutputs:", outputs);

    const txb: TransactionBuilder = new bitcoinJS.TransactionBuilder(
      this.network
    );

    inputs.forEach(input => txb.addInput(input.txId, input.vout, nSequence));

    for (const output of outputs) {
      if (!output.address) {
        output.address = await this.getChangeAddressAsync();
      }
      //console.log("Added Output:", output);
      txb.addOutput(output.address, output.value);
    }

    return {
      inputs,
      txb,
      fee
    };
  };

  public signHDTransaction = (
    inputs: any,
    txb: TransactionBuilder,
    witnessScript?: any
  ): any => {
    //console.log("------ Transaction Signing ----------");
    let vin = 0;
    inputs.forEach(input => {
      //console.log("Signing Input:", input);
      const priv = this.getWifForAddress(input.address);
      //console.log({ priv });
      const keyPair = this.getKeyPair(priv);
      //console.log({ keyPair });
      txb.sign(
        vin,
        keyPair,
        this.getP2SH(keyPair).redeem.output,
        null,
        input.value,
        witnessScript
      );
      vin += 1;
    });

    return txb;
  };
}

// const wallet = new HDSegwitWallet();
// wallet.fetchBalance().then((data) => {
//   //console.log({ data });
//   //console.log("fetching utxo");
//   wallet.fetchUtxo();
// });
// wallet.getReceivingAddress().then(//console.log);

const wallet = new HDSegwitWallet();
wallet
  .createHDTransaction("2NAwqcZHo2DW9c8Qs9Jxaat3jHW3aqsBpFs", 3500)
  .then(res => {
    const signedTxb = wallet.signHDTransaction(res.inputs, res.txb);
    const txHex = signedTxb.build().toHex();
    //console.log(txHex);
    wallet.broadcastTransaction(txHex).then(console.log);
  });
