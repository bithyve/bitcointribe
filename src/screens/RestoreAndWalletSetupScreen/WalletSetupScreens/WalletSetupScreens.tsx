import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, AsyncStorage, PermissionsAndroid } from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Item,
    Input,
    Button,
    Left,
    Right,
    Body,
    Text

} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { StackActions, NavigationActions } from "react-navigation";


//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

import WalletNameScreen from "./WalletNameScreen/WalletNameScreen";
import FirstSecretQuestionScreen from "./FirstSecretQuestionScreen/FirstSecretQuestionScreen";
import SecondSecretQuestion from "./SecondSecretQuestion/SecondSecretQuestion";

//TODO: Custome Object  
import { colors, images, asyncStorageKeys } from "HexaWallet/src/app/constants/Constants";

export default class WalletSetupScreens extends React.Component<any, any> {


    componentDidMount() {
        if ( Platform.OS == "android" ) {
            this.getExternalStorgePermission();
        }
    }

    getExternalStorgePermission = async () => {
        try {
            const grantedWrite = await PermissionsAndroid.requestMultiple( [
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
            ] );
            console.log( { grantedWrite } );
        } catch ( err ) {
            console.warn( err );
        }
    }


    //TODO:click_GotoPermisionScrenn
    goToWallet() {
        const resetAction = StackActions.reset( {
            index: 0, // <-- currect active route from actions array
            key: null,
            actions: [
                NavigationActions.navigate( { routeName: "TabbarBottom" } )
            ]
        } );
        AsyncStorage.setItem(
            asyncStorageKeys.rootViewController,
            "TabbarBottom"
        );
        this.props.navigation.dispatch( resetAction );
    }
    render() {
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { marginLeft: 10 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Set up your wallet</Text>
                            </Button>
                        </View>
                        <WalletSetUpScrolling>
                            {/* First screen */ }
                            <WalletNameScreen />
                            {/* Second screen */ }
                            <FirstSecretQuestionScreen click_Next={ () => this.goToWallet() } />
                        </WalletSetUpScrolling>
                    </ImageBackground>
                </SafeAreaView>
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewInputFiled: {
        flex: 3,
        alignItems: "center",
        margin: 10
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    }
} );
