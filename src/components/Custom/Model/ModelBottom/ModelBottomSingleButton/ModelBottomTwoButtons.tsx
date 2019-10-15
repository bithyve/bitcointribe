import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from "native-base";
import Modal from 'react-native-modalbox';

import { ImageSVG } from "hexaCustImage";



//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";


//TODO: Custome Object
import {
    colors,
    svgIcon
} from "hexaConstants";


interface Props {
    data: [];
    closeModal: Function;
    click_Done: Function;
    click_Option1: Function;
    click_Option2: Function;
    pop: Function;
}



export default class ModelBottomTwoButtons extends Component<Props, any> {


    constructor ( props: any ) {
        super( props );
        this.state = ( {
            data: []
        } )
    }


    componentWillReceiveProps = ( nextProps: any ) => {
        let data = nextProps.data;
        //console.log( { data } );
        if ( data != undefined ) {
            this.setState( {
                data: data[ 0 ]
            } )
        }
    }


    click_Clsoe = () => {
        this.setState( {
            data: []
        } )
    }


    render() {
        let { data } = this.state;
        return (
            <Modal style={ [ styles.modal, styles.modal4 ] } position={ "bottom" } isOpen={ data.modalVisible != undefined ? data.modalVisible : false } onClosed={ () => this.click_Clsoe() }>
                <View>
                    <View style={ { flexDirection: 'column', alignItems: "center", marginTop: 10, paddingBottom: 10, borderBottomColor: "#EFEFEF", borderBottomWidth: 1 } }>
                        <Text style={ { fontSize: 16 } }>{ data.title }</Text>
                        <Text note style={ { fontSize: 14 } }>{ data.subTitle }</Text>
                    </View>
                    <View>
                        <View style={ { flexDirection: "row", backgroundColor: colors.appColor, height: 80, margin: 20, borderRadius: 10 } }>
                            <Button
                                transparent
                                style={ { flex: 1, justifyContent: "center", alignSelf: "center", marginBottom: -10 } }
                                onPress={ () => this.props.click_Option1() }>
                                <View style={ { alignSelf: "center", justifyContent: "center", alignItems: "center" } }>
                                    <ImageSVG
                                        size={ 40 }
                                        source={
                                            svgIcon.bottomModel[ data.svgIcon1 ]
                                        }
                                    />
                                    <Text style={ [ FontFamily.ffFiraSansBold, { fontSize: 12, color: "#ffffff" } ] }>{ data.btnTitle1 }</Text>
                                </View>
                            </Button>
                            <View
                                style={ {
                                    flex: 0.02,
                                    height: 50,
                                    width: 1,
                                    alignSelf: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#ffffff"
                                } }
                            />
                            <Button
                                transparent
                                style={ { flex: 1, justifyContent: 'center', alignSelf: "center", marginBottom: -10 } }
                                onPress={ () => this.props.click_Option2() }>
                                <View style={ { alignSelf: "center", justifyContent: "center", alignItems: "center" } }>
                                    <ImageSVG
                                        size={ 45 }
                                        source={
                                            svgIcon.bottomModel[ data.svgIcon2 ]
                                        }
                                    />
                                    <Text style={ [ FontFamily.ffFiraSansBold, { fontSize: 12, color: "#ffffff" } ] }>{ data.btnTitle2 }</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal >
        );
    }
}

const styles = StyleSheet.create( {
    //botom model
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }
} );