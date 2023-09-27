package io.hexawallet.hexa
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.google.gson.Gson
import com.google.gson.JsonObject
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
        val rgbNetwork = if(network == "TESTNET") BitcoinNetwork.TESTNET else BitcoinNetwork.MAINNET
        val keys = org.rgbtools.generateKeys(rgbNetwork)
        val gson = Gson()
        val json = gson.toJson(keys)
        promise.resolve(json.toString())
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
        try {
            promise.resolve(RGBHelper.receiveAsset())
        }catch (e: Exception) {
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            promise.resolve(jsonObject.toString())
        }
    }
    @ReactMethod
    fun issueRgb20Asset( ticker: String, name: String, supply: String, promise: Promise){
        Log.d(TAG, "issueRgb20Asset: ${supply}")
        try {
            val amounts = listOf(supply)
            val response = RGBHelper.issueRgb20Asset(ticker, name, amounts.map { it.toULong() })
            promise.resolve(response)
        }catch (e: Exception) {
            Log.d(TAG, "issueRgb20Asset:e.message ${e.message}")

            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            promise.resolve(jsonObject.toString())
        }
    }

    @ReactMethod
    fun issueRgb25Asset( description: String, name: String, supply: String,filePath: String, promise: Promise){
        try {
            val amounts = listOf(supply)
            val response = RGBHelper.issueRgb25Asset(description, name, amounts.map { it.toULong() }, filePath)
            promise.resolve(response)
        }catch (e: Exception) {
            Log.d(TAG, "issueRgb20Asset:e.message ${e.message}")
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            promise.resolve(jsonObject.toString())
        }
    }

    @ReactMethod
    fun getRgbAssetMetaData( assetId: String, promise: Promise){
        promise.resolve(RGBHelper.getMetadata(assetId))
    }

    @ReactMethod
    fun getRgbAssetTransactions( assetId: String, promise: Promise){
        promise.resolve(RGBHelper.getAssetTransfers(assetId))
    }

    @ReactMethod
    fun sendAsset( assetId: String, blindedUTXO: String, amount: String, consignmentEndpoints: String, promise: Promise){
        try {
            val endpoints = listOf(consignmentEndpoints)
            Log.d(TAG, "sendAsset: consignmentEndpoints=$consignmentEndpoints")
            promise.resolve(RGBHelper.send(assetId, blindedUTXO, amount.toULong(), endpoints))
        }catch (e: Exception) {
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            promise.resolve(jsonObject.toString())
        }
    }

    @ReactMethod
    fun getUnspents(promise: Promise){
        val rgbUtxo = RGBHelper.getUnspents()
        val bitcoinUtxo = BdkHelper.getUnspents()
        val jsonObject = JsonObject()
        jsonObject.addProperty("rgb", Gson().toJson(rgbUtxo))
        jsonObject.addProperty("bitcoin", Gson().toJson(bitcoinUtxo))
        promise.resolve(jsonObject.toString())
    }
}
