import React, { Component } from 'react';
import { Modal, View, Alert, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import {
    Button,
    Text,
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import Share from 'react-native-share';



interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manage/Global/StyleSheet/Style";

export default class ModelMnemonicDisplay extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            mnemonic: ""
        } );
    }


    componentWillReceiveProps( nextProps: any ) {
        var data = nextProps.data[ 0 ];
        if ( data != undefined ) {
            data = data.data;
            //console.log( { data } );
            this.setState( {
                mnemonic: data,
            } );
        }
    }




    //TODO: Next button on click
    click_Share() {
        let { mnemonic } = this.state;
        const shareOptions = {
            title: 'Mnemonic',
            message: mnemonic,
            url: 'https://hexawallet.io',
        };
        Share.open( shareOptions )
            .then( ( res: any ) => { Alert.alert( 'Mnemonic send' ); } )
            .catch( ( err: any ) => { err && console.log( err ); } );
    }

    render() {
        let { mnemonic } = this.state;
        return (
            <Modal
                transparent
                animationType={ 'fade' }
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
                        <View style={ { flexDirection: "row", flex: 0.2 } }>
                            <Button
                                transparent
                                hitSlop={ { top: 5, bottom: 8, left: 10, right: 15 } }
                                onPress={ () => this.props.pop() }
                            >
                                <SvgIcon name="icon_back" size={ 25 } color="gray" />
                            </Button>
                            <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }>Your Mnemonic</Text>
                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-start" } }>
                            <View style={ [ styles.itemQuestionPicker, { height: 120 } ] }>
                                <TextInput
                                    value={ mnemonic }
                                    style={ { padding: 5 } }
                                    multiline={ true }
                                    numberOfLines={ 40 }
                                    editable={ false }
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal >
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center'
    },
    viewModelBody: {
        flex: 0.4,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    },
    itemInputWalletName: {
        width: Dimensions.get( 'screen' ).width / 1.21,
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
        marginTop: 20,
        width: Dimensions.get( 'screen' ).width / 1.21,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
} );