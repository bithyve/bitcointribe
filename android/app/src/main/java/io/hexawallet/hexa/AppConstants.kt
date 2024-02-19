package io.hexawallet.hexa

import android.content.Context
import java.io.File

object AppConstants {

    const val bdkDirName = ".bdk"
    const val rgbDirName = ""
    const val accountNumber = 0
    const val bdkDBName = "bdk_db_%s"
    const val vanillaWallet = "vanilla"
    lateinit var appContext: Context
    lateinit var bdkDir: File
    lateinit var rgbDir: File
    lateinit var bdkDBPath: File
    const val backupName = "%s.rgb_backup"

    const val testnetElectrumURL = "ssl://electrum.iriswallet.com:50013"

    const val proxyConsignmentEndpoint = "rpcs://proxy.iriswallet.com/0.2/json-rpc"
    const val rgbDefaultPrecision: UByte = 0U
    const val rgbBlindDuration = 86400U

    const val bdkTimeout = 5
    const val bdkRetry = 3
    const val bdkStopGap = 10

    const val satsForRgb = 9000UL
    const val defaultFeeRate = 1.5F


    @JvmStatic
    fun initContext(context: Context) {
        appContext = context
        bdkDir = File(appContext.filesDir, bdkDirName)
        rgbDir = File(appContext.filesDir, rgbDirName)
        bdkDBPath = File(appContext.filesDir, bdkDBName.format(vanillaWallet))
    }

    const val electrumURL = testnetElectrumURL

}