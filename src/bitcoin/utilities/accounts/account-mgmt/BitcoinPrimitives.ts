import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import { xAccount } from '../../Interface';
import * as bitcoinJS from 'bitcoinjs-lib';
import config from '../../../HexaConfig';

export const getKeyPair = (
  privateKey: string,
  network,
): bitcoinJS.ECPairInterface => bitcoinJS.ECPair.fromWIF(privateKey, network);

export const deriveAddress = (
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

export const getP2SH = (
  keyPair: bitcoinJS.ECPairInterface,
  network: bitcoinJS.Network,
): bitcoinJS.Payment =>
  bitcoinJS.payments.p2sh({
    redeem: bitcoinJS.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: network,
    }),
    network: network,
  });

export const getAddress = (
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

const getPrivateKey = (
  change: boolean,
  index: number,
  xpriv: string,
  network: bitcoinJS.Network,
) => {
  const node = bip32.fromBase58(xpriv, network);
  return node
    .derive(change ? 1 : 0)
    .derive(index)
    .toWIF();
};

export const addressToPrivateKey = (
  address: string,
  account: xAccount,
  network: bitcoinJS.Network,
): string => {
  const {
    nextFreeAddressIndex,
    nextFreeChangeAddressIndex,
    primary_xpub,
    primary_xpriv,
    gapLimit,
  } = account;

  for (let itr = 0; itr <= nextFreeChangeAddressIndex + gapLimit; itr++) {
    if (getAddress(true, itr, primary_xpub, network) === address) {
      return getPrivateKey(true, itr, primary_xpriv, network);
    }
  }

  for (let itr = 0; itr <= nextFreeAddressIndex + gapLimit; itr++) {
    if (getAddress(false, itr, primary_xpub, network) === address) {
      return getPrivateKey(false, itr, primary_xpriv, network);
    }
  }

  throw new Error('Could not find private key for: ' + address);
};

export const sortOutputs = async (
  outputs: Array<{
    address: string;
    value: number;
  }>,
  account: xAccount,
): Promise<
  Array<{
    address: string;
    value: number;
  }>
> => {
  for (const output of outputs) {
    if (!output.address) {
      const { nextFreeChangeAddressIndex, primary_xpub } = account;

      output.address = getAddress(
        true,
        nextFreeChangeAddressIndex,
        primary_xpub,
      );
    }
  }

  outputs.sort((out1, out2) => {
    if (out1.address < out2.address) {
      return -1;
    }
    if (out1.address > out2.address) {
      return 1;
    }
    return 0;
  });

  return outputs;
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
