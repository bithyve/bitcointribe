import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import BottomSheet from 'reanimated-bottom-sheet';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import Colors from "../../../../src/common/Colors";


export default function ModalShareIntent( props ) {


    const [
        refShareIntentBottomSheet,
        setRefShareIntentBottomSheet,
    ] = useState( React.createRef() );



    useEffect( () => {
        console.log( { props } );
        refShareIntentBottomSheet.current.snapTo( props.data.snapTop );
    }, [ props ] );

    const renderShareContents = () => {
        return (
            <View style={ [ styles.modalContainer ] }>
                <TouchableOpacity activeOpacity={ 10 } style={ { flex: 1, alignItems: "center" } } onPress={ () => props.onPressHandle() } >
                    <Image
                        style={ styles.mediaIcon }
                        source={ require( '../../../assets/images/icons/icon_cloud.png' ) }
                    />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={ 10 } style={ { flex: 1, alignItems: "center" } } onPress={ () => props.onPressHandle() } >
                    <Image
                        style={ styles.mediaIcon }
                        source={ require( '../../../assets/images/icons/gmail.png' ) }
                    />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={ 10 } style={ { flex: 1, alignItems: "center" } } onPress={ () => props.onPressHandle() } >
                    <Image
                        style={ styles.mediaIcon }
                        source={ require( '../../../assets/images/icons/print.png' ) }
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const renderShareHeader = () => {
        return (
            <TouchableOpacity activeOpacity={ 10 } onPress={ () => props.onPressHandle() } style={ { ...styles.modalHeader, borderColor: props.borderColor ? props.borderColor : Colors.borderColor, backgroundColor: props.headerColor ? props.headerColor : Colors.white, } }>
                <View style={ styles.modalHeaderHandle } />
            </TouchableOpacity>

        );
    };
    return (
        <BottomSheet
            enabledInnerScrolling={ true }
            ref={ refShareIntentBottomSheet }
            snapPoints={ [ -50, hp( '20%' ) ] }
            renderContent={ renderShareContents }
            renderHeader={ renderShareHeader }
        />
    )
}

const styles = StyleSheet.create( {
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.blue,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.blue,
        borderTopColor: Colors.borderColor,
        alignSelf: 'center',
        flexDirection: "row",
        width: '100%',
        paddingTop: hp( '2%' ),
        paddingBottom: hp( '5%' ),
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    modalHeaderHandle: {
        width: 50,
        height: 5,
        backgroundColor: Colors.borderColor,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 15
    },
    modalHeader: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        height: 25,
        width: '80%',
        alignSelf: 'center',
    },
    mediaIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    }
} );

