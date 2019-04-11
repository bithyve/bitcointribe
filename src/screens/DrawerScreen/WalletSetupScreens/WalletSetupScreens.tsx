import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform } from "react-native";
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
    Text,
    Tab, Tabs, TabHeading
} from "native-base";
import { Icon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Pagination, { PagiIcon, Dot } from 'react-native-pagination';

//TODO: Custome Pages
import CustomeStatusBar from "bithyve/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "bithyve/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";



import WalletNameScreen from "./WalletNameScreen/WalletNameScreen";
import FirstSecretQuestionScreen from "./FirstSecretQuestionScreen/FirstSecretQuestionScreen";
import SecondSecretQuestion from "./SecondSecretQuestion/SecondSecretQuestion";

//TODO: Custome Object
import { colors, images, localDB } from "bithyve/src/app/constants/Constants";



export default class WalletSetupScreens extends React.Component<any, any> {
    render() {
        return (
            <Container>
                <Content
                    contentContainerStyle={ styles.container }
                >
                    <CustomeStatusBar backgroundColor={ colors.white } barStyle="dark-content" />
                    <View style={ { marginLeft: 10 } }>
                        <Button
                            transparent
                            onPress={ () => this.props.navigation.pop() }
                        >
                            <Icon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                            <Text style={ { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0, fontFamily: "FiraSans-Medium" } }>Set up your wallet</Text>
                        </Button>
                    </View>
                    <KeyboardAwareScrollView
                        enableOnAndroid
                        extraScrollHeight={ 40 }
                        contentContainerStyle={ { flexGrow: 1, } }
                    >
                        <Tabs>
                            <Tab heading={ <TabHeading  ><Text>Wallet Name</Text></TabHeading> } >
                                <WalletNameScreen />
                            </Tab>
                            <Tab heading={ <TabHeading><Text>1 Question</Text></TabHeading> }>
                                <FirstSecretQuestionScreen />
                            </Tab>
                            <Tab heading={ <TabHeading><Text>2 Question</Text></TabHeading> }>
                                <SecondSecretQuestion />
                            </Tab>
                        </Tabs>
                    </KeyboardAwareScrollView>
                </Content>
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
