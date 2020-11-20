import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import { xAccount } from '../Interface';
import * as bitcoinJS from 'bitcoinjs-lib';
import config from '../../HexaConfig';

const deriveAddress = (
  keyPair: bip32.BIP32Interface,
  standard: number,
  network: bitcoinJS.Network,
): string => {
  if (standard === config.STANDARD.BIP44) {
    return bitcoinJS.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: network,
    }).address;
  } else if (standard === config.STANDARD.BIP49) {
    return bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }),
      network,
    }).address;
  } else if (standard === config.STANDARD.BIP84) {
    return bitcoinJS.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    }).address;
  }
};

const getAddress = (
  internal: boolean,
  index: number,
  xpub: string,
  network?: bitcoinJS.Network,
): string => {
  const nw = network ? network : bitcoinJS.networks.bitcoin;
  const node = bip32.fromBase58(xpub, nw);
  return deriveAddress(
    node.derive(internal ? 1 : 0).derive(index),
    config.DPATH_PURPOSE,
    nw,
  );
};

export const generateExtendedKeys = (
  mnemonic,
  network,
  derivationPath,
  passphrase?,
): { xpriv: string; xpub: string } => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const root = bip32.fromSeed(seed, network);

  const xpriv_child = root.derivePath(derivationPath);
  const xpriv = xpriv_child.toBase58();

  const xpub_child = root.derivePath(derivationPath).neutered();
  const xpub = xpub_child.toBase58();

  return { xpriv, xpub };
};

export const syncBalanceUtxoTx = (accounts: xAccount[]) => {
  const accountsToAddressMapping = {};
  for (const account of accounts) {
    // await this.derivativeAccGapLimitCatchup(dAccountType, accountNumber);
    let {
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      accountId,
      gapLimit,
      primary_xpub,
    } = account;

    const externalAddresses = [];
    const internalAddresses = [];
    for (let itr = 0; itr < nextFreeAddressIndex + gapLimit; itr++) {
      externalAddresses.push(getAddress(false, itr, primary_xpub));
    }

    for (let itr = 0; itr < nextFreeChangeAddressIndex + gapLimit; itr++) {
      internalAddresses.push(getAddress(true, itr, primary_xpub));
    }

    const usedAddresses = [...externalAddresses, ...internalAddresses];

    accountsToAddressMapping[accountId] = {
      External: externalAddresses,
      Internal: internalAddresses,
    };
  }

  if (!Object.keys(accountsToAddressMapping).length) return;
};
