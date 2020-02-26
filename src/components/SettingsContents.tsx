import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    AsyncStorage
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import ToggleSwitch from './ToggleSwitch';
import Ionicons from "react-native-vector-icons/Ionicons";
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";
import { FlatList } from 'react-native-gesture-handler';

export default function SettingsContents(props) {
    const [OpenCloseModal, setOpenCloseModal] = useState(false);
    const [currencycode, setCurrencycode] = useState('');
    const [switchOn, setSwitchOn] = useState(false);
    const [currencyList, setCurrencyList] = useState([
        {
            code:'USD',
            symbol:'$'
        },
        {
            code:'EUR',
            symbol:'€'
        },
        {
            code:'EGP',
            symbol:'£'
        },
        {
            code:'INR',
            symbol:'₹'
        },
    ]);
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState({code:'', symbol:''});

    const setCurrencyCodeToAsync = async(item) =>{
        setSelectedCurrencyCode(item);
        setOpenCloseModal(false);
        props.onPressManagePin('ManageCurrency', item.code);
        await AsyncStorage.setItem("currencyCode", item.code);
    }

    useEffect(()=>{
        setSelectedCurrencyCode(currencyList[currencyList.findIndex((value)=>value.code == props.currencyCode)]);
    }, [])
    
    return (<View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                {/* <AppBottomSheetTouchableWrapper onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </AppBottomSheetTouchableWrapper> */}
                <Text style={styles.modalHeaderTitleText}>{"Settings"}</Text>
            </View>
        </View>
        <View style={{ flex: 1 }}>
            {/* <View style={styles.selectedContactsView}>
                <Image source={require('../assets/images/icons/icon_secrets.png')} style={{ width: wp('7%'), height: wp('7%'), resizeMode: 'contain', marginLeft: 0, marginRight: 10 }} />
                <View style={{ justifyContent: 'center', marginRight: 10 }}>
                    <Text style={styles.titleText}>Jumble Keyboard</Text>
                    <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur</Text>
                </View>
                <View style={{ marginLeft: 'auto' }}>
                    <ToggleSwitch isNotImage={true} toggleColor={Colors.lightBlue} toggleCircleColor={Colors.blue} onpress={() => { setSwitchOn(!switchOn); }} toggle={switchOn} />
                </View>
            </View> */}
            <AppBottomSheetTouchableWrapper onPress={()=>props.onPressManagePin('ManagePin', currencycode)} style={{ ...styles.selectedContactsView, marginBottom: hp('3%') }}>
            <Image source={require('../assets/images/icons/icon_secrets.png')} style={{ width: wp('7%'), height: wp('7%'), resizeMode: 'contain', marginLeft: 0, marginRight: 10 }} />
                <View>
                    <Text style={styles.titleText}>Manage Passcode</Text>
                    <Text style={styles.infoText}>Change your passcode</Text>
                </View>
                <View style={{width: wp('17%'), justifyContent:'center', alignItems:'center', marginLeft: 'auto'}}>
                <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{ marginLeft: 'auto', alignSelf: 'center' }}
                />
                </View>
            </AppBottomSheetTouchableWrapper>
            <View style={{ ...styles.selectedContactsView, marginBottom: hp('3%') }}>
            <Image source={require('../assets/images/icons/icon_secrets.png')} style={{ width: wp('7%'), height: wp('7%'), resizeMode: 'contain', marginLeft: 0, marginRight: 10 }} />
                <View>
                    <Text style={styles.titleText}>Manage Currency</Text>
                    <Text style={styles.infoText}>Choose your Currency</Text>
                </View>
                <View style={{width: wp('30%'), justifyContent:'center', alignItems:'center', marginLeft: 'auto', }}>
                <View style={{position:'relative',}}>
                    <AppBottomSheetTouchableWrapper onPress={()=>{
                        setOpenCloseModal(!OpenCloseModal);
                    }} style={{flexDirection:'row', height:wp('8%'), width:wp('30%'), alignItems:'center', paddingLeft:wp('2%'), paddingRight:wp('2%'), borderRadius:5, borderColor:Colors.blue, borderWidth:1,backgroundColor:Colors.white}}>
                        <Text style={styles.infoText}>{selectedCurrencyCode.code ? selectedCurrencyCode.code : ''}</Text>
                        <Text style={{...styles.infoText, marginLeft:'auto'}}>{selectedCurrencyCode.code ? selectedCurrencyCode.symbol : ''}</Text>
                    </AppBottomSheetTouchableWrapper>
                    {OpenCloseModal ? <View style={{position:'absolute', marginTop:wp('9%'), height:hp("10%"), borderRadius:5, borderColor:Colors.blue, borderWidth:1, backgroundColor:Colors.white, width:wp('30%'),}}>
                        <FlatList
                            data={currencyList}
                            renderItem={({item, index})=>{
                                return <AppBottomSheetTouchableWrapper onPress={()=>setCurrencyCodeToAsync(item)} style={{flexDirection:'row', height:wp('8%'), width:wp('30%'), alignItems:'center', paddingLeft:wp('2%'), paddingRight:wp('2%')}}>
                                    <Text style={styles.infoText}>{item.code}</Text>
                                    <Text style={{...styles.infoText, marginLeft:'auto'}}>{item.symbol}</Text>
                                </AppBottomSheetTouchableWrapper>
                            }}
                            />
                        </View>
                    : null
                    }
                </View>
                </View>
            </View>
        </View>
        <View style={{
            flexDirection: 'row', elevation: 10,
            shadowColor: Colors.borderColor,
            shadowOpacity: 10,
            shadowOffset: { width: 2, height: 2 },
            backgroundColor: Colors.white,
            justifyContent: 'space-around',
            height: 45,
            alignItems: 'center',
            marginLeft: 10,
            marginRight: 10,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: hp('1%'),
            marginBottom: hp('6%'),
            borderRadius: 10
        }}>
            <Text style={styles.addModalTitleText}>FAQs</Text>
            <View style={{ height: 20, width: 1, backgroundColor: Colors.borderColor }} />
            <Text style={styles.addModalTitleText}>Terms and conditions</Text>
            <View style={{ height: 20, width: 1, backgroundColor: Colors.borderColor }} />
            <Text style={styles.addModalTitleText}>Privacy Policy</Text>
        </View>
    </View>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        width: '100%'
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 10,
        paddingBottom: 15,
        paddingTop: 10,
        marginLeft: 20,
        marginBottom: 15,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansMedium
    },
    modalContentView: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactView: {
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 20,
    },
    contactText: {
        marginLeft: 10,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular
    },
    contactIndexText: {
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular
    },
    contactIndexView: {
        flex: 0.5,
        height: '100%',
        justifyContent: 'space-evenly'
    },
    selectedContactsView: {
        marginLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 20,
        borderBottomColor:Colors.borderColor,
        borderBottomWidth:1
    },
    titleText: {
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.blue
    },
    infoText: {
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.textColorGrey,
        marginTop: 5
    },
    shareButtonView: {
        height: wp('8%'),
        width: wp('15%'),
        backgroundColor: Colors.backgroundColor,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 5,
        marginLeft: 'auto',
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareButtonText: {
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.textColorGrey
    },
    pageTitle: {
        marginLeft: 30,
        color: Colors.blue,
        fontSize: RFValue(14),
        fontFamily: Fonts.FiraSansRegular
    },
    pageInfoText: {
        marginLeft: 30,
        color: Colors.textColorGrey,
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular
    },
    addModalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(14),
    },
})