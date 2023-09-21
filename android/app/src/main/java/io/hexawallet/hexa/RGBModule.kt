package io.hexawallet.hexa
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import org.rgbtools.BitcoinNetwork
import org.rgbtools.generateKeys
import org.json.JSONObject

class RGBModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override
    fun getName() = "RGB"

    private fun getRgbNetwork(network: String): BitcoinNetwork {
        return if (network == "TESTNET") BitcoinNetwork.TESTNET else BitcoinNetwork.MAINNET
    }

    private fun generateKeysWithBtcNetwork(btcNetwork: String, callback: (String) -> Unit) {
        val network = getRgbNetwork(btcNetwork)
        val keys = generateKeys(network)

//        val documentDirectory = File(Environment.getExternalStorageDirectory(), Environment.DIRECTORY_DOCUMENTS)
//        val bdkDir = File(documentDirectory, Constants.bdkDirName)
//        val rgbDir = File(documentDirectory, Constants.rgbDirName)

        val data = mapOf<String, Any>(
            "mnemonic" to keys.mnemonic,
            "xpub" to keys.xpub,
            "xpubFingerprint" to keys.xpubFingerprint,
//            "rgbDir" to rgbDir.absolutePath,
//            "bdkDir" to bdkDir.absolutePath
        )

        val json = JSONObject(data).toString()
        callback(json)
    }

    @ReactMethod
    fun generateKeys(network: String, promise: Promise) {

        generateKeysWithBtcNetwork(network) {response -> 
            promise.resolve(response)
        }
    }
}
