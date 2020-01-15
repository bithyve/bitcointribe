import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Text,
    Image,
    FlatList,
    Platform,
    AsyncStorage,
} from 'react-native';
import BackupStyles from '../../pages/ManageBackup/Styles';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from "../../common/Fonts";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

export default function TrustedContactModalContents(props) {
    const [selectedStatus, setSelectedStatus] = useState('error');
    const [ChangeBottomSheet, setChangeBottomSheet] = useState(React.createRef());
    const [ReshareBottomSheet, setReshareBottomSheet] = useState(React.createRef());
    const [ConfirmBottomSheet, setConfirmBottomSheet] = useState(React.createRef());
    const [pageData1, setPageData1] = useState([
        {
            id: 1, title: "Recovery Secret Not Accessible", date: "19 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
        },
        {
            id: 2, title: "Recovery Secret Received", date: "1 June ‘19, 9:00am", info: "consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet"
        },
        {
            id: 3, title: "Recovery Secret In-Transit", date: "30 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
        },
        {
            id: 4, title: "Recovery Secret Accessible", date: "24 May ‘19, 5:00pm", info: "Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet"
        },
        {
            id: 5, title: "Recovery Secret In-Transit", date: "20 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
        },
        {
            id: 6, title: "Recovery Secret Not Accessible", date: "19 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
        }
    ]);
    const SelectOption = (Id) => {
        if (Id == SelectedOption) {
            setSelectedOption(0)
        }
        else {
            setSelectedOption(Id)
        }
    }
    const [SelectedOption, setSelectedOption] = useState(0);

    const getIconByStatus = status => {
        if (status == 'error') {
            return require('../../assets/images/icons/icon_error_red.png');
        } else if (status == 'warning') {
            return require('../../assets/images/icons/icon_error_yellow.png');
        } else if (status == 'success') {
            return require('../../assets/images/icons/icon_check.png');
        }
    };

    return <View style={{
        height: "100%",
        backgroundColor: Colors.white,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.borderColor,
        alignSelf: "center",
        width: "100%"
    }}>
        <View style={{ ...BackupStyles.modalHeaderTitleView, marginLeft: 10, marginRight: 10, marginTop: 20, }}>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => { props.onPressBack(); }} style={{ height: 30, width: 30, }} >
                    <FontAwesome
                        name="long-arrow-left"
                        color={Colors.blue}
                        size={17}
                    />
                </TouchableOpacity>
                <View style={{ alignSelf: "center", flex: 1, justifyContent: "center" }}>
                    <Text style={BackupStyles.modalHeaderTitleText}>Pamella Aalto</Text>
                    <Text style={BackupStyles.modalHeaderInfoText}>
                        Last backup{' '}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', }}> {'1 months ago'}</Text>
                    </Text>
                </View>
            </View>
            <Image style={BackupStyles.cardIconImage} source={getIconByStatus(selectedStatus)} />
        </View>
        <ScrollView style={{ flex: 1 }}>
            {pageData1.map((value) => {
                if (SelectedOption == value.id) {
                    return <TouchableOpacity onPress={() => SelectOption(value.id)} style={{ margin: wp('3%'), backgroundColor: Colors.white, borderRadius: 10, height: wp('20%'), width: wp('90%'), justifyContent: 'center', paddingLeft: wp('3%'), paddingRight: wp('3%'), alignSelf: 'center' }}>
                        <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>{value.title}</Text>
                        <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(10), fontFamily: Fonts.FiraSansRegular, marginTop: hp('0.5%') }}>Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit</Text>
                        <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(9), fontFamily: Fonts.FiraSansRegular, marginTop: hp('0.3%') }}>{value.date}</Text>
                    </TouchableOpacity>
                }
                return <TouchableOpacity onPress={() => SelectOption(value.id)} style={{ margin: wp('3%'), backgroundColor: Colors.white, borderRadius: 10, height: wp('15%'), width: wp('85%'), justifyContent: 'center', paddingLeft: wp('3%'), paddingRight: wp('3%'), alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(10), fontFamily: Fonts.FiraSansRegular }}>{value.title}</Text>
                        <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(9), fontFamily: Fonts.FiraSansRegular, marginLeft: 'auto' }}>{value.date}</Text>
                    </View>
                    <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(8), fontFamily: Fonts.FiraSansRegular, marginTop: hp('0.5%') }}>Lorem ipsum dolor Lorem dolor sit amet, consectetur <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>dolor sit</Text></Text>
                </TouchableOpacity>
            })}
        </ScrollView>
        {SelectedOption ?
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', height: hp('25%'), backgroundColor: Colors.white }}>
                <Text style={{ marginTop: hp('1%'), marginBottom: hp('1%'), color: Colors.textColorGrey, fontSize: RFValue(10), fontFamily: Fonts.FiraSansRegular, }}>consectetur Lorem ipsum dolor sit amet, consectetur sit <Text onPress={() => props.onPressReshare()} style={{ color: Colors.blue, textDecorationLine: "underline" }}>Reshare</Text></Text>

                <Text style={{ marginTop: hp('1%'), marginBottom: hp('1%'), color: Colors.textColorGrey, fontSize: RFValue(10), fontFamily: Fonts.FiraSansRegular, }}>Lorem ipsum dolor sit amet, consectetur sit amet <Text onPress={() => props.onPressChange()} style={{ color: Colors.blue, textDecorationLine: "underline" }}>Change Source</Text></Text>

                <TouchableOpacity onPress={() => props.onPressConfirm()} style={{ backgroundColor: Colors.blue, height: wp('13%'), width: wp('40%'), justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: hp('3%'), marginBottom: hp('3%') }}><Text style={{ color: Colors.white, fontSize: RFValue(10), fontFamily: Fonts.FiraSansMedium, }}>Confirm</Text></TouchableOpacity>
            </View> : null
        }
    </View>
}