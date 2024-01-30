package io.hexawallet.hexa

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.http.FileContent
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.gson.Gson
import com.google.gson.JsonObject
import org.rgbtools.AssetCfa
import org.rgbtools.AssetNia
import org.rgbtools.Balance
import org.rgbtools.BlindedUtxo
import org.rgbtools.ReceiveData
import org.rgbtools.Recipient
import org.rgbtools.RefreshFilter
import org.rgbtools.RefreshTransferStatus
import org.rgbtools.RgbLibException
import org.rgbtools.Unspent
import org.rgbtools.restoreBackup
import org.rgbtools.restoreKeys
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import kotlin.Exception

object RGBHelper {

    val TAG = "RGBHelper"
    private lateinit var driveClient: Drive
    private const val ZIP_MIME_TYPE = "application/zip"


    fun syncRgbAssets(): String {
        return try {

            // val filter = listOf()
            val refresh =
                RGBWalletRepository.wallet.refresh(RGBWalletRepository.online, null, listOf())
            var assets = RGBWalletRepository.wallet.listAssets(listOf())
            val rgb25Assets = assets.cfa
            val rgb20Assets = assets.nia
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
            Log.d(TAG, "syncRgbAssets: ${assets.toString()}")
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
                is RgbLibException.InvalidBlindedUtxo ->
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

    fun getBlindedUTXO(assetID: String? = null, expirationSeconds: UInt): ReceiveData {
        Log.d(TAG, "getBlindedUTXO: assetID"+assetID)
        return RGBWalletRepository.wallet.blindReceive(
            assetID,
            null,
            expirationSeconds,
            listOf(AppConstants.proxyConsignmentEndpoint),
            0u
        )
    }

    fun getMetadata(assetID: String): String {
        return Gson().toJson(RGBWalletRepository.wallet.getAssetMetadata(assetID)).toString()
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
            mapOf(assetID to listOf(Recipient(blindedUTXO,null, amount, consignmentEndpoints))),
            false,
            feeRate,
            0u
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

    private fun issueAssetRgb20(ticker: String, name: String, amounts: List<ULong>): AssetNia {
        val asset = RGBWalletRepository.wallet.issueAssetNia(
            RGBWalletRepository.online,
            ticker,
            name,
            AppConstants.rgbDefaultPrecision,
            amounts
        )
        Log.d(TAG, "issueAssetRgb20: New asset = ${asset.assetId}")
        return  asset
    }

    private fun issueAssetRgb25(description: String, name: String, amounts: List<ULong>, filePath: String): AssetCfa {
        val asset = RGBWalletRepository.wallet.issueAssetCfa(
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
                BdkHelper.sync()
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
        return RGBWalletRepository.wallet.listUnspents(RGBWalletRepository.online,false)
    }

    fun refreshAsset(assetID: String) {
        //return RGBWalletRepository.wallet.refresh(assetID, )
    }

    private fun getBackupFile(mnemonic: String, context: ReactApplicationContext): File {
        val keys = restoreKeys(RGBWalletRepository.rgbNetwork, mnemonic)
        return File(
            context.filesDir,
            AppConstants.backupName.format(keys.xpubFingerprint)
        )
    }

    fun backup(backupPath: String, password: String, context: ReactApplicationContext): String {
        try {
            val gAccount = GoogleSignIn.getLastSignedInAccount(context)
            val credential =
                GoogleAccountCredential.usingOAuth2(
                    context,
                    listOf(DriveScopes.DRIVE_FILE)
                )

            if (gAccount != null) {
                credential.selectedAccount = gAccount.account!!
            }
            driveClient =
                Drive.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance(), credential)
                    .setApplicationName("tribe")
                    .build()
            val backupFile = getBackupFile(password, context)
            backupFile.delete()
            RGBWalletRepository.wallet.backup(backupFile.absolutePath, password)
            Log.d(TAG, "Backup done name='${backupFile.name}")

            val gFile = com.google.api.services.drive.model.File()
            gFile.name = backupFile.name
            Log.d(TAG, "gFile='${gFile.name}")
            val newBackupID =
                driveClient.files().create(gFile, FileContent(ZIP_MIME_TYPE, backupFile)).execute().id
            Log.d(TAG, "Backup uploaded. Backup file ID: $newBackupID")
            val oldBackups = driveClient.files().list().setQ("name='${backupFile.name}'").execute()
            Log.d(TAG, "oldBackups='$oldBackups")
//            if (oldBackups != null) {
//                for (file in oldBackups.files) {
//                    Log.d(TAG, "Deleting old backup file ${file.id} ...")
//                    driveClient.files().delete(file.id).execute()
//                }
//            }
            Log.d(TAG, "Backup operation completed")
            return ""
        }catch (e: Exception){
            Log.d(TAG, "Exception: ${e}")

            return ""
        }
    }

    fun getBackupInfo(): Boolean {
        return RGBWalletRepository.wallet.backupInfo()
    }

    fun restore(password: String, context: ReactApplicationContext): String {
        try {
            val gAccount = GoogleSignIn.getLastSignedInAccount(context)
            val credential =
                GoogleAccountCredential.usingOAuth2(
                    context,
                    listOf(DriveScopes.DRIVE_FILE)
                )
            if (gAccount != null) {
                credential.selectedAccount = gAccount.account!!
            }
            driveClient =
                Drive.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance(), credential)
                    .setApplicationName("tribe")
                    .build()
            val backupFile = getBackupFile(password, context)
            val lastBackups =
                driveClient
                    .files()
                    .list()
                    .setQ("name='${backupFile.name}'")
                    .setOrderBy("createdTime")
                    .execute()
            val oldBackups = driveClient.files().list().setQ("name='${backupFile.name}'").execute()
            Log.d(TAG, "oldBackups='$oldBackups")
            if (lastBackups.files.isNullOrEmpty()){
                return "No backup"
            }
            val lastBackup = lastBackups.files.last()


            val outputStream: OutputStream = FileOutputStream(backupFile)
            driveClient.files().get(lastBackup.id).executeMediaAndDownloadTo(outputStream)
            return restoreBackup(backupFile.absolutePath, password, AppConstants.rgbDir.absolutePath).toString()
        }catch (e: Exception){
            Log.d(TAG, "Exception: ${e}")
            return ""
        }
    }

    fun isValidBlindedUtxo(invoice: String): Boolean {
        return try {
            BlindedUtxo(invoice)
            true
        } catch (e: RgbLibException.InvalidBlindedUtxo){
            false
        }
    }



}
