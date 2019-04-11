import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
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
import { Icon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Pagination, { PagiIcon, Dot } from 'react-native-pagination';

//TODO: Custome Pages
import CustomeStatusBar from "bithyve/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "bithyve/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
//TODO: Custome Object
import { colors, images, localDB } from "bithyve/src/app/constants/Constants";




export default class WalletNameScreen extends React.Component<any, any> {
    render() {
        return (
            <View style={ styles.container }>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <View style={ styles.viewPagination }>
                        <Text style={ { fontWeight: "bold", fontFamily: "FiraSans-Medium", fontSize: 22, textAlign: "center" } }>Step 1: What do you want to call your Wallet?</Text>
                        <Text note style={ { marginTop: 20, textAlign: "center" } }>This name will display on you wallet.</Text>
                    </View>
                    <View style={ styles.viewInputFiled }>
                        <Item rounded style={ styles.itemInputWalletName }>
                            <Input placeholder='Enter a name for your wallet' placeholderTextColor="#B7B7B7" />
                        </Item>
                    </View>
                    <View style={ styles.viewProcedBtn }>
                        <Text note style={ { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } } numberOfLines={ 1 }>Lorem ipsum dolor sit amet, consectetur adipiscing </Text>
                        <FullLinearGradientButton title="Proceed" disabled={ true } style={ { borderRadius: 10 } } />
                    </View>
                </ImageBackground>
            </View>

        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
