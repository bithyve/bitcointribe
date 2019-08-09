import React from "react";

import {
    StyleSheet, ImageBackground, View,
    FlatList, SafeAreaView, TouchableOpacity,
    Alert,
    RefreshControl
} from "react-native";

import {
    Container,
    Button,
    Text
} from "native-base";

import { RkCard } from "react-native-ui-kitten";
import ImageSVG from 'react-native-remote-svg';

import Icon from "react-native-vector-icons/FontAwesome";

//TODO: Custome Object
import { images, colors, svgIcon } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome Compontes
import FullLinearGradientTransactionScreenThreeOpt from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientTransactionScreenThreeOpt";

//TODO: ModalAllTransaction
import Modal from "HexaWallet/src/app/custcompontes/Model/ModalAllTransactions/ModalAllTransactionDetails.tsx";


import { SvgIcon } from "@up-shared/components";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";

let alert = new AlertSimple();

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );

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
        let regularAccount = await bitcoinClassState.getRegularClassState();
        let secureAccount = await bitcoinClassState.getSecureClassState();
        var resTransaction;
        if ( arrSelectedAccount.accountType == "Regular Account" ) {
            resTransaction = await regularAccount.getTransactions();
            if ( resTransaction.status == 200 ) {
                resTransaction = resTransaction.data;
            } else {
                alert.simpleOkAction( "Oops", resTransaction.err, this.click_StopLoader );
            }
        } else {
            resTransaction = await secureAccount.getTransactions();
            if ( resTransaction.status == 200 ) {
                resTransaction = resTransaction.data;
            } else {
                alert.simpleOkAction( "Oops", resTransaction.err, this.click_StopLoader );
            }
        }
        this.setState( {
            flag_Loading: false,
            arrTransaction: resTransaction.transactions.transactionDetails
        } )
    }

    _renderItem = ( { item, index } ) => {
        return (
            <View style={ { padding: 5 } }>

                <View style={ { flexDirection: "row", alignItems: "center" } }>
                    <View>
                        <ImageSVG
                            style={ { width: 50, height: 50 } }
                            source={
                                svgIcon.walletScreen[ item.accountType == "Regular" ? "dailyAccount" : "secureAccount" ]
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
                <CustomeStatusBar backgroundColor={ colors.appColor } flagShowStatusBar={ true } barStyle="light-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { flex: 1, backgroundColor: colors.appColor } }>
                            <View style={ { flexDirection: "row", alignItems: "flex-start", marginLeft: 20, marginRight: 20 } }>
                                <View style={ { flex: 1, alignItems: "flex-start" } }>
                                    <Button
                                        transparent
                                        onPress={ () => this.props.navigation.navigate( "TabbarBottom" ) }
                                    >
                                        <SvgIcon name="icon_back" size={ 25 } color="#ffffff" />
                                    </Button>
                                </View>
                                <View style={ { flex: 0.1, alignItems: "flex-end" } }>
                                    <ImageSVG
                                        style={ { width: 60, height: 60 } }
                                        source={
                                            svgIcon.transactionScreen[ appHealthInfo.overallStatus ]
                                        }
                                    />
                                </View>
                            </View>
                        </View>
                        <RkCard
                            rkType="shadowed"
                            style={ {
                                flex: 0.8,
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
                                    style={ { width: 50, height: 50 } }
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
                        <View style={ { flex: 1.8 } }>
                            <Text note style={ { textAlign: "center" } }>Recent Transactions</Text>
                            {
                                !flag_Loading && arrTransaction.length === 0 ?
                                    <View style={ { justifyContent: "center", alignItems: "center", padding: 20, paddingTop: 50 } }>
                                        <Text style={ { textAlign: "center", color: "#838383" } }>{ "Start transactions to see your recent transactions history." }</Text>
                                    </View> : null
                            }
                            <FlatList
                                style={ { flex: 1, padding: 10 } }
                                data={ arrTransaction }
                                renderItem={ this._renderItem }
                                keyExtractor={ ( item, index ) => index.toString() }
                                refreshControl={
                                    <RefreshControl
                                        onRefresh={ () => { this.getRegularTransaction() } }
                                        refreshing={ false }
                                    ></RefreshControl>
                                }
                            />
                        </View>
                        <View style={ { flex: 0.4 } }>
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

                    </ImageBackground>
                </SafeAreaView>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#fff"
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