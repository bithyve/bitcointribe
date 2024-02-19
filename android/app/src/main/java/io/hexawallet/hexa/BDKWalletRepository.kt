package io.hexawallet.hexa

import org.bitcoindevkit.Blockchain
import org.bitcoindevkit.BlockchainConfig
import org.bitcoindevkit.DatabaseConfig
import org.bitcoindevkit.DerivationPath
import org.bitcoindevkit.Descriptor
import org.bitcoindevkit.DescriptorSecretKey
import org.bitcoindevkit.ElectrumConfig
import org.bitcoindevkit.Mnemonic
import org.bitcoindevkit.Network
import org.bitcoindevkit.SqliteDbConfiguration
import org.bitcoindevkit.Wallet

object BDKWalletRepository {

    val TAG = "BDKWalletRepository"

    lateinit var wallet: Wallet
    lateinit var bitcoinNetwork: Network
    lateinit var blockchain: Blockchain

    init {
    }

    private fun getNetwork(network: String) : Network {
        return  if(network == "TESTNET") Network.TESTNET else Network.BITCOIN
    }

    fun  initialize(mnemonic: String, btcNetwork: String): String {
        return try {
            bitcoinNetwork = getNetwork(btcNetwork)
            blockchain = Blockchain(
                BlockchainConfig.Electrum(
                    ElectrumConfig(
                        AppConstants.electrumURL,
                        null,
                        AppConstants.bdkRetry.toUByte(),
                        AppConstants.bdkTimeout.toUByte(),
                        AppConstants.bdkStopGap.toULong(),
                        false
                    )
                )
            )
            val descriptorSecretKey = DescriptorSecretKey(bitcoinNetwork , Mnemonic.fromString(mnemonic), null)
            val descriptor: String = calculateDescriptor(descriptorSecretKey, bitcoinNetwork, false)
            val changeDescriptor: String = calculateDescriptor(descriptorSecretKey, bitcoinNetwork, true)
            val dbPath = AppConstants.bdkDBPath
            wallet =  Wallet(
                Descriptor(descriptor, bitcoinNetwork),
                Descriptor(changeDescriptor, bitcoinNetwork),
                bitcoinNetwork,
                DatabaseConfig.Sqlite(SqliteDbConfiguration(dbPath.absolutePath)),)
            "true"
        }catch (e: Exception) {
            "false"
        }
    }

    private fun calculateDescriptor(keys: DescriptorSecretKey, network: Network, change: Boolean): String {
        val changeNum = if (change) 1 else 0
        val path =
            DerivationPath(
                "m/84'/${getBitcoinDerivationPathCoinType(network)}'/${AppConstants.accountNumber}'/$changeNum"
            )
        return "wpkh(${keys.extend(path).asString()})"
    }

    private fun getBitcoinDerivationPathCoinType(network: Network): String {
        return  if(network == Network.TESTNET) "1" else "0"
    }

}