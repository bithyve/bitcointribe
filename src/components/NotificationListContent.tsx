import React, { useState } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome"
import Ionicons from "react-native-vector-icons/Ionicons";
import BottomInfoBox from './BottomInfoBox';
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";
import { ScrollView } from 'react-native-gesture-handler';

export default function NotificationListContent(props) {

    return (<ScrollView style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', }}>
                <AppBottomSheetTouchableWrapper onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent:'center'}}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </AppBottomSheetTouchableWrapper>
                <View style={{justifyContent:'center'}}>
                    <Text style={styles.modalHeaderTitleText}>{"Notifications"}</Text>
                </View>
            </View>
        </View>
        <View style={{ flex: 1 }}>
            {props.NotificationData.map((value, index)=>{
                return <AppBottomSheetTouchableWrapper onPress={()=>props.onNotificationClicked(value)} style={{paddingLeft:wp('7%'), paddingRight:wp('4%'), borderBottomWidth:1, borderBottomColor:Colors.borderColor, paddingBottom:wp('4%'), paddingTop:wp('4%'), backgroundColor: value.read ? Colors.white : Colors.lightBlue}}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'row', alignItems:'center'}}>
                            <Image source={value.type=="release" ? require("../assets/images/icons/icon_hexa.png") : require("../assets/images/icons/recieve.png")} style={{width:wp('8%'), height:wp('8%'), marginRight:wp('2%')}} />
                            <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular}}>{value.title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginLeft:'auto', alignItems:'center'}}>
                            <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(11), fontFamily: Fonts.FiraSansRegular, marginRight:wp('5%')}}>{value.time}</Text>
                            {value.isMandatory ?<FontAwesome name="star" color={Colors.blue} size={17} /> : <View style={{width:17}} />}
                        </View>
                    </View>
                    <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(11), fontFamily: Fonts.FiraSansRegular, paddingTop:wp('2%'), marginLeft:3}}>{value.info}</Text>
                </AppBottomSheetTouchableWrapper>
            })}
        </View>
    </ScrollView>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 10,
        paddingBottom: hp('2%'),
        paddingTop: hp('2%'),
        marginLeft: wp('4%'),
        marginRight: wp('4%'),
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansMedium
    },

})