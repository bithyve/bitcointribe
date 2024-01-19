package io.hexawallet.hexa

import android.util.Log
import org.rgbtools.BitcoinNetwork
import org.rgbtools.DatabaseType
import org.rgbtools.Online
import org.rgbtools.RgbLibException
import org.rgbtools.Wallet
import org.rgbtools.WalletData

object RGBWalletRepository {

    val TAG = "RGBWalletRepository"

    lateinit var wallet: Wallet
    lateinit var online: Online
    lateinit var rgbNetwork: BitcoinNetwork

    init {
    }

    fun  initialize(network: String, mnemonic:String, xpub: String): String{
        try {
            rgbNetwork = getNetwork(network)
            val walletData =  WalletData(
                AppConstants.rgbDir.absolutePath,
                rgbNetwork,
                DatabaseType.SQLITE,
                1u,
                xpub,
                mnemonic,
                1u
            )
            wallet = Wallet(walletData)
            online = wallet.goOnline(true, AppConstants.electrumURL)
            return "true"
        }catch (e: RgbLibException) {
            Log.d(TAG, "initialize: "+e.message)
            return "false"
        }
    }

    private fun getNetwork(network: String) : BitcoinNetwork {
        return if(network == "TESTNET") BitcoinNetwork.TESTNET else BitcoinNetwork.MAINNET
    }
}
