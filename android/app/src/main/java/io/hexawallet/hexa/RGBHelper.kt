package io.hexawallet.hexa

import android.util.Log
import com.google.gson.Gson
import org.rgbtools.AssetRgb20
import org.rgbtools.Balance
import org.rgbtools.BlindData
import org.rgbtools.Metadata
import org.rgbtools.RefreshFilter
import org.rgbtools.RefreshTransferStatus
import org.rgbtools.RgbLibException
import org.rgbtools.generateKeys
import kotlin.Exception
import kotlin.math.log

object RGBHelper {

    val TAG = "RGBHelper"

    fun generateNewKeys() {
        val keys = generateKeys(RGBWalletRepository.rgbNetwork)
        val gson = Gson()
        val json = gson.toJson(keys)
        json.toString()
    }

    fun syncRgbAssets(): String {
        return try {
            val filter = listOf(
                RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, true),
                RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, false)
            )
            val refresh =
                RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, null, filter)
            val assets = RGBWalletRepository.wallet.listAssets(listOf())
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
        Log.d(TAG, "startRGBReceiving:asset ")
        val blindedData = getBlindedUTXO(null, AppConstants.rgbBlindDuration)
        Log.d(TAG, "startRGBReceiving: "+blindedData)
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

    fun getMetadata(assetID: String): Metadata {
        return RGBWalletRepository.wallet.getAssetMetadata(RGBWalletRepository.online, assetID)
    }

    fun issueRgb20Asset(ticker: String, name: String, amounts: List<ULong>): String {
        //checkMaxAssets()
        val contract = handleMissingFunds { issueAssetRgb20(ticker, name, amounts) }
        val gson = Gson()
        val json = gson.toJson(contract)
        return json.toString()
    }

    fun issueAssetRgb20(ticker: String, name: String, amounts: List<ULong>): AssetRgb20 {
        return RGBWalletRepository.wallet.issueAssetRgb20(
            RGBWalletRepository.online,
            ticker,
            name,
            AppConstants.rgbDefaultPrecision,
            amounts
        )
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


}