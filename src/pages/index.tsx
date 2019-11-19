import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import Launch from './Launch';
import PasscodeConfirm from './PasscodeConfirm';
import RestoreAndReoverWallet from './RestoreAndReoverWallet';
import RestoreSelectedContactsList from './RestoreSelectedContactsList';
import Home from './Home';
import NewWalletName from './NewWalletName';
import NewWalletQuestion from './NewWalletQuestion';
import RestoreWalletBySecondaryDevice from "./RestoreWalletBySecondaryDevice";
import RestoreWalletUsingDocuments from "./RestoreWalletUsingDocuments"

export default createAppContainer(
    createStackNavigator(
        {
            Launch,
            PasscodeConfirm,
            RestoreAndReoverWallet,
            RestoreSelectedContactsList,
            Home,
            NewWalletName,
            NewWalletQuestion,
            RestoreWalletBySecondaryDevice,
            RestoreWalletUsingDocuments
        },
        {
            initialRouteName: "Launch",
            headerLayoutPreset: 'center',
            defaultNavigationOptions: ({ navigation }) => ({
                header: null,
            })
        }
    )
);