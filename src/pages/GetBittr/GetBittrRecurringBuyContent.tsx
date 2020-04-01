import React, {useState, useEffect,} from 'react';
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
import {
    TEST_ACCOUNT,
    REGULAR_ACCOUNT,
    SECURE_ACCOUNT,
  } from '../../common/constants/serviceTypes';
import { fetchAddress } from '../../store/actions/accounts';
import { useDispatch, useSelector } from 'react-redux';
import { withNavigation } from "react-navigation";

function GetBittrRecurringBuyContents(props) {
    const [serviceData, setServiceData] = useState([
        // {
        //     title:"Fast Bitcoin",
        //     image:require("../../assets/images/icons/fastbitcoin_dark.png"),
        //     isSelected:false,
        //     info:"Lorem ipsum dolor sit amet consec tetur adipisicing elit."
        // },
        {
            title:"Get Bittr",
            image:require("../../assets/images/icons/icon_getbitter.png"),
            isSelected:false,
            info:"Lorem ipsum dolor sit amet consec tetur adipisicing elit."
        }
    ]);
    const [accountData, setAccountData] = useState([
        {
            title:"Regular Account",
            image:require("../../assets/images/icons/icon_regular.png"),
            isSelected:false,
            info:"Lorem ipsum dolor sit amet consec tetur adipisicing elit.",
            type:REGULAR_ACCOUNT
        },
        {
            title:"Savings Account",
            image:require("../../assets/images/icons/icon_secureaccount.png"),
            isSelected:false,
            info:"Lorem ipsum dolor sit amet consec tetur adipisicing elit.",
            type:SECURE_ACCOUNT
        }
    ])
    const [selectedService, setSelectedService] =useState({
        title:"Get Bittr",
        image:require("../../assets/images/icons/icon_getbitter.png"),
        isSelected:false,
        info:"Lorem ipsum dolor sit amet consec tetur adipisicing elit."
    });
    const [selectedAccount, setSelectedAccount] =useState({
        title:"Regular Account",
        image:require("../../assets/images/icons/icon_regular.png"),
        isSelected:false,
        info:"Lorem ipsum dolor sit amet consec tetur adipisicing elit.",
        type:REGULAR_ACCOUNT
    });
    const { loading, service } = useSelector(
        state => state.accounts[selectedAccount.type],
      );
    let { receivingAddress } = selectedAccount.type === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
    const dispatch = useDispatch();
    useEffect(() => {
        if (!receivingAddress) dispatch(fetchAddress(selectedAccount.type));
    },[selectedAccount.type, service]);

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
                {serviceData.map((item)=>{
                    return <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                    <AppBottomSheetTouchableWrapper onPress={()=>{setSelectedService(item)}} style={{marginRight:wp('3%'), justifyContent:'center', alignItems:'center'}} >
                        <RadioButton
                            size={17}
                            color={Colors.lightBlue}
                            borderColor={Colors.borderColor}
                            isChecked={selectedService.title && item.title==selectedService.title ? true : false}
                            onpress={() => {setSelectedService(item)}}
                        />
                    </AppBottomSheetTouchableWrapper>
                    <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                        <Image source={item.image} style={{width:wp('7%'), height:wp("7%"), }} />
                    </View>
                    <View style={{flex:1, }}>
                        <Text style={styles.pageSubTitleText}>{item.title}</Text>
                        <Text style={styles.pageInfoText}>{item.info}</Text>
                    </View>
                </View>
                })}
                <View style={{marginLeft:20, marginRight:20, backgroundColor:Colors.borderColor, height:1}}/>

                <View style={{marginLeft:wp('13%'), marginRight:wp('13%'), marginTop:20, marginBottom:20}}>
                    <Text style={styles.pageTitleText}>Choose an account</Text>
                    <Text style={{...styles.pageInfoText, fontSize:RFValue(10)}}>
                        Lorem ipsum dolor sit amet consectetur adipisicing
                    </Text>
                </View>
                {accountData.map((item)=>{
                    return <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                    <AppBottomSheetTouchableWrapper onPress={()=>{setSelectedAccount(item)}} style={{marginRight:wp('3%'), justifyContent:'center', alignItems:'center'}} >
                        <RadioButton
                            size={17}
                            color={Colors.lightBlue}
                            borderColor={Colors.borderColor}
                            isChecked={selectedAccount.title && item.title==selectedAccount.title ? true : false}
                            onpress={() => setSelectedAccount(item)}
                        />
                    </AppBottomSheetTouchableWrapper>
                    <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                        <Image source={item.image} style={{width:wp('7%'), height:wp("7%"), }} />
                    </View>
                    <View style={{flex:1, }}>
                        <Text style={styles.pageSubTitleText}>{item.title}</Text>
                        <Text style={styles.pageInfoText}>{item.info}</Text>
                    </View>
                </View>
                })}
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
                <AppBottomSheetTouchableWrapper onPress={()=>{props.navigation.navigate('SignUpInfo', {address: receivingAddress, selectedAccount: selectedAccount});}} style={{height:wp('13%'), width:wp('50%'), justifyContent:'center', alignItems:'center', backgroundColor:Colors.blue, borderRadius:10}} >
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
});

export default withNavigation(GetBittrRecurringBuyContents);