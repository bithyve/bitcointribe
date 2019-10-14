import React from "react";
import { StyleSheet, ImageBackground, View, Platform, SafeAreaView, FlatList, Dimensions, Alert } from "react-native";
import {
    Container,
    Input,
    Button,
    Left,
    Body,
    Text,
    List,
    ListItem,
} from "native-base";
import { SvgIcon } from "hexaComponent/Icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Slider, CheckBox } from 'react-native-elements';


//TODO: Custome Pages
import { StatusBar } from "hexaComponent/StatusBar";
import { HeaderTitle } from "hexaComponent/Header";
import { ModelLoader } from "hexaComponent/Loader";
import { FullLinearGradientLoadingButton } from "hexaComponent/LinearGradient/Buttons";

//TODO: redux
import { connect } from 'react-redux';
import { getAccountDetails } from "hexaRedux/payment/controller";
import { onSendAmountT1 } from 'hexaRedux'



//TODO: Custome StyleSheet Files       
import FontFamily from "hexaComponent/Styles/FontFamily";

//TODO: Custome Object
import { colors, images } from "hexaConstants";
var utils = require( "hexaUtils" );
import { renderIf } from "hexaValidation";


//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

//TODO: Bitcoin Files
var bitcoinClassState = require( "hexaClassState" );


class SendPayment extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_AccountList: [],
            arr_SelectAccountDetails: [],
            address: "",
            amount: "0",
            memo: "",
            selectedAccountBal: 0,
            memoMsg: "Add Memo",
            tranPrio: 1,
            //flag  
            flag_Memo: false,
            flag_DisableSentBtn: true,
            flag_SentBtnAnimation: false,
            flag_Loading: false
        } )
    }

    async componentWillMount() {
        const { navigation } = this.props;
        let data = navigation.getParam( "data" );
        let selectedAccount = navigation.getParam( "selectedAccount" );
        console.log( { selectedAccount } );
        console.log( { data } );
        const details = await getAccountDetails( { selectedAccount, data } );
        console.log( { state: details } );
        this.setState( { ...details } );
    }


    componentWillReceiveProps = ( nextProps: any ) => {
        console.log( { nextProps } );
        if ( nextProps.sendAmountDataT1 !== this.props.sendAmountDataT1 ) {
            let resTransferST = nextProps.sendAmountDataT1.resTransferST;
            console.log( { resTransferST } );
            if ( resTransferST.status == 200 ) {
                this.setState( {
                    flag_Loading: false,
                    flag_DisableSentBtn: false,
                    flag_SentBtnAnimation: false
                } );
                this.props.navigation.push( "ConfirmAndSendPayment" );
            } else {
                this.setState( {
                    flag_Loading: false,
                    flag_DisableSentBtn: false,
                    flag_SentBtnAnimation: false
                } )
                let msg = resTransferST.data != undefined ? resTransferST.err + "\n Total Fee = " + resTransferST.data.fee : resTransferST.err
                setTimeout( () => {
                    Alert.alert(
                        'Oops',
                        msg,
                        [
                            {
                                text: 'Ok', onPress: () => {

                                }
                            },
                        ],
                        { cancelable: false },
                    );
                }, 100 );
                this.setState( {
                    flag_DisableSentBtn: true,
                } )
            }
        }
    }



    componentWillUnmount() {
        utils.setFlagQRCodeScreen( true );
    }

    setAmount() {
        let { amount, selectedAccountBal } = this.state;
        let enterAmount = parseFloat( amount );
        var flag_DisableSentBtn;
        if ( enterAmount != 0 && enterAmount < parseFloat( selectedAccountBal ) ) {
            flag_DisableSentBtn = false;
        } else if ( enterAmount >= parseFloat( selectedAccountBal ) ) {
            flag_DisableSentBtn = true;
        } else if ( amount == "" || enterAmount == 0 ) {
            flag_DisableSentBtn = true;
        }
        this.setState( {
            flag_DisableSentBtn
        } )
    }


    //Change account details on account list
    selectAccount( index: any ) {
        let enterAmount = parseFloat( this.state.amount )
        console.log( { enterAmount } );
        var temp = [], arr_SelectAccountDetails = [], selectedAccountBal;
        let { arr_AccountList } = this.state;
        console.log( { arr_AccountList } );
        for ( let i = 0; i < arr_AccountList.length; i++ ) {
            let item = arr_AccountList[ i ];
            let data = {};
            if ( i == index ) {
                data.checked = true;
                arr_SelectAccountDetails = item;
                selectedAccountBal = parseFloat( item.balance );
            } else {
                data.checked = false;
            }
            data.balance = item.balance;
            data.accountName = item.accountName;
            temp.push( data );
        }
        console.log( { selectedAccountBal } );
        var flag_DisableSentBtn;
        if ( enterAmount != 0 && enterAmount < selectedAccountBal ) {
            flag_DisableSentBtn = false;
        } else if ( enterAmount >= selectedAccountBal ) {
            flag_DisableSentBtn = true;
        } else if ( enterAmount == 0 ) {
            flag_DisableSentBtn = true;
        }
        console.log( { selectedAccountBal } );
        this.setState( {
            selectedAccountBal,
            arr_AccountList: temp,
            arr_SelectAccountDetails,
            flag_DisableSentBtn
        } )
    }


    //TODO: Send they amount 
    click_SendAmount = async () => {
        let { arr_SelectAccountDetails, address, amount, tranPrio, memo } = this.state;
        const { onSendAmountT1 } = this.props;
        this.setState( {
            flag_Loading: true,
            flag_DisableSentBtn: true,
            flag_SentBtnAnimation: true
        } );
        await onSendAmountT1( { arr_SelectAccountDetails, address, amount, tranPrio, memo } )
    }


    //TODO: When qrcode  scan 
    getAddressWithBal = ( e: any ) => {
        console.log( { e } );
        let { amount } = this.state;
        let data = e.data;
        console.log( { data } );
        let address = data != undefined ? data.address : "";
        console.log( { address } );
        if ( address != "" ) {
            if ( data.type != "address" ) {
                this.setAmountAndAddress( address, data.amount != undefined ? data.amount.toString() : "0" );
            } else {
                this.setAmountAndAddress( address, amount.toString() );
            }
        }
    }

    setAmountAndAddress( address: string, amount: string ) {
        let { selectedAccountBal, flag_DisableSentBtn } = this.state;
        if ( amount != "0" && parseFloat( amount ) < parseFloat( selectedAccountBal ) && address != "" ) {
            flag_DisableSentBtn = false;
        } else {
            flag_DisableSentBtn = true;
        }
        console.log( { address, amount } );
        this.setState( {
            address,
            amount: amount,
            flag_DisableSentBtn
        } )
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
                                <Text style={ [ FontFamily.ffFiraSansBold, { fontSize: 16 } ] }>{ item.accountName }</Text>
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
        let { amount, tranPrio, memoMsg, memo, address } = this.state;
        //flag
        let { flag_Memo, flag_DisableSentBtn, flag_Loading, flag_SentBtnAnimation } = this.state;
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title="Send"
                        pop={ () => this.props.navigation.pop() }
                    />
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <View style={ { flex: 0.05, alignItems: "center" } }>
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
                                            placeholder="Amount Sats"
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
                                            style={ [ FontFamily.ffOpenSansBold, { flex: 1, fontSize: 18 } ] }
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
                                            style={ [ FontFamily.ffOpenSansBold, { flex: 1, fontSize: 18 } ] }
                                        />
                                    </View>
                                ) }
                                <View style={ [ styles.itemQuestionPicker ] }>
                                    <View style={ { flexDirection: "row" } }>
                                        <Input
                                            value={ address }
                                            keyboardType="default"
                                            placeholder="Address"
                                            placeholderTextColor="#D0D0D0"
                                            returnKeyType="done"
                                            onChangeText={ ( val ) => {
                                                this.setState( {
                                                    address: val
                                                } )
                                            } }
                                            style={ [ FontFamily.ffOpenSansBold, { flex: 1, fontSize: 18 } ] }
                                        />
                                        <Button
                                            transparent
                                            style={ { flex: 0.15 } }
                                            onPress={ () => {
                                                this.props.navigation.push( "SendPaymentAddressScan", { onSelect: this.getAddressWithBal.bind( this ) } )
                                            } }>
                                            <SvgIcon name="qr-codes" color="#000000" size={ 30 } />
                                        </Button>
                                    </View>
                                </View>
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
                                        onValueChange={ value => {
                                            this.setState( { tranPrio: value } )
                                        } }
                                    />
                                    <View style={ { flexDirection: "row" } }>
                                        <Text style={ { flex: 1, textAlign: "left", marginLeft: 20 } }>Low</Text>
                                        <Text style={ { flex: 1, textAlign: "center" } }>Medium </Text>
                                        <Text style={ { flex: 1, textAlign: "right", marginRight: 20 } }>High </Text>
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
                                <Text note style={ { textAlign: "center", margin: 10 } }>Transaction fee will be calculated in the next step according to the amount of money being sent.</Text>
                                <FullLinearGradientLoadingButton
                                    style={ [ flag_DisableSentBtn == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10, margin: 10 } ] }
                                    disabled={ flag_DisableSentBtn }
                                    animating={ flag_SentBtnAnimation }
                                    title=" Send"
                                    click_Done={ () => this.click_SendAmount() }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </SafeAreaView>
                </ImageBackground>
                <ModelLoader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
                <StatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
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


const mapDispatchToProps = ( dispatch ) => {
    return {
        onSendAmountT1: ( args ) => {
            dispatch( onSendAmountT1( args ) );
        }
    }
}

const mapStateToProps = state => {
    return {
        sendAmountDataT1: state.paymentReducer.sendAmountDataT1
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)( SendPayment );

