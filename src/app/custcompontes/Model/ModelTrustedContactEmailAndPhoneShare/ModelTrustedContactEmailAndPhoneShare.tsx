import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Button, Icon, Text } from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { SvgIcon } from "@up-shared/components";
import { Avatar } from 'react-native-elements';
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";



//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

export default class ModelTrustedContactEmailAndPhoneShare extends Component {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            selected_category: null,
        } )
    }



    render() {
        let contactDetails = this.props.data.length != 0 ? this.props.data[ 0 ].contactDetails : "";
        let arr_ConstactDetailsList = this.props.data.length != 0 ? this.props.data[ 0 ].arr_ConstactDetailsList : "";
        return (
            <Modal
                transparent
                animationType={ 'none' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
                onRequestClose={ () => {
                    console.log( "call" );
                    this.props.closeModal()
                }

                }
            >
                <View style={ [
                    styles.modalBackground,
                    { backgroundColor: `rgba(0,0,0,0.4)` }
                ] }>
                    <View style={ styles.viewModelBody }>
                        <View style={ { flexDirection: "row", flex: 1 } }>
                            <Text style={ {
                                fontWeight: "bold", fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } }>Select how you want to share the secret</Text>
                            <Button light iconLeft style={ { width: 40, height: 40, borderRadius: 20 } } onPress={ () => this.props.closeModal() }>
                                <Icon name='close' style={ { alignSelf: "center" } } />
                            </Button>
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ { textAlign: "center" } }>Some information about the importance of trust with these contacts</Text>
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "row" } }>
                            { renderIf( contactDetails.thumbnailPath != "" )(
                                <Avatar medium rounded source={ { uri: contactDetails.thumbnailPath } } />
                            ) }
                            { renderIf( contactDetails.thumbnailPath == "" )(
                                <Avatar medium rounded title={ contactDetails.givenName != null && contactDetails.givenName.charAt( 0 ) } />
                            ) }
                            <Text style={ { marginLeft: 10, fontWeight: "bold" } } >{ contactDetails.givenName }{ " " }{ contactDetails.familyName }</Text>
                        </View>
                        <View
                            style={ {
                                flex: 3,
                                marginTop: 10
                            } }
                        >
                            <FlatList
                                data={
                                    arr_ConstactDetailsList
                                }
                                showsVerticalScrollIndicator={ false }
                                renderItem={ ( { item } ) => (
                                    <TouchableOpacity onPress={ () => {
                                        console.log( item );
                                        this.setState( {
                                            selected_category: item.value
                                        } )
                                    } }
                                        style={ setTimeout( () => {
                                            this.state.selected_category == item.value ?
                                                styles.selected : null
                                        }, 100 ) }>
                                        <View style={ { flex: 1, flexDirection: "row" } }>
                                            <View style={ { flex: 0.4 } }>
                                                <Icon name='radio' style={ { alignSelf: "center" } } />
                                            </View>
                                            <View style={ { flex: 2, flexDirection: 'column' } }>
                                                <Text note>{ item.label }</Text>
                                                <Text style={ { marginBottom: 10 } }>{ item.value }</Text>
                                            </View>
                                        </View>
                                        <View
                                            style={ {
                                                height: 1,
                                                backgroundColor: "#CED0CE",
                                                marginBottom: 10
                                            } }
                                        />
                                    </TouchableOpacity>
                                ) }

                                keyExtractor={ item => item.recordID }

                            />

                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-end" } }>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Confirm() }
                                title="Confirm & Proceed"
                                disabled={ false }
                                style={ [ { borderRadius: 10 } ] } />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const primaryColor = colors.appColor;
const darkGrey = "#bdc3c7";
const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center',

    },
    viewModelBody: {
        flex: 0.7,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    },
    selected: {
        backgroundColor: "red"
    }
} );