import React from "react";

import {
    StyleSheet, ImageBackground, View,
    FlatList, SafeAreaView,
    Alert,
    RefreshControl,
    Platform,
    StatusBar
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    Container,
    Button,
    Text
} from "native-base";

import { RkCard } from "react-native-ui-kitten";
import ImageSVG from "HexaWallet/src/screens/Custome/ImageSVG/ImageSVG";

import Icon from "react-native-vector-icons/FontAwesome";

//TODO: Custome Object
import { images, colors, svgIcon } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manage/Global/StyleSheet/Style";

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome Compontes
import FullLinearGradientTransactionScreenThreeOpt from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientTransactionScreenThreeOpt";




import { SvgIcon } from "@up-shared/components";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";

let alert = new AlertSimple();

//TODO: Common Funciton
var comFunTran = require( "HexaWallet/src/app/manage/CommonFunction/CommonTransaction" );

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manage/ClassState/BitcoinClassState" );

export default class TransactionScreen extends React.Component<any, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arrSelectedAccount: [],
            walletDetails: [],
            appHealthInfo: {},
            arrTransaction: [],
            flag_Loading: false
        } );
    }


    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let walletDetails = this.props.navigation.getParam( "walletDetails" );
        let appHealthInfo = JSON.parse( walletDetails.appHealthStatus )
        console.log( { accoundDetappInfo: appHealthInfo } );
        console.log( { data } );
        this.setState( {
            arrSelectedAccount: data,
            walletDetails,
            appHealthInfo
        }, () => {
            this.getRegularTransaction();
        } );

    }


    click_StopLoader = () => {
        this.setState( { flag_Loading: false } );
    }


    async getRegularTransaction() {
        let { arrSelectedAccount } = this.state;
        this.setState( { flag_Loading: true } );
        var resTransaction = [];
        if ( arrSelectedAccount.accountType == "Regular Account" ) {
            resTransaction = await comFunTran.getSecAccountTran( "Regular" );
            // resTransaction.length != 0 ? resTransaction : resTransaction = await this.getAccountTrans( "Regular" )
            //console.log( { resTransaction } );
        } else {
            resTransaction = await comFunTran.getSecAccountTran( "Secure" );
            /// resTransaction.length != 0 ? resTransaction : resTransaction = await this.getAccountTrans( "Secure" )
        }
        this.setState( {
            flag_Loading: false,
            arrTransaction: resTransaction
        } )
    }


    getNewTrnasaction = async () => {
        this.setState( { flag_Loading: true } );
        var resTransaction = [];
        let { arrSelectedAccount } = this.state;
        if ( arrSelectedAccount.accountType == "Regular Account" ) {
            resTransaction = await this.getAccountTrans( "Regular" )
        }
        else {
            resTransaction = await this.getAccountTrans( "Secure" )
        }
        this.setState( {
            flag_Loading: false,
            arrTransaction: resTransaction
        } )
    }

    getAccountTrans = async ( type: string ) => {
        await comFunTran.getAccountTransaction();
        let regularAccount = await bitcoinClassState.getRegularClassState();
        let secureAccount = await bitcoinClassState.getSecureClassState();
        let resTransaction = [];
        if ( type == "Regular" ) {
            resTransaction = await regularAccount.getTransactions();
            if ( resTransaction.status == 200 ) {
                return resTransaction.data.transactions.transactionDetails;
            } else {
                alert.simpleOkAction( "Oops", resTransaction.err, this.click_StopLoader );
            }
        } else {
            resTransaction = await secureAccount.getTransactions();
            if ( resTransaction.status == 200 ) {
                return resTransaction.data.transactions.transactionDetails;
            } else {
                alert.simpleOkAction( "Oops", resTransaction.err, this.click_StopLoader );
            }
        }
    }


    _renderItem = ( { item, index } ) => {
        return (
            <View style={ { padding: 5 } }>

                <View style={ { flexDirection: "row", alignItems: "center" } }>
                    <View>
                        <ImageSVG
                            size={ 50 }
                            source={
                                svgIcon.walletScreen[ item.accountType == "Regular" ? Platform.OS == "ios" ? "dailyAccountSVG" : "dailyAccountPNG" : Platform.OS == "ios" ? "secureAccountSVG" : "secureAccountPNG" ]
                            }
                        />
                    </View>
                    <View style={ { flex: 1, padding: 5 } }>
                        <Text style={ { color: "#151515", fontWeight: "600", fontSize: 14, paddingVertical: 3 } }>{ item.transactionType === "Received" ? "To " + item.accountType + " Account" : "From " + item.accountType + " Account" }</Text>
                        <Text style={ { color: "#8B8B8B", fontSize: 12, fontWeight: "600" } }>{ "-" }</Text>
                    </View>

                    <View style={ { paddingHorizontal: 10 } }>
                        <Icon
                            name={ item.transactionType === "Received" ? "long-arrow-down" : "long-arrow-up" }
                            color={ item.transactionType === "Received" ? "#51B48A" : "#E64545" }
                            size={ 25 }
                        />
                    </View>
                </View>
                <View style={ { flexDirection: "row", alignItems: "center", padding: 5 } }>
                    <View style={ { alignItems: "center", justifyContent: "center" } }>
                        <SvgIcon
                            name="icon_more"
                            color="#E2E2E2"
                            size={ 50 }
                        />
                    </View>
                    <View
                        style={ styles.amountView }
                    >
                        <SvgIcon
                            name="icon_bitcoin"
                            color="#d0d0d0"
                            size={ 30 }
                        />
                        <View style={ {
                            flex: 1, flexDirection: "row", alignItems: 'center', paddingHorizontal: 10
                        } }>
                            <Text style={ { color: "#2F2F2F", fontSize: 20, fontWeight: "bold" } }>
                                { item.amount }
                                <Text note> sats</Text>
                            </Text>
                            <Text style={ { color: "#D0D0D0", fontSize: 15, fontWeight: "600", paddingHorizontal: 10 } }>{ item.confirmations }</Text>
                        </View>

                        <SvgIcon
                            name="icon_forword"
                            color="#C4C4C4"
                            size={ 18 }
                        />
                    </View>
                </View>
            </View> )
    }


    render() {
        //array  
        let { arrSelectedAccount, appHealthInfo, arrTransaction } = this.state;
        //flag     
        let { flag_Loading } = this.state;
        return (
            <Container>
                <SafeAreaView style={ { flex: 0, backgroundColor: colors.appColor } } />
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <View style={ [ utils.getIphoneSize() == "iphone X" ? { flex: 0.8 } : { flex: 1.3 }, { backgroundColor: colors.appColor } ] }>
                            <View style={ { flexDirection: "row", margin: StatusBar.currentHeight } }>
                                <View style={ { flex: 1, alignItems: "flex-start" } }>
                                    <Button
                                        style={ Platform.OS == "ios" ? { margin: 10 } : null }
                                        transparent
                                        onPress={ () => this.props.navigation.navigate( "TabbarBottom" ) }
                                    >
                                        <SvgIcon name="icon_back" size={ 25 } color="#ffffff" />
                                    </Button>
                                </View>
                                <View style={ { flex: 0.1, alignItems: "flex-end" } }>
                                    <ImageSVG
                                        size={ 60 }
                                        source={
                                            Platform.OS == "ios" ? svgIcon.transactionScreen[ "SVG" + appHealthInfo.overallStatus ] : svgIcon.transactionScreen[ "PNG" + appHealthInfo.overallStatus ]
                                        }
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={ { flex: 0.3 } }>
                            <RkCard
                                rkType="shadowed"
                                style={ {
                                    flex: 1,
                                    margin: 10,
                                    marginTop: -120,
                                    borderRadius: 10
                                } }
                            >
                                <View
                                    rkCardHeader
                                    style={ {
                                        flex: 0.4,
                                        justifyContent: "center",
                                        borderBottomColor: "#F5F5F5",
                                        borderBottomWidth: 1
                                    } }
                                >
                                    <ImageSVG
                                        size={ 50 }
                                        source={
                                            svgIcon.walletScreen[ arrSelectedAccount.svgIcon ]
                                        }
                                    />
                                    <Text
                                        style={ [ globalStyle.ffFiraSansMedium, {
                                            flex: 2,
                                            fontSize: 18,
                                            alignSelf: "center",
                                            marginLeft: 10
                                        } ] }
                                    >
                                        { arrSelectedAccount.accountName }
                                    </Text>
                                    <View style={ { alignSelf: "center", flexDirection: "row" } }>
                                        <SvgIcon name="icon_settings" color="gray" size={ 15 } />
                                    </View>
                                </View>
                                <View
                                    rkCardContent
                                    style={ {
                                        flex: 0.4,
                                        flexDirection: "row"
                                    } }
                                >
                                    <View
                                        style={ {
                                            flex: 1,
                                            justifyContent: "center",
                                        } }
                                    >
                                        <SvgIcon name="icon_bitcoin" color="gray" size={ 40 } />
                                    </View>
                                    <View style={ { flex: 4 } }>
                                        <Text style={ [ globalStyle.ffOpenSansBold, { fontSize: 30 } ] }>
                                            { arrSelectedAccount.balance }
                                        </Text>
                                    </View>
                                </View>
                            </RkCard>
                        </View>
                        <View style={ { flex: 1.8 } }>
                            <KeyboardAwareScrollView
                                enableAutomaticScroll
                                automaticallyAdjustContentInsets={ true }
                                keyboardOpeningTime={ 0 }
                                refreshControl={
                                    <RefreshControl
                                        refreshing={ false }
                                        onRefresh={ () => {
                                            this.getNewTrnasaction()
                                        } }
                                    />
                                }
                                enableOnAndroid={ true }
                                contentContainerStyle={ { flexGrow: 1 } }
                            >
                                <View style={ { flex: 1.8 } }>
                                    <Text note style={ { textAlign: "center" } }>Recent Transactions</Text>
                                    {
                                        !flag_Loading && arrTransaction.length === 0 ?
                                            <View style={ { justifyContent: "center", alignItems: "center", padding: 20, paddingTop: 50 } }>
                                                <Text style={ { textAlign: "center", color: "#838383", marginBottom: 10 } }>{ "Start transactions to see your recent transactions history." }</Text>
                                                <Text style={ [ globalStyle.ffFiraSansRegular, { textAlign: "center", marginTop: 10 } ] }>Please pull down to refresh, if all transactions are not visible.</Text>
                                            </View> : null
                                    }
                                    <FlatList
                                        style={ { flex: 1, padding: 10 } }
                                        data={ arrTransaction }
                                        renderItem={ this._renderItem }
                                        keyExtractor={ ( item, index ) => index.toString() }
                                        refreshControl={
                                            <RefreshControl
                                                onRefresh={ () => { this.getNewTrnasaction() } }
                                                refreshing={ false }
                                            ></RefreshControl>
                                        }
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                        </View>
                        <View style={ [ utils.getIphoneSize() == "iphone X" ? { flex: 0.18 } : { flex: 0.4 } ] }>
                            <FullLinearGradientTransactionScreenThreeOpt
                                style={ [ { opacity: 1 }, { borderRadius: 10, height: 55 } ] }
                                disabled={ false }
                                title="Send"
                                click_Sent={ () => {
                                    this.props.navigation.push( "SendPaymentNavigation", { selectedAccount: arrSelectedAccount } )
                                }
                                }
                                click_Transfer={ () => {
                                    Alert.alert( "Working" )
                                }
                                }
                                click_Recieve={ () => {
                                    this.props.navigation.push( "RecieveNavigation", { selectedAccount: arrSelectedAccount } )
                                }
                                }
                            />
                        </View>
                    </SafeAreaView>
                </ImageBackground>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
                <CustomeStatusBar backgroundColor={ colors.appColor } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },
    amountView: {
        flexDirection: "row", flex: 1, alignItems: "center", padding: 15,
        borderColor: "#EFEFEF",
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        elevation: 4,
        shadowOffset: { width: 5, height: 5 },
        shadowColor: "#000000",
        shadowOpacity: 0.1,
        shadowRadius: 20
    },
    filterView: {
        flexDirection: "row",
        padding: 5,
        borderColor: "#D0D0D0",
        borderWidth: 0.5,
        backgroundColor: "#FFFFFF",
        borderRadius: 5,
        alignItems: "center"
    },
    subTitleText: {
        color: "#B7B7B7",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 15,
        paddingVertical: 10
    }
} );