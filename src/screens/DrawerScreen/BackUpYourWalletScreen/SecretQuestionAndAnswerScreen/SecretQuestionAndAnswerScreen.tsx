import React, { Component } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    Platform,
    Dimensions,
    Image,
    Keyboard,
    StatusBar,
    Linking,
    Alert,
    ImageBackground,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    PermissionsAndroid
} from "react-native";
import { RkCard } from "react-native-ui-kitten";
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Button } from 'native-base';
import { StackActions, NavigationActions } from "react-navigation";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import Permissions from 'react-native-permissions'
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
var converter = require( 'number-to-words' );


//TODO: Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ModelSecretQuestionAndAnswer from "HexaWallet/src/app/custcompontes/Model/ModelSecretQuestionAndAnswer/ModelSecretQuestionAndAnswer";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    colors,
    images,
    localDB,
    asyncStorageKeys
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//localization       
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

//TODO: Bitcoin Files
import SecurePDFGen from "HexaWallet/src/bitcoin/utilities/securePDFGenerator";


export default class SecretQuestionAndAnswerScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_QuestionList: [
                {
                    "item": "To what city did you go the first time you flew on a plane?"
                },
                {
                    "item": "What is the first name of the person you first kissed?"
                },
                {
                    "item": "What is the first name of your best friend in high school?"
                },
                {
                    "item": "What is the first name of your oldest nephew?"
                },
                {
                    "item": "What is the first name of your oldest niece?"
                },
                {
                    "item": "What was the first name of your favourite childhood friend?"
                },
                {
                    "item": "What was the last name of your third grade teacher?"
                },
                {
                    "item": "What was the street name where your best friend in high school lived (street name only)?"
                },
                {
                    "item": "In what city or town was your first job?"
                },
                {
                    "item": "What was the last name of your favorite childhood teacher?"
                },
                {
                    "item": "What was the name of the company where you had your first job?"
                },
                {
                    "item": "What was the name of the street where you were living when you were 10 years old?"
                }
            ],
            arr_QuestionAndTrustList: [],
            arr_ModelSecretQuestionAndAnswer: []
        };
    }

    async componentDidMount() {
        let data = this.props.navigation.getParam( "data" );
        let arr_QuestionList = this.state.arr_QuestionList;
        let jsonData = {};
        jsonData.seletedContactList = data;
        jsonData.question = arr_QuestionList;
        this.setState( {
            arr_QuestionAndTrustList: jsonData,
            arr_ModelSecretQuestionAndAnswer: [
                {
                    modalVisible: true,
                    data: jsonData
                }
            ]
        } )
    }


    render() {
        //array
        let { arr_QuestionList, arr_ModelSecretQuestionAndAnswer, arr_QuestionAndTrustList } = this.state;
        return (
            <View style={ styles.container }>
                <SafeAreaView style={ styles.container }>
                    <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <ModelSecretQuestionAndAnswer data={ arr_ModelSecretQuestionAndAnswer } click_Next={ () => {
                                this.setState( {
                                    arr_ModelSecretQuestionAndAnswer: [
                                        {
                                            modalVisible: false,
                                            data: arr_QuestionAndTrustList
                                        }
                                    ]
                                } );
                                this.props.navigation.push( "SecretSharingScreen" )
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelSecretQuestionAndAnswer: [
                                            {
                                                modalVisible: false,
                                                data: arr_QuestionAndTrustList
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
            </View >
        );
    }
}

let styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#1F8BCD"
    },
    viewSetupWallet: {
        flex: 4,
        margin: 10
    },
    viewAppLogo: {
        marginTop: 20,
        flex: 1,
        alignItems: "center",
    },
    imgAppLogo: {
        height: 70,
        width: 70
    },
    txtWhiteColor: {
        color: "#ffffff"
    }
} );
