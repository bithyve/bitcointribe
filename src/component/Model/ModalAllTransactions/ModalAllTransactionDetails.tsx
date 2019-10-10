import React, { Component } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SvgIcon } from "hexaComponent/Icons";
import Icon from "react-native-vector-icons/FontAwesome";



import { ImageSVG } from "hexaComponent/ImageSVG";
import { FullLinearGradientButton } from "hexaComponent/LinearGradient/Buttons";

//TODO: Custome Pages  
import { svgIcon } from "hexaConstants";

interface Props {
    data: [];
    closeModal: Function;
    click_GoToWallet: Function;
}

export default class ModalAllTransactionDetails extends Component<Props, any> {
    //details item view
    _renderDetailsItem = ( { item, index } ) => {
        return (
            <TouchableOpacity
                activeOpacity={ 1 }
                style={ { backgroundColor: "#F8F8F8", borderRadius: 10, marginVertical: 10, padding: 15 } }>
                <Text style={ { color: "#8B8B8B", fontSize: 14, fontWeight: "600", paddingVertical: 5 } }>{ item.title }</Text>
                <Text style={ { color: "#151515", fontSize: 14, fontWeight: "600" } }>{ item.value }</Text>
            </TouchableOpacity> )

    }
    render() {
        const { modalVisible, selectedTransaction, detailsArray } = this.props.modalData;
        return ( <Modal
            visible={ modalVisible }
            transparent
            animationType={ "fade" }
        >
            <TouchableOpacity
                activeOpacity={ 1 }
                style={ styles.container }
            >
                <View style={ { flex: 1, backgroundColor: 'white', marginHorizontal: 20, marginVertical: 50, borderRadius: 10, padding: 10 } }>
                    <View style={ { padding: 5 } }>
                        <View style={ { flexDirection: "row", alignItems: "center", padding: 5 } }>
                            <View>
                                <ImageSVG
                                    size={ 50 }
                                    source={
                                        svgIcon.walletScreen[ selectedTransaction.accountType == "Regular" ? Platform.OS == "ios" ? "dailyAccountSVG" : "dailyAccountPNG" : Platform.OS == "ios" ? "secureAccountSVG" : "secureAccountPNG" ]
                                    }
                                />
                            </View>
                            <View style={ { flex: 1, padding: 5 } }>
                                <Text style={ { color: "#151515", fontWeight: "600", fontSize: 14, paddingVertical: 3 } }>{ selectedTransaction.transactionType === "Received" ? "To " + selectedTransaction.accountType + " Account" : "From " + selectedTransaction.accountType + " Account" }</Text>
                                <Text style={ { color: "#2F2F2F", fontSize: 12, fontWeight: "600" } }>{ selectedTransaction.time }</Text>
                            </View>
                        </View>
                        <View style={ { flexDirection: "row", alignItems: "center", padding: 5 } }>

                            <View style={ styles.amountView }>
                                <SvgIcon
                                    name="icon_bitcoin"
                                    color="#d0d0d0"
                                    size={ 30 }
                                />
                                <View style={ {
                                    flex: 1, flexDirection: "row", alignItems: 'center', paddingHorizontal: 10
                                } }>
                                    <Text style={ { color: "#2F2F2F", fontSize: 20, fontWeight: "bold" } }>{ selectedTransaction.amount }</Text>
                                    <Text style={ { color: "#D0D0D0", fontSize: 15, fontWeight: "600", paddingHorizontal: 10 } }>{ selectedTransaction.NumberofConfirmations }</Text>
                                </View>
                                <View >
                                    <Icon
                                        name={ selectedTransaction.transactionType === "Received" ? "long-arrow-down" : "long-arrow-up" }
                                        color={ selectedTransaction.transactionType === "Received" ? "#51B48A" : "#E64545" }
                                        size={ 25 }
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={ { marginTop: 5, paddingHorizontal: 10 } }>
                        <Text style={ { color: "#B7B7B7", fontWeight: "600", fontSize: 14 } }>{ "Transaction Details" }</Text>
                    </View>
                    <View style={ { flex: 1 } }>
                        <FlatList
                            style={ { padding: 10 } }
                            scrollEnabled
                            data={ detailsArray }
                            renderItem={ this._renderDetailsItem }
                            keyExtractor={ ( item, index ) => index.toString() }
                        />
                    </View>
                    <View>
                        <FullLinearGradientButton
                            click_Done={ () => {
                                this.props.setModalVisible( false );
                            }
                            }
                            title="Back to Transactions"
                            disabled={ false }
                            style={ { borderRadius: 10 } }
                        />
                    </View>
                </View>

            </TouchableOpacity>
        </Modal> );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "rgba(47, 47, 47, 0.9)"
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
    }
} );