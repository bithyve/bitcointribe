import React from "react";
import { StyleSheet, ImageBackground, View, Dimensions, Platform, SafeAreaView } from "react-native";
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


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";


//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

export default class SecondSecretQuestion extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props );
        this.state = {
            selected: "",
            data: [],
            arr_QuestionList: [],
            firstAnswer: "",
            secoundAnswer: "",
            flag_ConfirmDisableBtn: true,
            flag_Loading: false
        };
        window.EventBus.on( "swipeScreen", this.loadQuestionList );
        this.loadQuestionList = this.loadQuestionList.bind( this );
    }

    loadQuestionList = async () => {
        let resWalletData = await utils.getSetupWallet();
        if ( resWalletData.arr_QuestionList != undefined ) {
            console.log( resWalletData.arr_QuestionList );
            this.setState( {
                data: resWalletData,
                arr_QuestionList: resWalletData.arr_QuestionList,
                selected: resWalletData.arr_QuestionList[ 0 ].item
            } )
        }

    }

    onValueChange( value: string ) {
        this.setState( {
            selected: value
        } );
    }

    //TODO: func check_CorrectAnswer
    check_CorrectAnswer() {
        setTimeout( () => {
            let firstAns = this.state.firstAnswer;
            let secoundAns = this.state.secoundAnswer;
            if ( firstAns == secoundAns && firstAns.length >= 6 ) {
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
    //TODO: func click_Confirm
    click_Confirm = async () => {
        const dateTime = Date.now();
        const fulldate = Math.floor( dateTime / 1000 );
        let data = this.state.data;
        let walletDetails = utils.getWalletDetails();
        let walletName = data.walletName;
        let firstQuestion = data.question;
        let firstAnswer = data.answer;
        let secoundQuestion = this.state.selected;
        let secoundAnser = this.state.secoundAnswer;
        const sss = new S3Service(
            walletDetails[ 0 ].mnemonic
        );
        const answers = [ firstAnswer, secoundAnser ];
        const encryptedShares = sss.generateShares( answers );
        //console.log( { encryptedShares } );
        const shareIds = []
        const transShare = [];
        for ( const share of encryptedShares ) {
            shareIds.push( sss.getShareId( share ) )
            transShare.push( sss.createTransferShare( share, walletName ) )
        }
        if ( shareIds != null ) {
            const resultSSSShareIdInserted = await dbOpration.insertSSSShareAndShareId(
                localDB.tableName.tblSSSDetails,
                fulldate,
                encryptedShares,
                shareIds
            );
            // console.log( { resultSSSShareIdInserted } );
            await dbOpration.insertCreateAccount(
                localDB.tableName.tblAccount,
                fulldate,
                "",
                "BTC",
                walletName,
                "Wallet",
                ""
            );
            let jsonAnswerDetails = {};
            jsonAnswerDetails.walletName = walletName;
            jsonAnswerDetails.firstQuestion = firstQuestion;
            jsonAnswerDetails.firstAnswer = firstAnswer;
            jsonAnswerDetails.secoundQuestion = secoundQuestion;
            jsonAnswerDetails.secoundAnser = secoundAnser;
            console.log( { jsonAnswerDetails } );
            await dbOpration.updateWalletAnswerDetials(
                localDB.tableName.tblWallet,
                jsonAnswerDetails,
            );
            this.setState( {
                flag_Loading: false
            } )
            this.props.prevScreen();
        }
    }


    //console.log( { shareIds});
    // const { share, otp } = sss.createTransferShare( encryptedShares[ 0 ], walletName )
    // console.log( { otpEncryptedShare: share, otp } )
    // const { messageId, success } = await sss.uploadShare( share );
    // console.log( { otpEncryptedShare: share, messageId, success } )
    // // Trusted party
    // const otpEncryptedShare = await sss.downloadShare( messageId )
    // console.log( { downloadedOTPEncShare: otpEncryptedShare } )
    // const decryptedStorageShare = await sss.decryptOTPEncShare( otpEncryptedShare, messageId, otp );
    // console.log( { decryptedStorageShare } )


    render() {
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
                        <Text style={ [ globalStyle.ffFiraSansMedium, { fontWeight: "bold", fontSize: 22, textAlign: "center" } ] }>Step 3: Select second secret question</Text>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { marginTop: 20, textAlign: "center" } ] }>To Set up you need to select two secret questions</Text>
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
                                            <Title style={ { color: "#000" } }>Select Question</Title>
                                        </Body>
                                        <Right />
                                    </Header> }
                                mode="dropdown"
                                iosIcon={ <Icon name="arrow-down" style={ { fontSize: 25, marginLeft: -10 } } /> }
                                selectedValue={ this.state.selected }
                                style={ [ globalStyle.ffFiraSansMedium ] }
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
                                placeholderTextColor="#B7B7B7"
                                style={ [ globalStyle.ffFiraSansMedium ] }
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
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } ] } numberOfLines={ 1 }>Make sure you don’t select questions, answers to </Text>
                        <FullLinearGradientButton title="Confirm & Proceed" disabled={ this.state.flag_ConfirmDisableBtn } style={ [ this.state.flag_ConfirmDisableBtn == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] } click_Done={ () => {
                            this.setState( {
                                flag_Loading: true,
                                flag_ConfirmDisableBtn: true
                            } )
                            if ( Platform.OS != "ios" ) {
                                setTimeout( () => {
                                    this.click_Confirm()
                                }, 100 );
                            } else {
                                this.click_Confirm()
                            }
                        } } />
                    </View>
                </KeyboardAwareScrollView>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
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
