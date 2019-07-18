import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Button, Icon, Text } from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { Avatar } from 'react-native-elements';
import { RkCard } from "react-native-ui-kitten";


interface Props {
    data: [];
    closeModal: Function;
    click_Confirm: Function;
    click_Request: Function
}

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome Object 
import {
    colors
} from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

export default class ModelRestoreAssociateContactList extends Component<Props, any> {
    //TODO: list item click any perosn
    click_SelectContact( item: any ) {
        Alert.alert(
            'Are you sure?',
            item.givenName + ' ' + item.familyName + ' this contact associate ?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log( 'Cancel Pressed' ),
                    style: 'cancel',
                },
                { text: 'Confirm', onPress: () => this.props.click_Confirm( item.id ) },
            ],
            { cancelable: false },
        );
    }

    render() {
        let item = this.props.data.length != 0 ? this.props.data[ 0 ].item : "temp"

        return (
            <Modal
                transparent
                animationType={ 'none' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <View style={ [
                    styles.modalBackground,
                    { backgroundColor: `rgba(0,0,0,0.4)` }
                ] }
                >
                    <View style={ styles.viewModelBody }>
                        <View style={ { flexDirection: "row", flex: 0.3 } }>
                            <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }>Associate Contact</Text>
                        </View>
                        <View style={ { flex: 1 } }>
                            <FlatList
                                data={
                                    item
                                }
                                scrollEnabled={ false }
                                renderItem={ ( { item, index } ) => (
                                    <TouchableOpacity onPress={ () => this.click_SelectContact( item ) }>
                                        <RkCard
                                            rkType="shadowed"
                                            style={ {
                                                flex: 1,
                                                borderRadius: 8,
                                                marginBottom: 10,
                                            } }
                                        >
                                            <View style={ { flex: 1, backgroundColor: "#ffffff", borderRadius: 8, margin: 10 } }>
                                                <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", borderRadius: 8, } } >
                                                    { renderIf( item.thumbnailPath != "" )(
                                                        <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                    ) }
                                                    { renderIf( item.thumbnailPath == "" )(
                                                        <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                    ) }
                                                    <View style={ { flexDirection: "column", justifyContent: "center", flex: 2.8 } }>
                                                        <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>

                                                    </View>

                                                </View>
                                            </View>
                                        </RkCard>
                                    </TouchableOpacity>

                                ) }
                                keyExtractor={ item => item.recordId }
                            />
                        </View>
                    </View>

                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center'
    },
    viewModelBody: {
        flex: 0.7,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );