package io.hexawallet.hexa
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import org.rgbtools.BitcoinNetwork

import kotlin.math.log

class RGBModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    val TAG = "RGBMODULE"
    override
    fun getName() = "RGB"

    private fun getRgbNetwork(network: String): BitcoinNetwork {
        return if (network == "TESTNET") BitcoinNetwork.TESTNET else BitcoinNetwork.MAINNET
    }

    @ReactMethod
    fun generateKeys(network: String, promise: Promise) {
        promise.resolve(RGBHelper.generateNewKeys())
    }

    @ReactMethod
    fun getAddress(mnemonic:String, network: String, promise: Promise) {
        val address = BdkHelper.getAddress()
        promise.resolve(address)
    }
    @ReactMethod
    fun initiate(network: String, mnemonic:String, xpub: String, promise: Promise){
        BDKWalletRepository.initialize(mnemonic, network)
        promise.resolve(RGBWalletRepository.initialize(network,mnemonic,xpub))
    }

    @ReactMethod
    fun sync( mnemonic:String, network: String, promise: Promise){
        val isSynced = BdkHelper.sync()
        promise.resolve(isSynced)
    }

    @ReactMethod
    fun getBalance( mnemonic:String,network: String, promise: Promise){
        promise.resolve(BdkHelper.getBalance())
    }

    @ReactMethod
    fun getTransactions( mnemonic:String,network: String, promise: Promise){
        promise.resolve(BdkHelper.getTransactions())
    }

    @ReactMethod
    fun syncRgbAssets( mnemonic:String, pubKey:String, network: String, promise: Promise){
        promise.resolve(RGBHelper.syncRgbAssets())
    }

    @ReactMethod
    fun receiveAsset( mnemonic:String, network: String, promise: Promise){
        promise.resolve(RGBHelper.receiveAsset())
    }
    @ReactMethod
    fun issueRgb20Asset( ticker: String, name: String, supply: String, promise: Promise){
        val amounts = listOf(supply)
        promise.resolve(RGBHelper.issueRgb20Asset(ticker, name, amounts.map { it.toULong() }))
    }

    @ReactMethod
    fun getRgbAssetMetaData( assetId: String, promise: Promise){
        promise.resolve(RGBHelper.getMetadata(assetId))
    }

    @ReactMethod
    fun getRgbAssetTransactions( assetId: String, promise: Promise){
        promise.resolve(RGBHelper.getAssetTransfers(assetId))
    }
}
