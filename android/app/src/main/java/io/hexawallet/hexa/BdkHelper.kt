package io.hexawallet.hexa

import com.google.gson.Gson
import org.bitcoindevkit.Address
import org.bitcoindevkit.AddressIndex
import org.bitcoindevkit.BdkException
import org.bitcoindevkit.Blockchain
import org.bitcoindevkit.BlockchainConfig
import org.bitcoindevkit.ElectrumConfig
import org.bitcoindevkit.LocalUtxo
import org.bitcoindevkit.Progress
import org.bitcoindevkit.TxBuilder

object BdkHelper {

    val TAG = "BdkHelper"

    fun getAddress():String {
        return BDKWalletRepository.wallet.getAddress(AddressIndex.LastUnused).address.asString()
    }

    fun sync():String {
        val blockchain = Blockchain(
            BlockchainConfig.Electrum(
                ElectrumConfig(
                    AppConstants.electrumURL,
                    null,
                    AppConstants.bdkRetry.toUByte(),
                    AppConstants.bdkTimeout.toUByte(),
                    AppConstants.bdkStopGap.toULong(),
                    true
                )
            )
        )
        val progressImplementation = object : Progress {
            override fun update(progress: Float, message: String?) {
                println("Progress: $progress, Message: $message")
            }
        }
        val isSycned = BDKWalletRepository.wallet.sync(blockchain, progressImplementation)
        return "true"
    }

    fun getBalance():String {
        val balance = BDKWalletRepository.wallet.getBalance()
        val gson = Gson()
        val json = gson.toJson(balance)
        return json.toString()
    }

    fun getTransactions():String {
        val txns = BDKWalletRepository.wallet.listTransactions(true)
        val gson = Gson()
        val json = gson.toJson(txns)
        return json.toString()
    }

    fun sendToAddress(address: String, amount: ULong, feeRate: Float): String {
        try {
            val psbt =
                TxBuilder()
                    .addRecipient(Address(address).scriptPubkey(), amount)
                    .feeRate(feeRate)
                    .finish(BDKWalletRepository.wallet)
                    .psbt
            BDKWalletRepository.wallet.sign(psbt,null)
            BDKWalletRepository.blockchain.broadcast(psbt.extractTx())

            return psbt.txid()
        } catch (e: BdkException.InsufficientFunds) {
            throw Exception("Insufficient sats")
        }
    }

    fun getUnspents(): List<LocalUtxo> {
        return BDKWalletRepository.wallet.listUnspent()
    }
}