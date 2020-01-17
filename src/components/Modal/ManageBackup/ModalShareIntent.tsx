import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, AsyncStorage } from "react-native";
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
import Singleton from "../../../common/Singleton";
import ModalHeader from '../../ModalHeader';

export default function ModalShareIntent( props ) {
    const propsData = props.data;

    const [ flagRefreshing, setFagRefreshing ] = useState( false );
    const [ pdfShareDetails, setPdfShareDetails ] = useState( {} )
    const [ arrShareOption, setArrShareOption ] = useState( [
        {
            id: 1,
            title: 'Send pdf on email',
            type: "Email",
            flagShare: false,
            info: 'The pdf document is password protected with the answer to your secret question',
            imageIcon: Icons.manageBackup.PersonalCopy.email,
        },
        {
            id: 2,
            title: 'Print a copy',
            type: "Print",
            flagShare: false,
            info: 'Keep the printed copy (6 pages) safe',
            imageIcon: Icons.manageBackup.PersonalCopy.print,
        },
        {
            id: 3,
            title: 'Store/ send pdf using other options',
            type: "Other",
            flagShare: false,
            info: 'The pdf document is password protected with the answer to your secret question',
            imageIcon: Icons.manageBackup.PersonalCopy.icloud,
        },
    ] );

    const [
        refShareIntentBottomSheet,
        setRefShareIntentBottomSheet,
    ] = useState( React.createRef() );

    useEffect( () => {
        let singleton = Singleton.getInstance();
        let selectedPdfDetails = singleton.getSeletedPdfDetails();
        let shareItem = selectedPdfDetails != undefined ? props.data.item.type == "copy1" ? selectedPdfDetails[ 4 ] : selectedPdfDetails[ 3 ] : null;
        if ( shareItem != null ) {
            let mediaShare = shareItem.personalInfo.shareDetails;
            if ( mediaShare != {} )
                for ( var i = 0; i < arrShareOption.length; i++ )
                    if ( arrShareOption[ i ].type === mediaShare.type ) {
                        arrShareOption[ i ].flagShare = true;
                        setFagRefreshing( true );
                        break;
                    }
        }
        refShareIntentBottomSheet.current.snapTo( props.data.snapTop );
    }, [ props ] );


    const onShare = (item)=>{
        props.onPressShare( item.type );
        console.log("props.data",propsData, props.data)
        if(props.data.item.type=="copy1"){
            AsyncStorage.setItem("personalCopy1AutoHighlightFlags", 'true')
        }
        else if(props.data.item.type=="copy2"){
            AsyncStorage.setItem("personalCopy2AutoHighlightFlags", 'true')
        }
    }

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
                                props.onPressHandle();
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
                        // onRefresh={ onRefresh }  
                        refreshing={ flagRefreshing }
                        renderItem={ ( { item, index } ) => (
                            <TouchableOpacity
                                onPress={ () => onShare(item) }
                                disabled={ item.flagShare }
                                style={ [ styles.listElements, item.flagShare == true ? { backgroundColor: "#ccc", borderRadius: 5 } : null ] }>
                                <Image
                                    style={ styles.listElementsIconImage }
                                    source={ item.imageIcon }
                                />
                                <View style={ { justifyContent: 'space-between', flex: 1 } }>
                                    <Text style={ styles.listElementsTitle }>{ item.title }</Text>
                                    <Text style={ styles.listElementsInfo }>
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
                        keyExtractor={ ( item, index ) => index.toString() }
                    />
                </View>
            </View>
        );
    };

    const renderShareHeader = () => {
        return (
            <ModalHeader onPressHeader={() => props.onPressHandle()}/>
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
        backgroundColor: Colors.white,
        width: '100%',
        paddingBottom: hp( '5%' ),
    },
    headerContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
        height: 54,
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

