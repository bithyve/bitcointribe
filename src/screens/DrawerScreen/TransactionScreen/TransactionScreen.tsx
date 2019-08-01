import React from "react";

import {
    StyleSheet, ImageBackground, View,
    FlatList, SafeAreaView, TouchableOpacity,
    Alert
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
            appHealthInfo: [],
            flag_Loading: false
        } );
    }


    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let walletDetails = this.props.navigation.getParam( "walletDetails" );
        let appHealthInfo = JSON.parse( walletDetails.appHealthStatus )
        console.log( { appHealthInfo } );

        console.log( { data } );
        this.setState( {
            arrSelectedAccount: data,
            walletDetails,
            appHealthInfo
        } )
    }





    // async getTransaction() {
    //     await this.getRegularTransaction();
    //     await this.getSecureTransaction();
    //     this.filterTransaction()
    // }

    // filterTransaction() {
    //     let results = [ ...this.state.recentRegularTransactions, ...this.state.recentSecureTransactions ];
    //     results = results.sort( ( a, b ) => { return a.confirmations - b.confirmations } )

    //     this.setState( { recentTransactions: results } )
    // }

    // async getRegularTransaction() {
    //     this.setState( { flag_Loading: true } );
    //     let regularAccount = await bitcoinClassState.getRegularClassState();
    //     var regularAccountTransactions = await regularAccount.getTransactions();
    //     if ( regularAccountTransactions.status == 200 ) {
    //         await bitcoinClassState.setRegularClassState( regularAccount );
    //         regularAccountTransactions = regularAccountTransactions.data;
    //         this.setState( { recentRegularTransactions: regularAccountTransactions.transactions.transactionDetails } )
    //     } else {
    //         alert.simpleOk( "Oops", regularAccountTransactions.err );
    //     }
    // }

    // async getSecureTransaction() {
    //     let secureAccount = await bitcoinClassState.getSecureClassState();
    //     var secureAccountTransactions = await secureAccount.getTransactions();
    //     if ( secureAccountTransactions.status == 200 ) {
    //         await bitcoinClassState.setSecureClassState( secureAccount );
    //         secureAccountTransactions = secureAccountTransactions.data;
    //         this.setState( { recentSecureTransactions: secureAccountTransactions.transactions.transactionDetails } )
    //     } else {
    //         alert.simpleOk( "Oops", secureAccountTransactions.err );
    //     }
    //     this.setState( { flag_Loading: false } )
    // }

    // componentWillMount() {
    //     this.getTransaction()
    // }

    // setModalVisible( modalVisible ) {
    //     this.setState( { modalVisible } )
    // }
    // updateModalData( item ) {
    //     var detailsArray = [
    //         { title: "To", value: item.transactionType === "Sent" ? item.recipientAddresses : item.accountType + " Account" },
    //         { title: "From", value: item.transactionType === "Received" ? item.senderAddresses : item.accountType + " Account" },
    //         { title: "Amount", value: item.amount / 1e8 },
    //         { title: "Fees", value: item.fee / 1e8 },
    //         { title: "Transaction ID", value: item.txid },
    //         { title: "Confirmations", value: item.confirmations },
    //     ];
    //     var selectedTransaction = {
    //         transactionType: item.transactionType,
    //         amount: item.amount / 1e8,
    //         time: "-",
    //         confirmations: item.confirmations,
    //         recipientAddresses: item.recipientAddresses,
    //         senderAddresses: item.senderAddresses,
    //         accountType: item.accountType
    //     }
    //     this.setState( { detailsArray, selectedTransaction } )
    // }
    // Recent Transaction Item view


    // _renderItem = ( { item, index } ) => {
    //     return (
    //         <View style={ { padding: 5 } }>

    //             <View style={ { flexDirection: "row", alignItems: "center" } }>
    //                 <View>
    //                     <SvgIcon
    //                         name="icon_dailywallet"
    //                         color="#37A0DA"
    //                         size={ 50 }
    //                     />
    //                 </View>

    //                 <View style={ { flex: 1, padding: 5 } }>
    //                     <Text style={ { color: "#151515", fontWeight: "600", fontSize: 14, paddingVertical: 3 } }>{ item.transactionType === "Received" ? "To " + item.accountType + " Account" : "From " + item.accountType + " Account" }</Text>
    //                     <Text style={ { color: "#8B8B8B", fontSize: 12, fontWeight: "600" } }>{ "-" }</Text>
    //                 </View>

    //                 <View style={ { paddingHorizontal: 10 } }>
    //                     <Icon
    //                         name={ item.transactionType === "Received" ? "long-arrow-down" : "long-arrow-up" }
    //                         color={ item.transactionType === "Received" ? "#51B48A" : "#E64545" }
    //                         size={ 25 }
    //                     />
    //                 </View>
    //             </View>
    //             <View style={ { flexDirection: "row", alignItems: "center", padding: 5 } }>
    //                 <View style={ { alignItems: "center", justifyContent: "center" } }>
    //                     <SvgIcon
    //                         name="icon_more"
    //                         color="#E2E2E2"
    //                         size={ 50 }
    //                     />
    //                 </View>
    //                 <TouchableOpacity
    //                     style={ styles.amountView }
    //                     activeOpacity={ 1 }
    //                     onPress={ () => {
    //                         this.updateModalData( item );
    //                         this.setModalVisible( true );
    //                     } }>

    //                     <SvgIcon
    //                         name="icon_bitcoin"
    //                         color="#d0d0d0"
    //                         size={ 30 }
    //                     />
    //                     <View style={ {
    //                         flex: 1, flexDirection: "row", alignItems: 'center', paddingHorizontal: 10
    //                     } }>
    //                         <Text style={ { color: "#2F2F2F", fontSize: 20, fontWeight: "bold" } }>{ item.amount / 1e8 }</Text>
    //                         <Text style={ { color: "#D0D0D0", fontSize: 15, fontWeight: "600", paddingHorizontal: 10 } }>{ item.confirmations }</Text>
    //                     </View>

    //                     <SvgIcon
    //                         name="icon_forword"
    //                         color="#C4C4C4"
    //                         size={ 18 }
    //                     />

    //                 </TouchableOpacity>
    //             </View>
    //         </View> )
    // }

    render() {
        //array
        let { arrSelectedAccount, appHealthInfo } = this.state;
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <CustomeStatusBar backgroundColor={ colors.appColor } flagShowStatusBar={ true } barStyle="light-content" />
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
                                    style={ { width: 50, height: 50 } }
                                    source={
                                        svgIcon.walletScreen[ arrSelectedAccount.svgIcon ]
                                    }
                                />
                                <Text
                                    style={ [ globalStyle.ffFiraSansMedium, {
                                        flex: 2,
                                        fontSize: 16,
                                        marginLeft: 10
                                    } ] }
                                >
                                    { arrSelectedAccount.accountName }
                                </Text>
                                <View style={ { flexDirection: "row" } }>
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
                                    <Text note style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] } >Anant's Savings</Text>
                                    <Text style={ [ globalStyle.ffOpenSansBold, { fontSize: 20 } ] }>
                                        { arrSelectedAccount.balance }
                                    </Text>

                                </View>
                                <View
                                    style={ {
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "flex-end",
                                        justifyContent: "flex-end"
                                    } }
                                >
                                    <Button transparent>
                                        <SvgIcon
                                            name="timelockNew"
                                            color="gray"
                                            size={ 20 }
                                        />
                                    </Button>
                                    <Button transparent style={ { marginLeft: 10 } }>
                                        <SvgIcon name="icon_multisig" color="gray" size={ 20 } />
                                    </Button>
                                </View>
                            </View>
                        </RkCard>
                        <View style={ { flex: 1.8 } }>
                            <Text note style={ { textAlign: "center" } }>Recent Transaction</Text>

                        </View>
                        <View style={ { flex: 0.4 } }>
                            <FullLinearGradientTransactionScreenThreeOpt
                                style={ [ { opacity: 1 }, { borderRadius: 10, height: 55 } ] }
                                disabled={ false }
                                title="Send"
                                click_Sent={ () => console.log( 'hi' )
                                }
                                click_Transfer={ () => Alert.alert( "Working" )
                                }
                                click_Recieve={ () => Alert.alert( "Working" )
                                }
                            />
                        </View>
                        {/* <FlatList
                            style={ { flex: 1, padding: 10 } }
                            data={ this.state.recentTransactions }
                            renderItem={ this._renderItem }
                            keyExtractor={ ( item, index ) => index.toString() }
                            refreshControl={
                                <RefreshControl
                                    onRefresh={ () => { this.getTransaction() } }
                                    refreshing={ false }
                                ></RefreshControl>
                            }
                        /> */}
                    </ImageBackground>

                    {/* <Modal
                        setModalVisible={ this.setModalVisible.bind( this ) }
                        modalData={ {
                            selectedTransaction: this.state.selectedTransaction,
                            detailsArray: this.state.detailsArray,
                            modalVisible: this.state.modalVisible,
                        }
                        }

                    /> */}
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