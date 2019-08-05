import React from "react";
import { StyleSheet, ImageBackground, View, Platform, Dimensions, NativeModules } from "react-native";
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
    Picker,
    Icon
} from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import bip39 from 'react-native-bip39';
//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";







//TODO: Custome Alert
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object  
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );


//TODO: Bitcoin Files  
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";
export default class FirstSecretQuestionScreen extends React.Component<any, any> {
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
            firstQuestion: "To what city did you go the first time you flew on a plane?",
            firstAnswer: "",
            secoundAnswer: "",
            flag_ConfirmDisableBtn: true
        };
    }

    //TODO: Select Picker Question List change aciton
    onValueChange( value: string ) {
        this.setState( {
            firstQuestion: value
        } );
    }

    //TODO: func check_CorrectAnswer
    check_CorrectAnswer() {
        setTimeout( () => {
            let firstAns = this.state.firstAnswer;
            let secoundAns = this.state.secoundAnswer;
            if ( firstAns == secoundAns && firstAns.length >= 3 ) {
                this.setState( {
                    flag_ConfirmDisableBtn: false
                } )
            } else {
                this.setState( {
                    flag_ConfirmDisableBtn: true
                } )
            }
        }, 100 );
    }




    //TODO: func click_FirstQuestion
    async click_FirstQuestion() {
        this.setState( {
            flag_Loading: true
        } );
        let question = this.state.firstQuestion;
        let answer = this.state.secoundAnswer;
        let resWalletData = await utils.getSetupWallet();
        const dateTime = Date.now();
        const mnemonic = await bip39.generateMnemonic( 256 );
        let walletName = resWalletData.walletName;
        const regularAccount = new RegularAccount(
            mnemonic
        );

        const secureAccount = new SecureAccount( mnemonic );
        const sss = new S3Service( mnemonic );

        //setup Check Health   
        let updateShareIdStatus = await comAppHealth.checkHealthSetupShare( dateTime );
        if ( updateShareIdStatus != "" ) {
            console.log( { updateShareIdStatus } );
            let arrQustionList = [];
            let questionData = {};
            questionData.Question = question;
            questionData.Answer = answer;
            arrQustionList.push( questionData );
            let arrBackupInfo = [ { backupType: "new" }, { backupMethod: "share" } ];
            let resInsertWallet = await dbOpration.insertWallet(
                localDB.tableName.tblWallet,
                dateTime,
                mnemonic,
                "",
                "",
                "",
                walletName,
                arrBackupInfo,
                arrQustionList,
                updateShareIdStatus
            );
            await comFunDBRead.readTblWallet();
            let resInsertCreateAcc = await dbOpration.insertCreateAccount(
                localDB.tableName.tblAccount,
                dateTime,
                "",
                "0.0",
                "BTC",
                "Regular Account",
                "Regular Account",
                ""
            );
            let resInsertSecureCreateAcc = await dbOpration.insertCreateAccount(
                localDB.tableName.tblAccount,
                dateTime,
                "",
                "0.0",
                "BTC",
                "Secure Account",
                "Secure Account",
                ""
            );
            let resDeleteTableData = await dbOpration.deleteTableData(
                localDB.tableName.tblSSSDetails
            );
            if ( resInsertWallet && resInsertSecureCreateAcc && resInsertCreateAcc && resDeleteTableData ) {
                await bitcoinClassState.setRegularClassState( regularAccount );
                //secure account     
                await bitcoinClassState.setSecureClassState( secureAccount );
                await bitcoinClassState.setS3ServiceClassState( sss )
                //s3serverice
                await comFunDBRead.readTblSSSDetails();
                await comFunDBRead.readTblWallet();
                this.setState( {
                    flag_Loading: false
                } );
                this.props.click_Next();
            }
        }
        else {
            alert.simpleOk( "Oops", "Check Health Issue." );
        }
    }











    render() {
        //flag
        let { flag_Loading } = this.state;

        const itemList = this.state.arr_QuestionList.map( ( item: any, index: number ) => (
            <Picker.Item label={ item.item } value={ item.item } />
        ) );
        return (
            <View style={ styles.container }>

                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={ 40 }
                    contentContainerStyle={ { flexGrow: 1, } }
                >
                    <View style={ styles.viewPagination }>
                        <Text style={ [ globalStyle.ffFiraSansMedium, { fontWeight: "bold", fontSize: 22, textAlign: "center" } ] }>Step 2: Select secret question</Text>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { marginTop: 20, textAlign: "center" } ] }>Select the question and specify the answer at least three characters long such that you always remember it and no one can easily guess it</Text>
                    </View>
                    <View style={ styles.viewInputFiled }>

                        <View style={ styles.itemQuestionPicker }>
                            <Picker
                                renderHeader={ backAction =>
                                    <Header style={ { backgroundColor: "#ffffff" } }>
                                        <Left>
                                            <Button transparent onPress={ backAction }>
                                                <Icon name="arrow-back" style={ { color: "#000" } } />
                                            </Button>
                                        </Left>
                                        <Body style={ { flex: 3 } }>
                                            <Title style={ [ globalStyle.ffFiraSansMedium, { color: "#000" } ] }>Select Question</Title>
                                        </Body>
                                        <Right />
                                    </Header> }
                                mode="dropdown"
                                style={ [ globalStyle.ffFiraSansMedium ] }
                                iosIcon={ <Icon name="arrow-down" style={ { fontSize: 25, marginLeft: -10 } } /> }
                                selectedValue={ this.state.firstQuestion }
                                onValueChange={ this.onValueChange.bind( this ) }
                            >
                                { itemList }
                            </Picker>
                        </View>


                        <Item rounded style={ styles.itemInputWalletName }>
                            <Input
                                secureTextEntry
                                keyboardType="default"
                                autoCapitalize='sentences'
                                placeholder='Write your answer here'
                                style={ [ globalStyle.ffFiraSansMedium ] }
                                placeholderTextColor="#B7B7B7"
                                onChangeText={ ( val ) => {
                                    this.setState( {
                                        firstAnswer: val
                                    } )
                                } }
                                onKeyPress={ () =>
                                    this.check_CorrectAnswer()
                                }

                            />
                        </Item>
                        <Item rounded style={ styles.itemInputWalletName }>
                            <Input
                                keyboardType="default"
                                autoCapitalize='none'
                                placeholder='Confirm answer'
                                style={ [ globalStyle.ffFiraSansMedium ] }
                                placeholderTextColor="#B7B7B7"
                                onChangeText={ ( val ) => {
                                    this.setState( {
                                        secoundAnswer: val
                                    } )
                                } }
                                onKeyPress={ () =>
                                    this.check_CorrectAnswer()
                                }
                            />
                        </Item>
                    </View>
                    <View style={ styles.viewProcedBtn }>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } ] } numberOfLines={ 2 }>The answer is never stored anywhere and even your contacts don't know this answer </Text>

                        <FullLinearGradientButton title="Go To Wallet" disabled={ this.state.flag_ConfirmDisableBtn } style={ [ this.state.flag_ConfirmDisableBtn == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] } click_Done={ () => this.click_FirstQuestion() } />
                    </View>

                </KeyboardAwareScrollView>
                <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
            </View>
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "transparent",
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
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
    itemQuestionPicker: {
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    }
} );
