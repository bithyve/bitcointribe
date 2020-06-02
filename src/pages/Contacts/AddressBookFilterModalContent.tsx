import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RadioButton from "../../components/RadioButton";

export default function AddressBookFilterModalContent(props) {
    let [TrustedContactFilterOption, setTrustedContactFilterOption] = useState(false);

    return (<View style={styles.modalContentContainer}>
            <View style={styles.modalHeaderTitleView}>  
                <View style={{ flexDirection: 'row', }}>
                    <AppBottomSheetTouchableWrapper onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent:'center'}}>
                        <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                    </AppBottomSheetTouchableWrapper>
                    <View style={{justifyContent:'center'}}>
                        <Text style={styles.modalHeaderTitleText}>{"Apply Filters"}</Text>
                    </View>
                </View>
            </View>
            <View style={{flex:1}}>
                <AppBottomSheetTouchableWrapper onPress={()=>{setTrustedContactFilterOption(!TrustedContactFilterOption)}} style={{ flexDirection:'row', paddingLeft:wp('12%'), paddingRight:wp('7%'), paddingTop:wp('7%'), paddingBottom:wp('7%'), alignItems:'center'}}>
                    <View style={{ flex:1, marginRight:wp('7%') }}>
                        <Text style={styles.TitleText}>My Trusted Contacts <Text style={{...styles.TitleText, fontFamily: Fonts.FiraSansMediumItalic}}>Except</Text></Text>
                        <Text style={styles.infoText}>Display all your contacts except the category you select</Text>
                    </View>
                    <Ionicons
                      name={TrustedContactFilterOption ? "ios-arrow-up" : "ios-arrow-down"}
                      color={Colors.borderColor}
                      size={RFValue(15)}
                      style={{ marginLeft: 'auto', alignSelf:'center' }}
                    />
                </AppBottomSheetTouchableWrapper>
                <View style={{ display: TrustedContactFilterOption ? 'flex' : 'none' }}>
                    <View style={{ flexDirection:'row', paddingLeft:wp('7%'), paddingRight:wp('7%'),  paddingBottom:wp('7%'), alignItems:'center'}}>
                        <AppBottomSheetTouchableWrapper
                            onPress={() => {}}
                            style={{ height: wp('10%'), width: wp('10%'), justifyContent:'center'}}
                        >
                            <RadioButton
                                size={17}
                                color={Colors.lightBlue}
                                borderColor={Colors.borderColor}
                                isChecked={true}
                                onpress={() => {}}
                            />
                        </AppBottomSheetTouchableWrapper>
                        <View style={{ flex:1, }}>
                            <Text style={styles.subTitleText}>People I’m the keeper of</Text>
                            <Text style={styles.subInfoText}>Lorem ipsum dolor sit ametconsectetur adipiscing</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection:'row', paddingLeft:wp('7%'), paddingRight:wp('7%'),  paddingBottom:wp('7%'), alignItems:'center'}}>
                        <AppBottomSheetTouchableWrapper
                            onPress={() => {}}
                            style={{ height: wp('10%'), width: wp('10%'), justifyContent:'center'}}
                        >
                            <RadioButton
                                size={17}
                                color={Colors.lightBlue}
                                borderColor={Colors.borderColor}
                                isChecked={true}
                                onpress={() => {}}
                            />
                        </AppBottomSheetTouchableWrapper>
                        <View style={{ flex:1, }}>
                            <Text style={styles.subTitleText}>People guarding my secrets</Text>
                            <Text style={styles.subInfoText}>Lorem ipsum dolor sit ametconsectetur adipiscing</Text>
                        </View>
                    </View>
                </View>
                <View style={{height: 1, backgroundColor: Colors.borderColor, marginLeft: wp('4%'), marginRight: wp('4%')}} />
                <AppBottomSheetTouchableWrapper style={{ flexDirection:'row', paddingLeft:wp('12%'), paddingRight:wp('7%'), paddingTop:wp('7%'), paddingBottom:wp('7%'), alignItems:'center'}}>
                    <View style={{ flex:1, marginRight:wp('7%') }}>
                        <Text style={styles.TitleText}><Text style={{...styles.TitleText, fontFamily: Fonts.FiraSansMediumItalic}}>Only</Text> Display</Text>
                        <Text style={styles.infoText}>Display only the categories you select</Text>
                    </View>
                    <Ionicons
                      name={TrustedContactFilterOption ? "ios-arrow-up" : "ios-arrow-down"}
                      color={Colors.borderColor}
                      size={RFValue(15)}
                      style={{ marginLeft: 'auto', alignSelf:'center' }}
                    />
                </AppBottomSheetTouchableWrapper>
                <View style={{height: 1, backgroundColor: Colors.borderColor, marginLeft: wp('4%'), marginRight: wp('4%')}} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
	modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.backgroundColor1,
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
        fontFamily: Fonts.FiraSansRegular
    },
    TitleText: {
        color: Colors.blue,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular
    },
    infoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11),
        fontFamily: Fonts.FiraSansRegular,
        marginTop: 5
    },
    subTitleText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(12),
        fontFamily: Fonts.FiraSansRegular
    },
    subInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular,
        marginTop: 5
    }
})