import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView
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

export default function AllAccountsContents(props) {
    const [pin, setPin] = useState('');
    const [pinFlag, setPinFlag] = useState(true);
    function onPressNumber(text) {
        let tmpPasscode = pin;
        if (pin.length < 4) {
            if (text != 'x') {
                tmpPasscode += text;
                setPin(tmpPasscode);
            }
        }
        if (pin && text == 'x') {
            setPin(pin.slice(0, -1));
        }
    }
    const [AllAccountData, setAllAccountData] = useState([
        {
            title: "Test Account",
            info: "Lorem ipsum dolor sit amet, consectetur",
            image: require("../assets/images/icons/icon_test.png")
        },
        {
            title: "Regular Account",
            info: "Lorem ipsum dolor sit amet, consectetur",
            image: require("../assets/images/icons/icon_regular.png")
        },
        {
            title: "Savings Account",
            info: "Lorem ipsum dolor sit amet, consectetur",
            image: require("../assets/images/icons/icon_secureaccount.png")
        },
        {
            title: "Get Bittr Account",
            info: "Lorem ipsum dolor sit amet, consectetur",
            image: require("../assets/images/icons/icon_test.png")
        },
        {
            title: "Fast Bitcoin Account",
            info: "Lorem ipsum dolor sit amet, consectetur",
            image: require("../assets/images/icons/icon_test.png")
        },

    ])

    const [switchOn, setSwitchOn] = useState(false);
    return (<View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppBottomSheetTouchableWrapper onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </AppBottomSheetTouchableWrapper>
                <Text style={styles.modalHeaderTitleText}>{"All Accounts"}</Text>
            </View>
        </View>
        <View style={{ flex: 1 }}>
            {AllAccountData.map((value) =>
                <AppBottomSheetTouchableWrapper onPress={() => { }} style={styles.listElements}>
                    <Image style={styles.listElementsIconImage} source={value.image} />
                    <View style={{ flex: 1, }}>
                        <Text style={styles.listElementsTitle}>{value.title}</Text>
                        <Text style={styles.listElementsInfo}>
                            {value.info}
                        </Text>
                    </View>
                    <View style={styles.listElementIcon}>
                        <Ionicons
                            name="ios-arrow-forward"
                            color={Colors.textColorGrey}
                            size={10}
                            style={{ alignSelf: 'center' }}
                        />
                    </View>
                </AppBottomSheetTouchableWrapper>
            )}
        </View>
    </View>
    )
}
const styles = StyleSheet.create({
    headerTitleText: {
        color: Colors.blue,
        fontSize: RFValue(25, 812),
        marginLeft: 20,
        marginTop: hp('10%'),
        fontFamily: Fonts.FiraSansRegular
    },
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
        paddingBottom: 15,
        paddingTop: 10,
        marginLeft: 20,
        marginBottom: 15,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    listElements: {
        flexDirection: 'row',
        margin: 20,
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 0.5,
        borderColor: Colors.borderColor,
        paddingBottom: 20,
        justifyContent: 'center',
    },
    listElementsTitle: {
        color: Colors.blue,
        fontSize: RFValue(13, 812),
        marginLeft: 13,
        fontFamily: Fonts.FiraSansRegular
    },
    listElementsInfo: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11, 812),
        marginLeft: 13,
        fontFamily: Fonts.FiraSansRegular,
        marginTop:hp('0.5%')
    },
    listElementIcon: {
        paddingRight: 5,
        marginLeft: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listElementsIconImage: {
        resizeMode: 'contain',
        width: wp('10%'),
        height: wp('10%'),
        alignSelf: 'center'
    }
})