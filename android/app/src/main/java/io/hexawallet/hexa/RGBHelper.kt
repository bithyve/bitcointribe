package io.hexawallet.hexa

import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonObject
import org.rgbtools.AssetRgb20
import org.rgbtools.AssetRgb25
import org.rgbtools.Balance
import org.rgbtools.BlindData
import org.rgbtools.Recipient
import org.rgbtools.RefreshFilter
import org.rgbtools.RefreshTransferStatus
import org.rgbtools.RgbLibException
import org.rgbtools.Unspent
import kotlin.Exception
import kotlin.math.log

object RGBHelper {

    val TAG = "RGBHelper"

    fun syncRgbAssets(): String {
        return try {

           // val filter = listOf()
            val refresh =
                RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, null, listOf())
            var assets = RGBWalletRepository.wallet.listAssets(listOf())
            val rgb25Assets = assets.rgb25
            val rgb20Assets = assets.rgb20
            if (rgb20Assets != null) {
                for (rgb20Asset in rgb20Assets) {
                    val assetRefresh = RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, rgb20Asset.assetId, listOf())
                }
            }
            if (rgb25Assets != null) {
                for (rgb25Asset in rgb25Assets) {
                    val assetRefresh = RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, rgb25Asset.assetId, listOf())
                }
            }
            assets = RGBWalletRepository.wallet.listAssets(listOf())
            val gson = Gson()
            val json = gson.toJson(assets)
            json.toString()
        } catch (e: Exception) {
            "null"
        }
    }

    private fun startRGBReceiving(): String {

            val filter = listOf(
                RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, true),
                RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, false)
            )
            val refresh = RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, null, filter)
            val blindedData = getBlindedUTXO(null, AppConstants.rgbBlindDuration)
            val gson = Gson()
            val json = gson.toJson(blindedData)
            return json.toString()

    }

    fun receiveAsset(): String {
        return handleMissingFunds{ startRGBReceiving() }
    }

    private fun <T> handleMissingFunds(callback: () -> T): T {
        return try {
            callback()
        } catch (e: RgbLibException) {
            Log.d(TAG, "handleMissingFunds: RgbLibException ${e.message}")
            val jsonObject = JsonObject()
            when (e) {
                is RgbLibException.InsufficientBitcoins,
                is RgbLibException.InsufficientAllocationSlots -> {
                    createUTXOs(e)
                    //updateBitcoinAsset()
                    callback()
                }
                is RgbLibException.InvalidBlindedUtxo ->
                    throw Exception("Invalid blinded utxo")
                is RgbLibException.BlindedUtxoAlreadyUsed ->
                    throw Exception("Blinded utxo already used")
                else -> throw e
            }
        }
    }

    private fun getAddress(): String {
        return RGBWalletRepository.wallet.getAddress()
    }

    fun getBalance(assetID: String): Balance {
        return RGBWalletRepository.wallet.getAssetBalance(assetID)
    }

    fun getBlindedUTXO(assetID: String? = null, expirationSeconds: UInt): BlindData {
        Log.d(TAG, "getBlindedUTXO: assetID"+assetID)
        return RGBWalletRepository.wallet.blind(
            assetID,
            null,
            expirationSeconds,
            listOf(AppConstants.proxyConsignmentEndpoint)
        )
    }

    fun getMetadata(assetID: String): String {
        return Gson().toJson(RGBWalletRepository.wallet.getAssetMetadata(RGBWalletRepository.online, assetID)).toString()
    }

    fun getAssetTransfers(assetID: String): String {
        val refresh = RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, assetID, listOf())
        return Gson().toJson(RGBWalletRepository.wallet.listTransfers(assetID).reversed()).toString()
    }

    fun getTransactions(): String {
        return Gson().toJson(RGBWalletRepository.wallet.listTransactions(RGBWalletRepository.online)).toString()
    }

    fun refresh(assetID: String? = null, light: Boolean = false): Boolean {
        val filter =
            if (light)
                listOf(
                    RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, true),
                    RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, false)
                )
            else listOf()
        val refresh = RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, assetID, filter)
        Log.d(TAG, "refresh: $refresh")
        return refresh
    }

    fun send(
        assetID: String,
        blindedUTXO: String,
        amount: ULong,
        consignmentEndpoints: List<String>,
        feeRate: Float = AppConstants.defaultFeeRate,
    ): String {
        val txid = handleMissingFunds { RGBWalletRepository.wallet.send(
            RGBWalletRepository.online,
            mapOf(assetID to listOf(Recipient(blindedUTXO, amount, listOf("rpcs://proxy.iriswallet.com/json-rpc")))),
            false,
            feeRate,
        ) }
        val jsonObject = JsonObject()
        jsonObject.addProperty("txid", txid)
        return jsonObject.toString()
    }

    fun issueRgb20Asset(ticker: String, name: String, amounts: List<ULong>): String {
        return try {
            Log.d(TAG, "issueRgb20Asset: ticker= $ticker name= $name amounts= $amounts")

            //checkMaxAssets()
            val contract = handleMissingFunds { issueAssetRgb20(ticker, name, amounts) }
            val gson = Gson()
            val json = gson.toJson(contract)
            return json.toString()
        }catch (e: Exception) {
            Log.d(TAG, "issueRgb20Asset: Exception= ${e.message}")
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            return jsonObject.toString()
        }
    }

    fun issueRgb25Asset(description: String, name: String, amounts: List<ULong>, filePath: String): String {
        return try {
            Log.d(TAG, "issueRgb25Asset: filePath= $filePath name= $name")
            //checkMaxAssets()
            val contract = handleMissingFunds { issueAssetRgb25(description, name, amounts, filePath) }
            val gson = Gson()
            val json = gson.toJson(contract)
            return json.toString()
        }catch (e: Exception) {
            Log.d(TAG, "issueRgb25Asset: Exception= ${e.message}")
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            return jsonObject.toString()
        }
    }

    private fun issueAssetRgb20(ticker: String, name: String, amounts: List<ULong>): AssetRgb20 {
         val asset = RGBWalletRepository.wallet.issueAssetRgb20(
            RGBWalletRepository.online,
            ticker,
            name,
            AppConstants.rgbDefaultPrecision,
            amounts
        )
        Log.d(TAG, "issueAssetRgb20: New asset = ${asset.assetId}")
        return  asset
    }

    private fun issueAssetRgb25(description: String, name: String, amounts: List<ULong>, filePath: String): AssetRgb25 {
        val asset = RGBWalletRepository.wallet.issueAssetRgb25(
            RGBWalletRepository.online,
            name,
            description,
            AppConstants.rgbDefaultPrecision,
            amounts,
            filePath
        )
        Log.d(TAG, "issueAssetRgb25: New asset = ${asset.assetId}")
        return  asset
    }

    fun createUTXOs(): UByte {
        return RGBWalletRepository.wallet.createUtxos(
            RGBWalletRepository.online,
            false,
            null,
            null,
            AppConstants.defaultFeeRate
        )
    }

    private fun createUTXOs(e: Exception) {
        Log.d(TAG, "Creating UTXOs because: ${e.message}")
        if (e is RgbLibException.InsufficientBitcoins) {
            Log.d(TAG, "Sending funds to RGB wallet...")
            try {
                val txid =
                    BdkHelper.sendToAddress(
                        getAddress(),
                        AppConstants.satsForRgb,
                        AppConstants.defaultFeeRate
                    )
                Log.d(TAG, "createUTXOs: txid=${txid}")
            } catch (e: Exception) {
                throw Exception("Insufficient sats for RGB")
            }
        }
        var attempts = 3
        var newUTXOs: UByte = 0u
        while (newUTXOs == 0u.toUByte() && attempts > 0) {
            try {
                Log.d(TAG, "Calling create UTXOs...")
                newUTXOs = createUTXOs()
            } catch (_: RgbLibException.InsufficientBitcoins) {}
            attempts--
        }
    }

    fun getUnspents(): List<Unspent> {
        return RGBWalletRepository.wallet.listUnspents(false)
    }

    fun refreshAsset(assetID: String) {
        //return RGBWalletRepository.wallet.refresh(assetID, )
    }

    fun backup(backupPath: String, password: String) {
        return RGBWalletRepository.wallet.backup(backupPath, password)
    }

}