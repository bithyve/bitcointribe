# MyMoneyApp

The alpha version of BitHyve's MyMoneyApp

## What is MyMoneyApp?

MyMoneyApp is a user friendly mobile bitcoin wallet that enables p2p commerce. There are various types of accounts that are supported in the MyMoneyApp:

1.  Savings Account
  -   A savings account is a standard bitcoin wallet

2.  Secure Account
  -   A secure account is a bitcoin wallet secured by 2FA.

3.  Vault Account
  -   A vault account is a bitcoin wallet that is time locked to prevent spending before the due date.

4.  Joint Account
  -   A joint account is a 2of2 multisig bitcoin wallet.

All accounts are protected by a pin which is required to unlock the MyMoneyApp. Accounts also have a seed restoration feature which can be used to import wallets from other devices or from an older version of the MyMoneyApp wallet.

## Design Considerations

The various design considerations that BitHyve chose to undertake are over at [the wiki](https://github.com/thecryptobee/MyMoneyApp/wiki/Design-Considerations)

## Build / Local Setup

Prerequisites:

-   Node with npm
-   yarn

After installing node and yarn, the following commands should get you started with MyMoneyApp on your local computer
```
git clone https://github.com/thecryptobee/MyMoneyApp.git
cd MyMoneyApp
sudo yarn install
sudo react-native link` [known issue #3](https://github.com/thecryptobee/MyMoneyApp/issues/3
sudo npm install -g rn-nodeify
rn-nodeify --install --hack
```

## Contributing

Please feel free to open a pull requests and issues with bugfixes and suggestions.

## License

[MIT](LICENSE)
