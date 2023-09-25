package io.hexawallet.hexa

import android.util.Log
import com.google.gson.Gson
import org.bitcoindevkit.Address
import org.bitcoindevkit.AddressIndex
import org.bitcoindevkit.BdkException
import org.bitcoindevkit.Blockchain
import org.bitcoindevkit.BlockchainConfig
import org.bitcoindevkit.DatabaseConfig
import org.bitcoindevkit.DerivationPath
import org.bitcoindevkit.DescriptorSecretKey
import org.bitcoindevkit.ElectrumConfig
import org.bitcoindevkit.Mnemonic
import org.bitcoindevkit.Network
import org.bitcoindevkit.Progress
import org.bitcoindevkit.SqliteDbConfiguration
import org.bitcoindevkit.TxBuilder
import org.bitcoindevkit.Wallet

object BdkHelper {

    val TAG = "BdkHelper"

    fun getAddress():String {
        return BDKWalletRepository.wallet.getAddress(AddressIndex.LAST_UNUSED).address
    }

    fun sync():String {
        val blockchain = Blockchain(
            BlockchainConfig.Electrum(
                ElectrumConfig(
                    AppConstants.electrumURL,
                    null,
                    AppConstants.bdkRetry.toUByte(),
                    AppConstants.bdkTimeout.toUByte(),
                    AppConstants.bdkStopGap.toULong()
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
        val txns = BDKWalletRepository.wallet.listTransactions()
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
            BDKWalletRepository.wallet.sign(psbt)
            BDKWalletRepository.blockchain.broadcast(psbt)

            return psbt.txid()
        } catch (e: BdkException.InsufficientFunds) {
            throw Exception("Insufficient sats")
        }
    }
}