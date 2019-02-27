# BitHyve Wallet

The alpha version of BitHyve's BitHyve Wallet

## What is BitHyve Wallet?

BitHyve Wallet is a user friendly mobile bitcoin wallet that enables p2p commerce. There are various types of accounts that are supported in the BitHyve Wallet:

1.  Savings Account
  -   A savings account is a standard bitcoin wallet

2.  Secure Account
  -   A secure account is a bitcoin wallet secured by 2FA.

3.  Vault Account
  -   A vault account is a bitcoin wallet that is time locked to prevent spending before the due date.

4.  Joint Account
  -   A joint account is a 2of2 multisig bitcoin wallet.

All accounts are protected by a pin which is required to unlock the BitHyve Wallet. Accounts also have a seed restoration feature which can be used to import wallets from other devices or from an older version of the BitHyve Wallet wallet.

## Design Considerations

The various design considerations that BitHyve chose to undertake are over at [the wiki](https://github.com/thecryptobee/BitHyve-Wallet/wiki/Design-Considerations)

## Build / Local Setup

Prerequisites:

-   Node with npm
-   yarn

After installing node and yarn, the following commands should get you started with BitHyve Wallet on your local computer
```
git clone https://github.com/thecryptobee/BitHyve-Wallet.git
cd BitHyve-Wallet
sudo yarn install
sudo react-native link` [known issue #2](https://github.com/thecryptobee/BitHyve-Wallet/issues/2
sudo npm install -g rn-nodeify
rn-nodeify --install --hack
npm run android-dev 
```

## Contributing

Please feel free to open a pull requests and issues with bugfixes and suggestions.

## License

[MIT](LICENSE)
