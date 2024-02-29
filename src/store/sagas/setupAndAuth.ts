import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bip39 from 'bip39';
import crypto from 'crypto';
import DeviceInfo from 'react-native-device-info';
import { call, put, select } from 'redux-saga/effects';
import semverLte from 'semver/functions/lte';
import RGBServices from 'src/services/RGBServices';
import BHROperations from '../../bitcoin/utilities/BHROperations';
import {
  AccountType,
  ContactInfo,
  KeeperInfoInterface,
  LevelData,
  MetaShare,
  Trusted_Contacts,
  UnecryptedStreamData,
  Wallet,
} from '../../bitcoin/utilities/Interface';
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations';
import * as Cipher from '../../common/encryption';
import dbManager from '../../storage/realm/dbManager';
import * as SecureStore from '../../storage/secure-store';
import {
  initializeHealthSetup,
  resetLevelsAfterPasswordChange,
  setPasswordResetState,
  updateMetaSharesKeeper,
  updateOldMetaSharesKeeper,
  updateWalletImageHealth,
  upgradePDF,
} from '../actions/BHR';
import { newAccountShellCreationCompleted } from '../actions/accounts';
import { connectToNode } from '../actions/nodeSettings';
import { setWalletId } from '../actions/preferences';
import { setRgbConfig } from '../actions/rgb';
import {
  CHANGE_AUTH_CRED,
  CREDS_AUTH,
  RESET_PIN,
  SETUP_WALLET,
  STORE_CREDS,
  UPDATE_APPLICATION,
  completedWalletSetup,
  credsAuthenticated,
  credsChanged,
  credsStored,
  pinChangedFailed,
  switchReLogin,
  switchSetupLoader,
  updateApplication,
} from '../actions/setupAndAuth';
import { keyFetched, updateWallet } from '../actions/storage';
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../actions/trustedContacts';
import { updateCloudBackupWorker } from '../sagas/cloud';
import { createWatcher } from '../utils/utilities';
import { addNewAccountShellsWorker, newAccountsInfo } from './accounts';
import { applyUpgradeSequence } from './upgrades';

function* setupWalletWorker({ payload }) {
  const {
    walletName,
    security,
    mnemonic,
    initialMnemonic,
    gridType,
    passphrase,
  }: {
    walletName: string;
    security: { questionId: string; question: string; answer: string };
    newBie: boolean;
    mnemonic: string;
    initialMnemonic: string;
    gridType: string;
    passphrase: string;
  } = payload;
  let primaryMnemonic = null;
  if (mnemonic && mnemonic != null) primaryMnemonic = mnemonic;
  else primaryMnemonic = bip39.generateMnemonic();
  const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic, passphrase);
  const walletId = crypto.createHash('sha256').update(primarySeed).digest('hex');

  // const wallet: Wallet = {
  //   walletId,
  //   walletName,
  //   userName: walletName,
  //   security,
  //   primaryMnemonic,
  //   primarySeed: primarySeed.toString( 'hex' ),
  //   accounts: {
  //   },
  //   version: DeviceInfo.getVersion()
  // }
  const walletDB: Wallet = {
    walletId,
    walletName,
    userName: walletName,
    security,
    primaryMnemonic,
    primarySeed: primarySeed.toString('hex'),
    accounts: {},
    version: DeviceInfo.getVersion(),
    borderWalletMnemonic: initialMnemonic,
    borderWalletGridType: gridType,
  };
  const wallet: Wallet = {
    walletId,
    walletName,
    userName: walletName,
    security,
    // primaryMnemonic: '',
    // primarySeed: '',
    accounts: {},
    version: DeviceInfo.getVersion(),
  };
  yield put(updateWallet(wallet));
  yield put(setWalletId((wallet as Wallet).walletId));
  yield call(dbManager.createWallet, walletDB);
  // prepare default accounts for the wallet

  const accountsInfo: newAccountsInfo[] = [];
  const accountArray = [
    AccountType.TEST_ACCOUNT,
    AccountType.CHECKING_ACCOUNT_NATIVE_SEGWIT,
    // Note New saving account create is off
    // AccountType.SAVINGS_ACCOUNT
  ];
  // !newBie && accountArray.splice( 0, 1 )
  accountArray.forEach((accountType) => {
    const accountInfo: newAccountsInfo = {
      accountType,
    };
    accountsInfo.push(accountInfo);
  });

  yield call(addNewAccountShellsWorker, {
    payload: accountsInfo,
  });
  yield put(newAccountShellCreationCompleted());
  if (security) yield put(initializeHealthSetup()); // initialize health-check schema on relay
  yield put(completedWalletSetup());
  const config = yield call( RGBServices.restoreKeys, primaryMnemonic )
  yield put( setRgbConfig( config ) )
  const isRgbInit = yield call( RGBServices.initiate, config.mnemonic, config.xpub  )
  // if( isRgbInit ) yield put( syncRgb() )
}

export const setupWalletWatcher = createWatcher(setupWalletWorker, SETUP_WALLET);

function* credentialsStorageWorker({ payload }) {
  yield put(switchSetupLoader('storingCreds'));

  //hash the pin
  const hash = yield call(Cipher.hash, payload.passcode);

  //generate an AES key and ecnrypt it with
  const AES_KEY = yield call(Cipher.generateKey);
  const encryptedKey = yield call(Cipher.encrypt, AES_KEY, hash);
  const uint8array = yield call(Cipher.stringToArrayBuffer, AES_KEY);
  yield call(dbManager.initDb, uint8array);
  //store the AES key against the hash
  if (!(yield call(SecureStore.store, hash, encryptedKey))) {
    yield call(AsyncStorage.setItem, 'hasCreds', 'false');
    return;
  }

  yield put(keyFetched(AES_KEY));
  yield call(AsyncStorage.setItem, 'hasCreds', 'true');
  yield put(credsStored());

  // connect electrum-client
  yield put(connectToNode());
}

export const credentialStorageWatcher = createWatcher(credentialsStorageWorker, STORE_CREDS);

function* resetPasswordWorker({ payload }) {
  try {
    yield put(setPasswordResetState('init'));
    const wallet: Wallet = yield select((state) => state.storage.wallet);
    const { security } = wallet;
    const oldSecurity = {
      ...security,
    };
    console.log(oldSecurity);
    yield put(
      updateWallet({
        ...wallet,
        security: payload,
      })
    );
    yield call(dbManager.updateWallet, {
      ...wallet,
      security: payload,
    });
    // update cloud
    yield call(updateCloudBackupWorker);
    // update shares
    const keeperInfo: KeeperInfoInterface[] = yield select((state) => state.bhr.keeperInfo);
    const { metaSharesKeeper, oldMetaSharesKeeper } = yield select((state) => state.bhr);
    const metaShares: MetaShare[] = [...metaSharesKeeper];

    const {
      updatedMetaShares,
      updatedOldMetaShares,
    }: { updatedMetaShares: MetaShare[]; updatedOldMetaShares: MetaShare[] } = yield call(
      BHROperations.encryptMetaSharesWithNewAnswer,
      metaShares,
      oldMetaSharesKeeper,
      wallet.security.answer,
      payload.answer,
      payload
    );
    yield put(updateMetaSharesKeeper(updatedMetaShares));
    yield put(updateOldMetaSharesKeeper(updatedOldMetaShares));
    yield call(dbManager.updateBHR, {
      metaSharesKeeper: updatedMetaShares,
      oldMetaSharesKeeper: updatedOldMetaShares,
    });

    yield put(setPasswordResetState('completed'));
    yield put(resetLevelsAfterPasswordChange());
    yield put(setPasswordResetState(''));
  } catch (error) {
    console.log(error);
  }
}

function* credentialsAuthWorker({ payload }) {
  yield put(switchSetupLoader('authenticating'));
  let key;
  try {
    const hash = yield call(Cipher.hash, payload.passcode);
    const encryptedKey = yield call(SecureStore.fetch, hash);
    key = yield call(Cipher.decrypt, encryptedKey, hash);
    const uint8array = yield call(Cipher.stringToArrayBuffer, key);
    yield call(dbManager.initDb, uint8array);
  } catch (err) {
    console.log('err', err);
    if (payload.reLogin) yield put(switchReLogin(false));
    else yield put(credsAuthenticated(false));
    return;
  }
  if (!key) throw new Error('Key missing');

  if (payload.reLogin) {
    yield put(switchReLogin(true));
  } else {
    yield put(credsAuthenticated(true));
    yield put(connectToNode());

    // t.stop()
    yield put(keyFetched(key));
    // yield put( autoSyncShells() )
    // const rgbConfig: RGBConfig = yield select( state => state.rgb.config )
    // if( !rgbConfig || rgbConfig.mnemonic ==='' ) {
    //   const wallet : Wallet = dbManager.getWallet()
    //   const config = yield call( RGBServices.restoreKeys, wallet.primaryMnemonic )
    //   yield put( setRgbConfig( config ) )
    //   const isRgbInit = yield call( RGBServices.initiate, rgbConfig.mnemonic, rgbConfig.xpub  )
    //   if( isRgbInit ) yield put( syncRgb() )
    // } else {
    //   const isRgbInit = yield call( RGBServices.initiate, rgbConfig.mnemonic, rgbConfig.xpub  )
    //   if( isRgbInit ) yield put( syncRgb() )
    //   // const accountShells: AccountShell[] = yield select( ( state ) => state.accounts.accountShells )
    //   // const shell = accountShells.find( account => account.primarySubAccount.type === AccountType.CHECKING_ACCOUNT_NATIVE_SEGWIT )
    //   // const accounts: Accounts = yield select( ( state ) => state.accounts.accounts )
    //   // const defaultAccount = accounts[ shell.id ]

    // }
    // yield put( autoSyncShells() ) // have to synchronize w/ connectToNode saga in order for this to work

    // check if the app has been upgraded
    const wallet: Wallet = yield select((state) => state.storage.wallet);
    const storedVersion = wallet.version;
    const currentVersion = DeviceInfo.getVersion();
    if (currentVersion !== storedVersion)
      yield put(updateApplication(currentVersion, storedVersion));
  }
}

export const credentialsAuthWatcher = createWatcher(credentialsAuthWorker, CREDS_AUTH);

function* changeAuthCredWorker({ payload }) {
  const { oldPasscode, newPasscode } = payload;

  try {
    // verify old pin
    const oldHash = yield call(Cipher.hash, oldPasscode);
    const oldEncryptedKey = yield call(SecureStore.fetch, oldHash);
    const oldKey = yield call(Cipher.decrypt, oldEncryptedKey, oldHash);
    const key = yield select((state) => state.storage.key);
    if (oldKey !== key) {
      throw new Error('Incorrect Pin');
    }

    // setup new pin
    const newHash = yield call(Cipher.hash, newPasscode);
    const encryptedKey = yield call(Cipher.encrypt, key, newHash);

    //store the AES key against the hash
    if (!(yield call(SecureStore.store, newHash, encryptedKey))) {
      throw new Error('Unable to access secure store');
    }
    yield put(credsChanged('changed'));
  } catch (err) {
    console.log({
      err,
    });
    yield put(pinChangedFailed(true));
    // Alert.alert('Pin change failed!', err.message);
    yield put(credsChanged('not-changed'));
  }
}

function* resetPinWorker({ payload }) {
  const { newPasscode } = payload;
  try {
    const key = yield select((state) => state.storage.key);
    // setup new pin
    const newHash = yield call(Cipher.hash, newPasscode);
    const encryptedKey = yield call(Cipher.encrypt, key, newHash);

    //store the AES key against the hash
    if (!(yield call(SecureStore.store, newHash, encryptedKey))) {
      throw new Error('Unable to access secure store');
    }
    yield put(credsChanged('changed'));
  } catch (err) {
    console.log({
      err,
    });
    yield put(pinChangedFailed(true));
    // Alert.alert('Pin change failed!', err.message);
    yield put(credsChanged('not-changed'));
  }
}

export const resetPinCredWatcher = createWatcher(resetPinWorker, RESET_PIN);

export const changeAuthCredWatcher = createWatcher(changeAuthCredWorker, CHANGE_AUTH_CRED);

function* applicationUpdateWorker({
  payload,
}: {
  payload: { newVersion: string; previousVersion: string };
}) {
  const { newVersion, previousVersion } = payload;

  const wallet: Wallet = yield select((state) => state.storage.wallet);
  const levelData: LevelData[] = yield select((state) => state.bhr.levelData);
  const storedVersion = wallet.version;
  // update wallet version
  yield put(
    updateWallet({
      ...wallet,
      version: newVersion,
    })
  );

  yield call(applyUpgradeSequence, {
    storedVersion,
    newVersion,
  });

  // update permanent channels w/ new version
  const trustedContacts: Trusted_Contacts = yield select((state) => state.trustedContacts.contacts);
  const streamUpdates: UnecryptedStreamData = {
    streamId: TrustedContactsOperations.getStreamId(wallet.walletId),
    metaData: {
      version: newVersion,
    },
  };
  const channelUpdates = [];
  for (const channelKey of Object.keys(trustedContacts)) {
    if (!trustedContacts[channelKey].isActive) continue;
    const contactInfo: ContactInfo = {
      channelKey,
    };
    const channelUpdate = {
      contactInfo,
      streamUpdates,
    };
    channelUpdates.push(channelUpdate);
  }

  yield put(
    syncPermanentChannels({
      permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
      channelUpdates,
      metaSync: true,
    })
  );
  yield put(
    updateWalletImageHealth({
      updateVersion: true,
    })
  );
  if (semverLte(previousVersion, '2.0.6')) {
    if (
      levelData.find(
        (value) => value.keeper1.shareType == 'pdf' || value.keeper2.shareType == 'pdf'
      )
    ) {
      yield put(upgradePDF());
    }
  }
  if (semverLte(previousVersion, '2.4.0')) {
    const wallet : Wallet = dbManager.getWallet()
    const config = yield call(RGBServices.restoreKeys, wallet.primaryMnemonic);
    yield put(setRgbConfig(config));
    const isRgbInit = yield call(RGBServices.initiate, config.mnemonic, config.xpub);
  }
}

export const applicationUpdateWatcher = createWatcher(applicationUpdateWorker, UPDATE_APPLICATION);
