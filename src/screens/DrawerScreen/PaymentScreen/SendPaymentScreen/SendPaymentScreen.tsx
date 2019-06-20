import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Dimensions, Clipboard, Image } from "react-native";
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
    List, ListItem,
    Picker,
    Icon,
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import QRCode from 'react-native-qrcode-svg';
//import QRCode from 'react-native-qrcode';
import Toast from 'react-native-simple-toast';
import Share from 'react-native-share';
import RNFetchBlob from 'react-native-fetch-blob';
import { Slider, CheckBox } from 'react-native-elements';

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome model  
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelFindYourTrustedContacts from "HexaWallet/src/app/custcompontes/Model/ModelFindYourTrustedContacts/ModelFindYourTrustedContacts";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Files
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";


export default class SendPaymentScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_AccountList: [],
            arr_SelectAccountDetails: [],
            address: "",
            amount: "0.0",
            memo: "",
            memoMsg: "Add Memo",
            tranPrio: 1,
            //flag
            flag_Memo: false,
            flag_DisableSentBtn: false
        } )
    }

    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );

        let address = data.address;
        let amount = data.options.amount.toString();
        console.log( { address, amount } );


        let walletDetails = await utils.getWalletDetails();
        let arr_AccountList = await comFunDBRead.readTblAccount();
        console.log( { arr_AccountList } );

        var temp = [], arr_SelectAccountDetails = [];
        for ( let i = 0; i < arr_AccountList.length; i++ ) {
            let item = arr_AccountList[ i ];
            let data = {};
            if ( i == 0 ) {
                data.checked = true;
                arr_SelectAccountDetails = item;
            } else {
                data.checked = false;
            }
            data.balance = item.balance;
            data.accountName = item.accountName;
            data.address = item.address;
            temp.push( data );
        }

        console.log( { temp } );



        this.setState( {
            address,
            amount,
            arr_AccountList: temp,
            arr_SelectAccountDetails
        } )
    }


    setAmount() {
        let { amount } = this.state;

    }

    //Change account details on account list
    selectAccount( index: any ) {
        var temp = [], arr_SelectAccountDetails = [];
        let { arr_AccountList } = this.state;
        for ( let i = 0; i < arr_AccountList.length; i++ ) {
            let item = arr_AccountList[ i ];
            let data = {};
            if ( i == index ) {
                data.checked = true;
                arr_SelectAccountDetails = item;
            } else {
                data.checked = false;
            }
            data.balance = item.balance;
            data.accountName = item.accountName;
            data.address = item.address;
            temp.push( data );
        }
        this.setState( {
            arr_AccountList: temp,
            arr_SelectAccountDetails
        } )
    }


    //TODO: Send they amount 
    click_SendAmount() {
        let data = {}
        data.amount = this.state.amount;
        data.memo = this.state.memo;
        data.priority = this.state.tranPrio;
        data.selectedAccount = this.state.arr_SelectAccountDetails;
        this.props.navigation.push( "ConfirmAndSendPaymentScreen", { data: [ data ] } );
    }

    _renderItem( { item, index } ) {
        return (
            <View key={ "card" + index }>

                <View style={ { flex: 1, marginTop: -20 } }>
                    <List>
                        <ListItem style={ { marginRight: 18 } }>
                            <Left style={ { flex: 0.2 } }>
                                <CheckBox
                                    containerStyle={ { backgroundColor: "#ffffff", borderColor: "#ffffff", marginTop: 10 } }
                                    checkedIcon='dot-circle-o'
                                    uncheckedIcon='circle-o'
                                    checkedColor={ colors.appColor }
                                    uncheckedColor="#7EBEE6"
                                    checked={ item.checked }
                                    onPress={ () => this.selectAccount( index ) }
                                />
                            </Left>
                            <Body style={ { flex: 1 } }>
                                <Text style={ [ globalStyle.ffFiraSansBold, { fontSize: 16 } ] }>{ item.accountName }</Text>
                                <View style={ { flexDirection: "row", alignItems: "center" } }>
                                    <Text note style={ [ { fontSize: 12 } ] }>Available balance</Text>
                                    <SvgIcon
                                        name="icon_bitcoin"
                                        color="#D0D0D0"
                                        size={ 15 }
                                    />
                                    <Text note style={ { fontSize: 12, marginLeft: -0.01 } }>{ item.balance }</Text>
                                </View>

                            </Body>
                        </ListItem>
                    </List>
                </View>

            </View>
        );
    }




    render() {
        //array
        let { arr_AccountList } = this.state;
        //values
        let { amount, tranPrio, memoMsg, memo } = this.state;
        //flag
        let { flag_Memo, flag_DisableSentBtn } = this.state;
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Send</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <View style={ { flex: 0.05, marginTop: 20, alignItems: "center" } }>
                                <View style={ [ styles.itemQuestionPicker ] }>
                                    <View style={ { flexDirection: "row", alignItems: "center" } }>
                                        <SvgIcon
                                            name="icon_bitcoin"
                                            color="#D0D0D0"
                                            size={ 23 }
                                            style={ { flex: 0.2 } }
                                        />
                                        <Input
                                            value={ amount }
                                            keyboardType="numeric"
                                            placeholder="Amount"
                                            placeholderTextColor="#D0D0D0"
                                            returnKeyType="done"
                                            onChangeText={ ( val ) => {
                                                this.setState( {
                                                    amount: val
                                                } )
                                                setTimeout( () => {
                                                    this.setAmount()
                                                }, 100 );
                                            } }
                                            style={ [ globalStyle.ffOpenSansBold, { flex: 1, fontSize: 18 } ] }
                                        />
                                        <Button transparent onPress={ () => {
                                            this.setState( {
                                                flag_Memo: !flag_Memo,
                                            } )
                                            setTimeout( () => {
                                                if ( flag_Memo == true ) {
                                                    this.setState( {
                                                        memoMsg: "Add Memo",
                                                        memo: ""
                                                    } )
                                                } else {
                                                    this.setState( {
                                                        memoMsg: "Remove  ",
                                                        memo: ""
                                                    } )
                                                }
                                            }, 100 );


                                        } }>
                                            <Text style={ { color: "#7EBEE6" } }>{ memoMsg }</Text>
                                        </Button>
                                    </View>
                                </View>
                                { renderIf( flag_Memo == true )(
                                    <View style={ [ styles.itemQuestionPicker ] }>
                                        <Input
                                            value={ memo }
                                            keyboardType="default"
                                            placeholder="Add Memo"
                                            placeholderTextColor="#D0D0D0"
                                            returnKeyType="done"
                                            onChangeText={ ( val ) => {
                                                this.setState( {
                                                    memo: val
                                                } )
                                            } }
                                            style={ [ globalStyle.ffOpenSansBold, { flex: 1, fontSize: 18 } ] }
                                        />
                                    </View>
                                ) }
                            </View>
                            <View style={ { flex: 1 } } >
                                <Text style={ { margin: 20 } }>Transaction Priority</Text>
                                <View style={ { flex: 1, alignItems: "center" } }>
                                    <Slider
                                        style={ { width: Dimensions.get( 'screen' ).width - 50 } }
                                        value={ tranPrio }
                                        maximumValue={ 2 }
                                        minimumValue={ 0 }
                                        step={ 1 }
                                        animateTransitions={ true }
                                        thumbTintColor={ colors.appColor }
                                        minimumTrackTintColor={ colors.appColor }
                                        onValueChange={ value => this.setState( { tranPrio: value } ) }
                                    />
                                    <View style={ { flexDirection: "row" } }>
                                        <Text style={ { flex: 1, textAlign: "left", marginLeft: 20 } }>High</Text>
                                        <Text style={ { flex: 1, textAlign: "center" } }>Medium </Text>
                                        <Text style={ { flex: 1, textAlign: "right", marginRight: 20 } }>Low </Text>
                                    </View>
                                </View>

                            </View>
                            <View style={ { flex: 1 } }>
                                <Text style={ { margin: 20 } }>Choose any option to send</Text>
                                <FlatList
                                    data={ arr_AccountList }
                                    renderItem={ this._renderItem.bind( this ) }
                                    keyExtractor={ ( item, index ) => index }
                                />

                            </View>
                            <View style={ { flex: 1 } }>
                                <Text note style={ { textAlign: "center", margin: 20 } }>Transaction fee will be calculated in the next step according to the amount of money being sent.</Text>
                                <FullLinearGradientButton
                                    style={ [ flag_DisableSentBtn == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                    disabled={ flag_DisableSentBtn }
                                    title="Send"
                                    click_Done={ () => this.click_SendAmount() }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
                {/* <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } /> */ }
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
    },
    itemQuestionPicker: {
        flex: 1,
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        paddingLeft: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        justifyContent: "center",
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 60
    },
} );
