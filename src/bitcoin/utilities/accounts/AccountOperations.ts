import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoinJS from 'bitcoinjs-lib'
import coinselect from 'coinselect'
import crypto from 'crypto'
import config from '../../HexaConfig'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  TrustedContactDerivativeAccount,
  TrustedContactDerivativeAccountElements,
  DonationDerivativeAccount,
  DonationDerivativeAccountElements,
  SubPrimaryDerivativeAccountElements,
  WyreDerivativeAccountElements,
  RampDerivativeAccountElements,
  DerivativeAccount,
  DerivativeAccountElements,
  InputUTXOs,
  AverageTxFees,
  TransactionPrerequisiteElements,
  ContactDetails,
  Account,
} from '../Interface'
import { AxiosResponse } from 'axios'
import {
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  WYRE,
  RAMP,
  FAST_BITCOINS,
  SWAN,
} from '../../../common/constants/wallet-service-types'
import { BH_AXIOS } from '../../../services/api'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import _ from 'lodash'
import SSS from '../sss/SSS'
import AccountUtilities from './AccountUtilities'
const { HEXA_ID } = config

export default class AccountOperations {

  static syncGapLimit = async ( account: Account ) => {
    let tryAgain = false
    const hardGapLimit = 10
    const externalAddress = AccountUtilities.getAddressByIndex(
      account.xpub,
      false,
      account.nextFreeAddressIndex + hardGapLimit - 1,
      account.network
    )

    const internalAddress = AccountUtilities.getAddressByIndex(
      account.xpub,
      true,
      account.nextFreeChangeAddressIndex + hardGapLimit - 1,
      account.network
    )

    const txCounts = await AccountUtilities.getTxCounts( [ externalAddress, internalAddress ], account.network )

    if ( txCounts[ externalAddress ] > 0 ) {
      account.nextFreeAddressIndex += hardGapLimit
      tryAgain = true
    }

    if ( txCounts[ internalAddress ] > 0 ) {
      account.nextFreeChangeAddressIndex += hardGapLimit
      tryAgain = true
    }

    if ( tryAgain ) {
      return AccountOperations.syncGapLimit(
        account
      )
    }
  };

  static findTxDelta = ( previousTxidMap, currentTxIdMap, transactions ) => {
    // return new/found transactions(delta b/w hard and soft refresh)
    const txsFound: TransactionDetails[] = []
    const newTxIds: string[] = _.difference( Object.keys( currentTxIdMap ),  Object.keys( previousTxidMap ) )
    const newTxIdMap = {
    }
    newTxIds.forEach( ( txId ) => newTxIdMap[ txId ] = true )

    if( newTxIds.length ){
      transactions.transactionDetails.forEach( tx => {
        if( newTxIdMap[ tx.txid ] ) txsFound.push( tx )
      } )
    }

    return txsFound
  }

    static setNewTransactions = ( account: Account ) => {
      const lastSynced = account.lastSynched
      let latestSync = lastSynced
      const transactions = account.transactions
      const newTransactions = [] // delta transactions
      for ( const tx of transactions.transactionDetails ) {
        if ( tx.status === 'Confirmed' && tx.transactionType === 'Received' ) {
          if ( tx.blockTime > lastSynced ) newTransactions.push( tx )
          if ( tx.blockTime > latestSync ) latestSync = tx.blockTime
        }
      }
      account.lastSynched = latestSync
      account.newTransactions = newTransactions
    };

    static updateQueryList = ( account: Account, consumedUTXOs: {[txid: string]: InputUTXOs} ) => {
      const softGapLimit = 5

      // updates query list(primary: reg/test) with out of bound(lower bound) external/internal addresses
      const startingExtIndex = account.nextFreeAddressIndex - softGapLimit >= 0? account.nextFreeAddressIndex - softGapLimit : 0
      const startingIntIndex = account.nextFreeChangeAddressIndex - softGapLimit >= 0? account.nextFreeChangeAddressIndex - softGapLimit : 0

      for( const consumedUTXO of Object.values( consumedUTXOs ) ){
        let found = false
        // is out of bound external address?
        if( startingExtIndex )
          for ( let itr = 0; itr < startingExtIndex; itr++ ) {
            const address = AccountUtilities.getAddressByIndex( account.xpub, false, itr, account.network )
            if( consumedUTXO.address === address ){
              account.addressQueryList.external[ consumedUTXO.address ] = true// include out of bound(soft-refresh range) ext address
              found = true
              break
            }
          }

        // is out of bound internal address?
        if( startingIntIndex && !found )
          for ( let itr = 0; itr < startingIntIndex; itr++ ) {
            const address = AccountUtilities.getAddressByIndex( account.xpub, true, itr, account.network )
            if( consumedUTXO.address === address ){
              account.addressQueryList.internal[ consumedUTXO.address ] = true // include out of bound(soft-refresh range) int address
              found = true
              break
            }
          }
      }
    }

    static removeConsumedUTXOs= ( account: Account, inputs: InputUTXOs[] ) => {
      const consumedUTXOs: {[txid: string]: InputUTXOs} = {
      }
      inputs.forEach( ( input ) => {
        consumedUTXOs[ input.txId ] = input
      } )

      // update primary utxo set and balance
      const updatedUTXOSet = []
      let consumedBalance = 0

      account.confirmedUTXOs.forEach( confirmedUTXO => {
        let include = true
        if( consumedUTXOs[ confirmedUTXO.txId ] ) {
          include = false
          consumedBalance += consumedUTXOs[ confirmedUTXO.txId ].value
        }
        if( include ) updatedUTXOSet.push( confirmedUTXO )
      } )

      account.balances.balance -= consumedBalance
      account.confirmedUTXOs = updatedUTXOSet


      AccountOperations.updateQueryList( account, consumedUTXOs )
    }

    static calculateSendMaxFee = (
      account: Account,
      numberOfRecipients: number,
      feePerByte: number,
      network: bitcoinJS.networks.Network
    ): { fee: number } => {

      const inputUTXOs = account.confirmedUTXOs
      let confirmedBalance = 0
      inputUTXOs.forEach( ( utxo ) => {
        confirmedBalance += utxo.value
      } )

      const outputUTXOs = []
      for ( let index = 0; index < numberOfRecipients; index++ ) {
      // using random outputs for send all fee calculation
        outputUTXOs.push( {
          address: bitcoinJS.payments.p2sh( {
            redeem: bitcoinJS.payments.p2wpkh( {
              pubkey: bitcoinJS.ECPair.makeRandom().publicKey,
              network,
            } ),
            network,
          } ).address,
          value: Math.floor( confirmedBalance / numberOfRecipients ),
        } )
      }
      const { fee } = coinselect(
        inputUTXOs,
        outputUTXOs,
        feePerByte,
      )

      return {
        fee
      }
    };

    static prepareTransactionPrerequisites = (
      account: Account,
      recipients: {
      address: string;
      amount: number;
    }[],
      averageTxFees: AverageTxFees,
    ): {
        fee: number;
        balance: number;
        txPrerequisites?: undefined;
      }
    | {
        txPrerequisites: TransactionPrerequisite;
        fee?: undefined;
        balance?: undefined;
      } => {

      const inputUTXOs = account.confirmedUTXOs
      let confirmedBalance = 0
      inputUTXOs.forEach( ( utxo ) => {
        confirmedBalance += utxo.value
      } )

      const outputUTXOs = []
      for ( const recipient of recipients ) {
        outputUTXOs.push( {
          address: recipient.address,
          value: recipient.amount,
        } )
      }

      const defaultTxPriority = 'low' // doing base calculation with low fee (helps in sending the tx even if higher priority fee isn't possible)
      const defaultFeePerByte = averageTxFees[ defaultTxPriority ].feePerByte
      const defaultEstimatedBlocks =
      averageTxFees[ defaultTxPriority ].estimatedBlocks

      const assets = coinselect( inputUTXOs, outputUTXOs, defaultFeePerByte )
      const defaultPriorityInputs = assets.inputs
      const defaultPriorityOutputs = assets.outputs
      const defaultPriorityFee = assets.fee

      let netAmount = 0
      recipients.forEach( ( recipient ) => {
        netAmount += recipient.amount
      } )
      const defaultDebitedAmount = netAmount + defaultPriorityFee
      if ( !defaultPriorityInputs || defaultDebitedAmount > confirmedBalance ) {
      // insufficient input utxos to compensate for output utxos + lowest priority fee
        return {
          fee: defaultPriorityFee, balance: confirmedBalance
        }
      }

      const txPrerequisites: TransactionPrerequisite = {
      }
      for ( const priority of [ 'low', 'medium', 'high' ] ) {
        if (
          priority === defaultTxPriority ||
        defaultDebitedAmount === confirmedBalance
        ) {
          txPrerequisites[ priority ] = {
            inputs: defaultPriorityInputs,
            outputs: defaultPriorityOutputs,
            fee: defaultPriorityFee,
            estimatedBlocks: defaultEstimatedBlocks,
          }
        } else {
        // re-computing inputs with a non-default priority fee
          const { inputs, outputs, fee } = coinselect(
            inputUTXOs,
            outputUTXOs,
            averageTxFees[ priority ].feePerByte,
          )
          const debitedAmount = netAmount + fee
          if ( !inputs || debitedAmount > confirmedBalance ) {
          // to previous priority assets
            if ( priority === 'medium' )
              txPrerequisites[ priority ] = txPrerequisites[ 'low' ]
            if ( priority === 'high' )
              txPrerequisites[ priority ] = txPrerequisites[ 'medium' ]
          } else {
            txPrerequisites[ priority ] = {
              inputs,
              outputs,
              fee,
              estimatedBlocks: averageTxFees[ priority ].estimatedBlocks,
            }
          }
        }
      }

      return {
        txPrerequisites
      }
    };

    static prepareCustomTransactionPrerequisites = (
      account: Account,
      outputUTXOs: {
      address: string;
      value: number;
    }[],
      customTxFeePerByte: number,
    ): TransactionPrerequisiteElements => {
      const inputUTXOs = account.confirmedUTXOs
      const { inputs, outputs, fee } = coinselect(
        inputUTXOs,
        outputUTXOs,
        customTxFeePerByte,
      )

      if ( !inputs ) return {
        fee
      }

      return {
        inputs, outputs, fee
      }
    };

    static createTransaction = async (
      account: Account,
      txPrerequisites: TransactionPrerequisite,
      txnPriority: string,
      network: bitcoinJS.networks.Network,
      customTxPrerequisites?: TransactionPrerequisiteElements,
      derivativeAccountDetails?: { type: string; number: number },
      nSequence?: number,
    ): Promise<{
    txb: bitcoinJS.TransactionBuilder;
  }> => {
      try {
        let inputs, outputs
        if ( txnPriority === 'custom' && customTxPrerequisites ) {
          inputs = customTxPrerequisites.inputs
          outputs = customTxPrerequisites.outputs
        } else {
          inputs = txPrerequisites[ txnPriority ].inputs
          outputs = txPrerequisites[ txnPriority ].outputs
        }
        // console.log({ inputs, outputs });
        const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
          network,
        )

        for ( const input of inputs ) {
          txb.addInput( input.txId, input.vout, nSequence )
        }

        const sortedOuts = await AccountUtilities.sortOutputs(
          account.xpub,
          outputs,
          account.nextFreeChangeAddressIndex,
          network
        )

        for ( const output of sortedOuts ) {
          txb.addOutput( output.address, output.value )
        }

        return {
          txb,
        }
      } catch ( err ) {
        throw new Error( `Transaction creation failed: ${err.message}` )
      }
    };

    static signTransaction = (
      account: Account,
      inputs: any,
      txb: bitcoinJS.TransactionBuilder,
      network: bitcoinJS.networks.Network,
      witnessScript?: any,
    ): bitcoinJS.TransactionBuilder => {
      try {
        let vin = 0
        for ( const input of inputs ) {
          const privateKey = AccountUtilities.addressToPrivateKey(
            input.address,
            account.xpub,
            account.nextFreeAddressIndex,
            account.nextFreeChangeAddressIndex,
            network
          )

          const keyPair = AccountUtilities.getKeyPair(
            privateKey,
            network
          )

          txb.sign(
            vin,
            keyPair,
            AccountUtilities.getP2SH( keyPair, network ).redeem.output,
            null,
            input.value,
            witnessScript,
          )
          vin++
        }

        return txb
      } catch ( err ) {
        throw new Error( `Transaction signing failed: ${err.message}` )
      }
    };
}
