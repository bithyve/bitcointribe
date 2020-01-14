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
    ActivityIndicator
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
import { useDispatch, useSelector } from "react-redux";
import { uploadEncMShare } from "../../store/actions/sss";
import QRCode from "react-native-qrcode-svg";
import CopyThisText from "../CopyThisText";
import BottomInfoBox from "../BottomInfoBox";
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';

export default function SecondaryDeviceModelContents(props) {
    const [selectedStatus, setSelectedStatus] = useState("error"); // for preserving health of this entity
    const [secondaryQR, setSecondaryQR] = useState("");
    const { SHARES_TRANSFER_DETAILS } = useSelector(
        state => state.storage.database.DECENTRALIZED_BACKUP
    );
    const { loading } = useSelector(state => state.sss);

    SHARES_TRANSFER_DETAILS[0] && !secondaryQR
        ? setSecondaryQR(
            JSON.stringify({
                ...SHARES_TRANSFER_DETAILS[0],
                type: "secondaryDeviceQR"
            })
        )
        : null;
    const dispatch = useDispatch();

    useEffect(() => {
        if (!secondaryQR) {
            dispatch(uploadEncMShare(0));
        }
    }, []);
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
        <View style={{ ...BackupStyles.modalHeaderTitleView, marginLeft: 10, marginRight: 10, marginTop: 10, }}>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => { props.onPressBack(); }} style={{ height: 30, width: 30, }} >
                    <FontAwesome
                        name="long-arrow-left"
                        color={Colors.blue}
                        size={17}
                    />
                </TouchableOpacity>
                <View style={{ alignSelf: "center", flex: 1, justifyContent: "center" }}>
                    <Text style={BackupStyles.modalHeaderTitleText}>Secondary Device</Text>
                    <Text style={BackupStyles.modalHeaderInfoText}>
                        Last backup{' '}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', }}> {'3 months ago'}</Text>
                    </Text>
                </View>
            </View>
            <Image style={BackupStyles.cardIconImage} source={getIconByStatus(selectedStatus)} />
        </View>
        <View style={BackupStyles.modalContentView}>
            {loading.uploadMetaShare || !secondaryQR ? (
                <View style={{ height: hp("27%"), justifyContent: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                    <QRCode value={secondaryQR} size={hp("27%")} />
                )}
            {secondaryQR ? <CopyThisText text={secondaryQR} /> : null}
            <AppBottomSheetTouchableWrapper onPress={()=>props.onPressOk()} style={{backgroundColor:Colors.blue, borderRadius:10, width:wp('50%'), height:wp('13%'), justifyContent:'center', alignItems:'center', marginTop:hp('3%'), marginBottom:hp('3%')}}>
                <Text style={{color:Colors.white, fontSize:RFValue(13), fontFamily:Fonts.FiraSansMedium}}>Yes, I have shared</Text>
            </AppBottomSheetTouchableWrapper>
        </View>
        <BottomInfoBox
            title={"Note"}
            infoText={
                "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            }
        />
    </View>
}