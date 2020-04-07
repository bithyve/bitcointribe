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
import {
    TEST_ACCOUNT,
    REGULAR_ACCOUNT,
    SECURE_ACCOUNT,
  } from '../../common/constants/serviceTypes';
import { fetchAddress } from '../../store/actions/accounts';
import { useDispatch, useSelector } from 'react-redux';
import { withNavigation } from "react-navigation";
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from "react-native-vector-icons/Ionicons";

function GetBittrRecurringBuyContents(props) {
    const [isVisibleList, setIsVisibleList] = useState(false);
    const [accountData, setAccountData] = useState([
        {
            title:"Regular Account",
            image:require("../../assets/images/icons/icon_regular.png"),
            isSelected:false,
            info:"Lorem ipsum dolor sit amet consec",
            type:REGULAR_ACCOUNT
        },
        {
            title:"Savings Account",
            image:require("../../assets/images/icons/icon_secureaccount.png"),
            isSelected:false,
            info:"Lorem ipsum dolor sit amet consec",
            type:SECURE_ACCOUNT
        }
    ])
    const [selectedAccount, setSelectedAccount] =useState({
        title:"Regular Account",
        image:require("../../assets/images/icons/icon_regular.png"),
        isSelected:false,
        info:"Lorem ipsum dolor sit amet consec",
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
            <ScrollView>
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
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                        </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('10%'), marginRight:wp('10%'), marginBottom:wp('4%'), marginTop:wp('4%')}}>
                    <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                        <Image source={require("../../assets/images/icons/icon_getbitter.png")} style={{width:wp('7%'), height:wp("7%"), }} />
                    </View>
                    <View style={{flex:1, }}>
                        <Text style={styles.pageSubTitleText}>{'GetBitrr'}</Text>
                        <Text style={styles.pageInfoText}>{'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed'}</Text>
                    </View>
                </View>
            </View>
            <View style={{marginLeft:wp('13%'), marginRight:wp('10%'), marginTop:wp('3%'), marginBottom:wp('2%')}}>
                <Text style={styles.pageTitleText}>Choose an existing account</Text>
                <Text style={{...styles.pageInfoText, fontSize:RFValue(10)}}>
                    Lorem ipsum dolor sit amet consectetur adipisicing
                </Text>
            </View>
            <AppBottomSheetTouchableWrapper onPress={()=>{setIsVisibleList(true)}} style={{ flexDirection: 'row', alignItems: 'center', marginLeft:wp('13%'), marginRight:wp('10%'), marginBottom:wp('5%'), borderRadius:10, borderWidth:1, borderColor:Colors.borderColor, padding:wp('3%'), marginTop:wp('5%') }}>
                <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                    <Image source={selectedAccount.image} style={{width:wp('7%'), height:wp("7%"), }} />
                </View>
                <View style={{flex:1, }}>
                    <Text style={styles.pageSubTitleText}>{selectedAccount.title}</Text>
                    <Text style={styles.pageInfoText}>{selectedAccount.info}</Text>
                </View>
                <Ionicons
                    name={isVisibleList ? "ios-arrow-up" : "ios-arrow-down"}
                    color={Colors.borderColor}
                    size={RFValue(16)}
                    style={{ alignSelf: 'center' }}
                />  
            </AppBottomSheetTouchableWrapper>
            <View style={{ position:'relative', }}>
            <View style={{ marginLeft:wp('13%'), marginRight:wp('10%'), backgroundColor:Colors.borderColor, height:1}}/>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop:wp('5%'), marginLeft:wp('13%'), marginRight:wp('13%'), marginBottom:wp('5%')}}>
                    <View style={{flex:1}}>
                        <Text style={styles.pageSubTitleText}>Or Create a New Account</Text>
                        <Text style={styles.pageInfoText}>
                            Create a new account to link to GetBittr
                        </Text>
                    </View>
                    <Ionicons
                        name={"ios-arrow-forward"}
                        color={Colors.borderColor}
                        size={RFValue(16)}
                        style={{ alignSelf: 'center' }}
                    />  
                </View>
                { isVisibleList?
                <View style={{ overflow:'hidden', marginLeft:wp('13%'), marginRight:wp('10%'), position:'absolute', backgroundColor:Colors.white, zIndex:999, width:wp('77%'), borderWidth:1, borderColor:Colors.borderColor, borderRadius:10 }}>
                    {accountData.map((item)=>{
                        return <AppBottomSheetTouchableWrapper onPress={()=>{setSelectedAccount(item); setIsVisibleList(false)}} style={{ flexDirection: 'row', alignItems: 'center', padding:wp('3.5%'), backgroundColor:'white', height:'auto'}}>
                            <View style={{justifyContent:'center', alignItems:'center', marginRight:wp('3%')}}>
                                <Image source={item.image} style={{ width:wp('7%'), height:wp("7%"), }} />
                            </View>
                            <View style={{flex:1, }}>
                                <Text style={styles.pageSubTitleText}>{item.title}</Text>
                                <Text style={styles.pageInfoText}>{item.info}</Text>
                            </View>
                        </AppBottomSheetTouchableWrapper>
                    })}
                </View>
                : null
                }
                <View style={{marginLeft:20, marginRight:20, backgroundColor:Colors.borderColor, height:1}}/>
                <View style={{marginLeft:wp('13%'), marginRight:wp('10%'), marginTop:wp('3%'), marginBottom:wp('2%')}}>
                    <Text style={styles.pageTitleText}>Instructions to{'\n'}Setup Recurring Buy</Text>
                    <Text style={{...styles.pageInfoText, fontSize:RFValue(10), lineHeight:RFValue(13), marginTop:5}}>
                        Lorem ipsum dolor sit amet consectetur adipisicing{'\n'}
                    </Text>
                    <Text style={{...styles.pageInfoText, fontSize:RFValue(10), lineHeight:RFValue(13)}}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.{'\n'}
                    </Text>
                    <Text style={{...styles.pageInfoText, fontSize:RFValue(10), lineHeight:RFValue(13)}}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore{'\n'}
                    </Text>
                </View>
                
            </View>
            </ScrollView>
            <View style={{ paddingBottom:wp('8%'), paddingLeft:wp("5%"), paddingTop:wp("5%")}}>
                    <AppBottomSheetTouchableWrapper onPress={()=>{props.navigation.navigate('SignUpDetails', {address: receivingAddress, selectedAccount: selectedAccount});}} style={{height:wp('13%'), width:wp('50%'), justifyContent:'center', alignItems:'center', backgroundColor:Colors.blue, borderRadius:10}} >
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
        // flexDirection: 'row',
        paddingRight: 10,
        // paddingBottom: 15,
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
        color: Colors.textColorGrey,
        fontSize: RFValue(11),
        fontFamily: Fonts.FiraSansRegular,
    },
});

export default withNavigation(GetBittrRecurringBuyContents);