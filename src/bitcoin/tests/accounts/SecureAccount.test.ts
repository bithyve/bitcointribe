import bip39 from 'bip39';
import crypto from 'crypto';
import authenticator from 'otplib/authenticator';
import config from '../../Config';
import SecureAccount from '../../services/accounts/SecureAccount';

describe('Secure Account', () => {
    let secureAccount: SecureAccount;

    beforeAll(async () => {
        jest.setTimeout(200000);
        const mnemonic = bip39.generateMnemonic(256);
        secureAccount = new SecureAccount(mnemonic);
        authenticator.options = { crypto };
    });

    test('generates the required assets and sets up the secure account', async () => {
        const res = await secureAccount.setupSecureAccount();
        expect(res.status).toBe(config.STATUS.SUCCESS);

        const { setupData } = res.data;
        expect(setupData.bhXpub).toBeTruthy();
        expect(setupData.secret).toBeTruthy();
    });

    test('checks the health of the secureAccount', async () => {
        const dummyMnemonic =
            'horn middle issue story near liar captain version where speed bubble goose obvious member ski first rebuild palace spy royal segment river defy travel';
        const dummyTwoFASecret = 'OZRDQOBUGBYEYMTIJQ3WINLBGM2XA5CG';
        let dummyChunk;
        const dummyPOS = 1;

        if (dummyPOS === 1) {
            dummyChunk = dummyTwoFASecret.slice(0, config.SCHUNK_SIZE);
        } else if (dummyPOS === -1) {
            dummyChunk = dummyTwoFASecret.slice(
                dummyTwoFASecret.length - config.SCHUNK_SIZE
            );
        }

        const secureHDAccount = new SecureAccount(dummyMnemonic);
        const res = await secureHDAccount.checkHealth(dummyChunk, dummyPOS);
        console.log({ res });
        expect(res.status).toBe(config.STATUS.SUCCESS);
        expect(res.data.isValid).toBe(true);
    });

    test('imports secure account', async () => {
        const dummyMnemonic =
            'horn middle issue story near liar captain version where speed bubble goose obvious member ski first rebuild palace spy royal segment river defy travel';
        const dummySecondaryXpub =
            'tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ';
        const dummyTwoFASecret = 'OZRDQOBUGBYEYMTIJQ3WINLBGM2XA5CG';

        const secureHDAccount = new SecureAccount(dummyMnemonic);
        const dummyToken = authenticator.generate(dummyTwoFASecret);

        const { status, data } = await secureHDAccount.importSecureAccount(
            dummySecondaryXpub,
            null,
            dummyToken
        );
        expect(status).toBe(config.STATUS.SUCCESS);
        expect(data.imported).toBe(true);

        const res = await secureHDAccount.getAddress();
        expect(res.status).toBe(config.STATUS.SUCCESS);
        expect(res.data.address).toBeTruthy();
    });

    test('serialize and deserialize (stringification) secure account obj (state preservation test)', () => {
        const primaryMnemonic: string =
            'horn middle issue story near liar captain version where speed bubble goose obvious member ski first rebuild palace spy royal segment river defy travel';
        const unserializedSecureAccount = new SecureAccount(primaryMnemonic);
        const initRes = unserializedSecureAccount.getRecoveryMnemonic();
        console.log({ mnemonic: initRes.data.secondaryMnemonic });
        const serializedObj = JSON.stringify(unserializedSecureAccount);
        const deserializedRegAc = SecureAccount.fromJSON(serializedObj);
        console.log({ deserializedRegAc });
        const finalRes = deserializedRegAc.getRecoveryMnemonic();
        console.log({ deserializedMnemonic: finalRes.data.secondaryMnemonic });
        expect(initRes.data.secondaryMnemonic).toEqual(
            finalRes.data.secondaryMnemonic
        );
    });

    test('checks whether the secure account has been activated (setup validation: completed)', async () => {
        const dummyMnemonic =
            'horn middle issue story near liar captain version where speed bubble goose obvious member ski first rebuild palace spy royal segment river defy travel';
        const secureHDAccount = new SecureAccount(dummyMnemonic);
        const { status, data } = await secureHDAccount.isActive();
        expect(status).toBe(config.STATUS.SUCCESS);
        expect(data.isActive).toBe(true);
    });

    test('funds the wallet w/ random number of testcoins', async () => {
        const res = await secureAccount.getTestcoins();
        expect(res.status).toBe(config.STATUS.SUCCESS);
        expect(res.data.funded).toBe(true);
        expect(res.data.txid).toBeTruthy();
    });

    test('transacts from a (pre-funded) secure account (multi-stage)', async () => {
        const dummyMnemonic =
            'six sort kangaroo special couch fabric dream tuition process sail dutch quarter impact gauge era maple during section width young certain engage collect ahead';
        const dummySecret = 'GZFXQUJSKI4GMNSLMN3VIK3SKBSU64KV';
        const dummySecondaryXpub =
            'tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ';
        // const dummyBHXpub =
        //   "tpubDHmUoBnFtKNcX4tD21HJXCKS1HPZTAZpYVuCvQtuPHzghwpWUwGQuLDURiWt77BsQnnhhRqXwDwJL3SiRQxudegC73FSLHRHXoCu2tAKoHG";
        const dummyToken = authenticator.generate(dummySecret);

        const transfer = {
            recipientAddress: '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8',
            amount: 3500,
            priority: 'High'
        };

        const secureHDAccount = new SecureAccount(dummyMnemonic);
        await secureHDAccount.importSecureAccount(
            dummySecondaryXpub,
            null,
            dummyToken
        );
        console.log(JSON.stringify(secureAccount));
        const transferST1 = await secureHDAccount.transferST1(
            transfer.recipientAddress,
            transfer.amount,
            transfer.priority
        );
        expect(transferST1.status).toBe(config.STATUS.SUCCESS);
        const { inputs, txb, fee } = transferST1.data;

        const transferST2 = await secureHDAccount.transferST2(inputs, txb);
        expect(transferST2.status).toBe(config.STATUS.SUCCESS);

        const { txHex, childIndexArray } = transferST2.data;

        const token = authenticator.generate(dummySecret);
        console.log('Executing Transfer');
        const transferST3 = await secureHDAccount.transferST3(
            token,
            txHex,
            childIndexArray
        );
        expect(transferST3.status).toBe(config.STATUS.SUCCESS);
        console.log({ txid: transferST3.data.txid });
        expect(transferST3.data.txid).toBeTruthy();
    });
});
