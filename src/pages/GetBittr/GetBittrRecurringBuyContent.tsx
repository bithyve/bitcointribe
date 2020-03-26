import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { AppBottomSheetTouchableWrapper } from "../../components/AppBottomSheetTouchableWrapper";
import RadioButton from '../../components/RadioButton';
import { ScrollView } from 'react-native-gesture-handler';

export default function GetBittrRecurringBuyContents(props) {
    const [ addData, setAddData ] = useState( [
		{
			title: 'Recurring Buy', image: require('../../assets/images/icons/icon_getbitter.png'), info: 'Setup a recurring payment to stack sats',
		},
		{
			title: `Credit Card`, image: require( '../../assets/images/icons/icon_fastbicoin.png' ), info: 'Buy bitcoins using credit card',
		},
		{
			title: 'Voucher', image: require( '../../assets/images/icons/icon_addcontact.png' ), info: 'Purchase a voucher or use a voucher you own',
		},
		{
			title: 'Lorem Ipsum', image: require( '../../assets/images/icons/icon_addaccount.png' ), info: 'Lorem ipsum dolor sit amet, consecteture adipiscing',
		},
    ] )
    
    const onContactSelect =(type)=>{

    }
  return (
    <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppBottomSheetTouchableWrapper
                    onPress={() => props.onPressBack()}
                    style={{ height: 30, width: 30, justifyContent: "center" }}
                >
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </AppBottomSheetTouchableWrapper>
                <View style={{flex:1}}>
                    <Text style={styles.modalHeaderTitleText}>Recurring Buy</Text>
                    <Text style={{...styles.pageInfoText, marginRight: 15}}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae rem porro ducimus repudiandae alias
                    </Text>
                </View>
            </View>
        </View>
        <ScrollView style={{flex:1}}>
            <View style={{marginLeft:wp('13%'), marginRight:wp('13%'), marginTop:20, marginBottom:20}}>
                <Text style={styles.pageTitleText}>Choose a service</Text>
                <Text style={{...styles.pageInfoText, fontSize:RFValue(10)}}>
                    Lorem ipsum dolor sit amet consectetur adipisicing
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                <AppBottomSheetTouchableWrapper onPress={()=>{}} style={{marginRight:wp('3%'), justifyContent:'center', alignItems:'center'}} >
                    <RadioButton
                        size={17}
                        color={Colors.lightBlue}
                        borderColor={Colors.borderColor}
                        isChecked={true}
                        onpress={() => onContactSelect(1)}
                    />
                </AppBottomSheetTouchableWrapper>
                <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                    <Image source={require("../../assets/images/icons/fastbitcoin_dark.png")} style={{width:wp('7%'), height:wp("7%"), }} />
                </View>
                <View style={{flex:1, }}>
                    <Text style={styles.pageSubTitleText}>Fast Bitcoin</Text>
                    <Text style={styles.pageInfoText}>
                        Lorem ipsum dolor sit amet conse ctetur adipisicing elit.
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                <AppBottomSheetTouchableWrapper onPress={()=>{}} style={{marginRight:wp('3%'), justifyContent:'center', alignItems:'center'}} >
                    <RadioButton
                        size={17}
                        color={Colors.lightBlue}
                        borderColor={Colors.borderColor}
                        isChecked={true}
                        onpress={() => onContactSelect(1)}
                    />
                </AppBottomSheetTouchableWrapper>
                <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                    <Image source={require("../../assets/images/icons/icon_getbitter.png")} style={{width:wp('7%'), height:wp("7%"), }} />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.pageSubTitleText}>Get Bittr</Text>
                    <Text style={styles.pageInfoText}>
                        Lorem ipsum dolor sit amet consec tetur adipisicing elit.
                    </Text>
                </View>
            </View>
            <View style={{marginLeft:20, marginRight:20, backgroundColor:Colors.borderColor, height:1}}/>

            <View style={{marginLeft:wp('13%'), marginRight:wp('13%'), marginTop:20, marginBottom:20}}>
                <Text style={styles.pageTitleText}>Choose an account</Text>
                <Text style={{...styles.pageInfoText, fontSize:RFValue(10)}}>
                    Lorem ipsum dolor sit amet consectetur adipisicing
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                <AppBottomSheetTouchableWrapper onPress={()=>{}} style={{marginRight:wp('3%'), justifyContent:'center', alignItems:'center'}} >
                    <RadioButton
                        size={17}
                        color={Colors.lightBlue}
                        borderColor={Colors.borderColor}
                        isChecked={true}
                        onpress={() => onContactSelect(1)}
                    />
                </AppBottomSheetTouchableWrapper>
                <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                    <Image source={require("../../assets/images/icons/icon_test.png")} style={{width:wp('7%'), height:wp("7%"), }} />
                </View>
                <View style={{flex:1, }}>
                    <Text style={styles.pageSubTitleText}>Test Account</Text>
                    <Text style={styles.pageInfoText}>
                        Lorem ipsum dolor sit amet conse ctetur adipisicing elit.
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                <AppBottomSheetTouchableWrapper onPress={()=>{}} style={{marginRight:wp('3%'), justifyContent:'center', alignItems:'center'}} >
                    <RadioButton
                        size={17}
                        color={Colors.lightBlue}
                        borderColor={Colors.borderColor}
                        isChecked={true}
                        onpress={() => onContactSelect(1)}
                    />
                </AppBottomSheetTouchableWrapper>
                <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                    <Image source={require("../../assets/images/icons/icon_regular.png")} style={{width:wp('7%'), height:wp("7%"), }} />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.pageSubTitleText}>Regular Account</Text>
                    <Text style={styles.pageInfoText}>
                        Lorem ipsum dolor sit amet consec tetur adipisicing elit.
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                <AppBottomSheetTouchableWrapper onPress={()=>{}} style={{marginRight:wp('3%'), justifyContent:'center', alignItems:'center'}} >
                    <RadioButton
                        size={17}
                        color={Colors.lightBlue}
                        borderColor={Colors.borderColor}
                        isChecked={true}
                        onpress={() => onContactSelect(1)}
                    />
                </AppBottomSheetTouchableWrapper>
                <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                    <Image source={require("../../assets/images/icons/icon_secureaccount.png")} style={{width:wp('7%'), height:wp("7%"), }} />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.pageSubTitleText}>Savings Account</Text>
                    <Text style={styles.pageInfoText}>
                        Lorem ipsum dolor sit amet consec tetur adipisicing elit.
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                    <Image source={require("../../assets/images/icons/icon_addaccount.png")} style={{width:wp('7%'), height:wp("7%"), }} />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.pageSubTitleText}>Add Account</Text>
                    <Text style={styles.pageInfoText}>
                        Add account to your wallet, select from options
                    </Text>
                </View>
            </View>
        </ScrollView>
        <View style={{ paddingBottom:wp('8%'), paddingLeft:wp("5%"), paddingTop:wp("5%")}}>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onPressProceed()} style={{height:wp('13%'), width:wp('50%'), justifyContent:'center', alignItems:'center', backgroundColor:Colors.blue, borderRadius:10}} >
                <Text style={{color:Colors.white, fontFamily:Fonts.FiraSansMedium, fontSize:RFValue(13)}}>Proceed</Text>
            </AppBottomSheetTouchableWrapper>
        </View>
    </View>
  );
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        width: '100%',
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
        marginRight: 20,
        marginBottom: 15,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansRegular,
    },
    pageTitleText: {
        color: Colors.blue,
        fontSize: RFValue(14),
        fontFamily: Fonts.FiraSansRegular,
    },
    pageSubTitleText: {
        color: Colors.blue,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular,
    },
    pageInfoText: {
        marginTop:5,
        color: Colors.textColorGrey,
        fontSize: RFValue(11),
        fontFamily: Fonts.FiraSansRegular,
    },
    separatorView: {
        marginLeft: 15,
        marginRight: 15,
        height: 2,
        backgroundColor: Colors.backgroundColor
    },
    modalElementInfoView: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: 'center'
    },
    addModalView: {
        backgroundColor: Colors.white,
        padding: 7,
        flexDirection: 'row',
        display: 'flex',
        // marginTop: 10,
        justifyContent: "space-between"
    },
    addModalTitleText: {
        color: Colors.blue,
        fontSize: RFValue( 14 ),
    },
    addModalInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue( 11 ),
    },
});
