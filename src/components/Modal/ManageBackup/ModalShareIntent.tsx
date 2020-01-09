import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import BottomSheet from 'reanimated-bottom-sheet';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


import Colors from "../../../../src/common/Colors";
import Fonts from "../../../../src/common/Fonts";
import Icons from "../../../../src/common/Icons";


export default function ModalShareIntent( props ) {


    const [ arrShareOption, setArrShareOption ] = useState( [
        {
            title: 'Cloud',
            info: 'Store backup in iCloud Drive',
            imageIcon: Icons.manageBackup.PersonalCopy.icloud,
        },
        {
            title: 'Email',
            info: 'Store backup in Google Drive',
            imageIcon: Icons.manageBackup.PersonalCopy.email,
        },
        {
            title: 'Print',
            info: 'Store backup in One Drive',
            imageIcon: Icons.manageBackup.PersonalCopy.print,
        },
    ] );

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
                <View style={ {
                    flex: 0.2, flexDirection: "row", borderBottomWidth: 0.5,
                    borderColor: Colors.borderColor
                } }>
                    <View style={ styles.headerContainer }>
                        <TouchableOpacity
                            style={ styles.headerLeftIconContainer }
                            onPress={ () => {
                                props.navigation.goBack();
                            } }
                        >
                            <View style={ styles.headerLeftIconInnerContainer }>
                                <FontAwesome name="long-arrow-left" color={ Colors.blue } size={ 17 } />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={ styles.modalHeaderTitleView }>
                        <View style={ { marginTop: hp( '1%' ) } }>
                            <Text style={ styles.modalHeaderTitleText }>Personal Copy</Text>
                            <Text style={ styles.modalHeaderInfoText }>Select a source</Text>
                        </View>
                    </View>
                </View>
                <View style={ { flex: 1 } }>
                    <FlatList
                        data={ arrShareOption }
                        renderItem={ ( { item, index } ) => (
                            <TouchableOpacity onPress={ () => props.onPressShare( item.title )
                            } style={ styles.listElements }>
                                <Image
                                    style={ styles.listElementsIconImage }
                                    source={ item.imageIcon }
                                />
                                <View style={ { justifyContent: 'space-between', flex: 1 } }>
                                    <Text style={ styles.listElementsTitle }>{ item.title }</Text>
                                    <Text style={ styles.listElementsInfo } numberOfLines={ 1 }>
                                        { item.info }
                                    </Text>
                                </View>
                                <View style={ styles.listElementIcon }>
                                    <Ionicons
                                        name="ios-arrow-forward"
                                        color={ Colors.textColorGrey }
                                        size={ 15 }
                                        style={ { alignSelf: 'center' } }
                                    />
                                </View>
                            </TouchableOpacity>
                        ) }
                    />
                </View>
            </View >
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
            snapPoints={ [ -50, hp( '90%' ) ] }
            renderContent={ renderShareContents }
            renderHeader={ renderShareHeader }
        />
    )
}

const styles = StyleSheet.create( {
    modalContainer: {
        height: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.blue,
        backgroundColor: Colors.white,
        borderTopColor: Colors.borderColor,
        width: '100%',
        paddingTop: hp( '2%' ),
        paddingBottom: hp( '5%' ),
        // elevation: 10,
        // shadowColor: Colors.borderColor,
        // shadowOpacity: 10,
        // shadowOffset: { width: 0, height: 2 },
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
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    headerContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
        height: 54,
        // backgroundColor: Colors.white,
        // borderBottomColor: Colors.white,
        // borderBottomWidth: 0.5,
    },
    headerLeftIconContainer: {
        height: 54
    },
    headerLeftIconInnerContainer: {
        width: 54,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeaderTitleView: {
        // borderBottomWidth: 1,
        // borderColor: Colors.borderColor,
        alignItems: "center",
        flexDirection: "row",
        paddingRight: 10,
        paddingBottom: hp( "1.5%" ),
        paddingTop: hp( "1%" ),
        marginLeft: 10,
        marginRight: 10,
        marginBottom: hp( "1.5%" )
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: 18,
        fontFamily: Fonts.FiraSansMedium
    },
    modalHeaderInfoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: 12,
        marginTop: 5
    },
    listElements: {
        flexDirection: 'row',
        marginLeft: 20,
        marginRight: 20,
        borderBottomWidth: 0.5,
        borderColor: Colors.borderColor,
        paddingTop: 25,
        paddingBottom: 25,
        paddingLeft: 10,
        alignItems: 'center',
    },
    listElementsTitle: {
        color: Colors.blue,
        fontSize: 13,
        marginLeft: 13,
        fontFamily: Fonts.FiraSansRegular,
    },
    listElementsInfo: {
        color: Colors.textColorGrey,
        fontSize: 11,
        marginLeft: 13,
        marginTop: 5,
        fontFamily: Fonts.FiraSansRegular,
    },
    listElementIcon: {
        paddingRight: 5,
        marginLeft: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listElementsIconImage: {
        resizeMode: 'contain',
        width: 25,
        height: 25,
        alignSelf: 'center',
    },
} );

