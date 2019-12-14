import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    ImageBackground,
    CheckBox
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RadioButton from "../components/RadioButton";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";

export default function SelectedContactFromAddressBook(props) {
    const [isAddToTrustedContact, setIsAddToTrustedContact] = useState(false);

    return (<ScrollView style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', }}>
                <TouchableOpacity onPress={() => props.onPressBack()} style={{ height: 30, width: 30, }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.modalHeaderTitleText}>Pamela Aalto</Text>
                    <Text numberOfLines={2} style={styles.modalHeaderInfoText}>{props.pageInfo}Lorem ipsum dolor sit amet, consectetur{"\n"}adipiscing elit, sed do eiusmod tempor</Text>
                </View>
            </View>
        </View>
        <View style={{ flex: 1, paddingBottom:hp('3%') }}>
            <ImageBackground source={require('../assets/images/icons/iPhone-QR.png')} imageStyle={{width: wp('100%'),
        height: wp('100%'),
        borderRadius: 20,}} style={styles.qrModalImage} >
                <View style={{ flexDirection: 'row', paddingTop: 12, paddingRight: 12, paddingLeft: 12, width: '100%' }}>
                    <View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderTopWidth: 1 }} />
                    <View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
                </View>
                <View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 12, paddingRight: 12, paddingLeft: 12, width: '100%', }}>
                    <View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
                    <View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
                </View>
            </ImageBackground>
            <View style={{ marginTop: hp('2%'), marginLeft: 50, alignItems: 'center', flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => { setIsAddToTrustedContact(!isAddToTrustedContact) }} style={{ height: 20, width: 20, borderWidth: 1, borderColor: isAddToTrustedContact ? Colors.blue : Colors.borderColor, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                    {isAddToTrustedContact ?
                        <Entypo size={15} name={"check"} color={Colors.blue} /> :
                        null
                    }
                </TouchableOpacity>
                <Text style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(12, 812),
                    fontFamily: Fonts.FiraSansMedium, marginLeft: 10
                }}>Add as Trusted Contact</Text>
            </View>
            <View style={{ marginTop: hp('3%'),marginBottom: hp('3%'), marginLeft: 50, }}>
                <Text style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(11, 812),
                    fontFamily: Fonts.FiraSansMedium,
                }}>Lorem ipsum dolor sit amet, consectetur{"\n"}adipiscing elit, sed do eiusmod tempor</Text>
            </View>
            <TouchableOpacity onPress={()=>props.onPressProceed()} style={{backgroundColor:Colors.blue, width:wp('50%'),  height:wp('12%'), justifyContent:'center', alignItems:'center', borderRadius:10, alignSelf:'center', }}>
                <Text style={{
                    color: Colors.white,
                    fontSize: RFValue(13, 812),
                    fontFamily: Fonts.FiraSansMedium,
                }}>
                    Proceed
                </Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%'
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 10,
        paddingBottom: hp('3%'),
        paddingTop: hp('2%'),
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 15,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    modalHeaderInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11, 812),
        fontFamily: Fonts.FiraSansRegular,
        marginTop: hp('0.7%'),
        flexWrap: 'wrap'
    },
    qrModalImage: {
        width: wp('100%'),
        height: wp('100%'),
        borderRadius: 20,
    },
})