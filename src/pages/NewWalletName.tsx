import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import CommonStyles from "../common/Styles";
import { TextInput } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default function NewWalletName(props) {
    const [walletName, setWalletName] = useState('');
    const [inputStyle, setInputStyle] = useState(styles.inputBox);
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
            <View style={{ flex: 1 }}>
                <View style={CommonStyles.headerContainer}>
                    <TouchableOpacity
                        style={CommonStyles.headerLeftIconContainer}
                        onPress={() => { props.navigation.navigate('RestoreAndReoverWallet'); }}
                    >
                        <View style={CommonStyles.headerLeftIconInnerContainer}>
                            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                        </View>
                    </TouchableOpacity>
                </View>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
                    <ScrollView>
                        <Text style={styles.pageTitle}>New Hexa Wallet</Text>
                        <Text style={styles.labelStyle}>Please name your <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>wallet</Text></Text>
                        <TextInput
                            style={inputStyle}
                            placeholder={'Pam’s Wallet'}
                            placeholderTextColor={Colors.borderColor}
                            value={walletName}
                            onChangeText={(text) => setWalletName(text)}
                            onFocus={() => { setInputStyle(styles.inputBoxFocused) }}
                            onBlur={() => { setInputStyle(styles.inputBox) }}
                        />
                    </ScrollView>
                    {walletName.trim() != '' ? (
                        <View style={styles.bottomButtonView}>
                            <TouchableOpacity onPress={() => props.navigation.navigate('NewWalletQuestion')} style={styles.buttonView}>
                                <Text style={styles.buttonText}>Continue</Text>
                            </TouchableOpacity>
                            <View style={styles.statusIndicatorView}>
                                <View style={styles.statusIndicatorActiveView} />
                                <View style={styles.statusIndicatorInactiveView} />
                                <View style={styles.statusIndicatorInactiveView} />
                            </View>
                        </View>
                    ) : (
                            <View style={{ marginBottom: 25, padding: 20, backgroundColor: Colors.backgroundColor, marginLeft: 15, marginRight: 15, borderRadius: 10, justifyContent: 'center' }}>
                                <Text style={styles.bottomNoteText}>We do not store this anywhere.</Text>
                                <Text style={styles.bottomNoteInfoText}>Your contacts will see this to identify you</Text>
                            </View>
                        )
                    }

                </KeyboardAvoidingView>
            </View>

        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    pageTitle: {
        color: Colors.blue,
        fontSize: RFValue(25, 812),
        marginLeft: 15,
        marginBottom: 5,
        fontFamily: Fonts.FiraSansRegular
    },
    labelStyle:
    {
        color: Colors.textColorGrey,
        fontSize: RFValue(12, 812),
        marginLeft: 15,
        fontFamily: Fonts.FiraSansRegular
    },
    inputBox: {
        borderColor: Colors.borderColor,
        borderWidth: 0.5,
        borderRadius: 10,
        marginTop: hp('5%'),
        height: 50,
        marginLeft: 15,
        marginRight: 15,
        paddingLeft: 15,
        fontSize: RFValue(13, 812),
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        marginBottom: 20
    },
    inputBoxFocused: {
        borderColor: Colors.borderColor,
        borderWidth: 0.5,
        borderRadius: 10,
        marginTop: hp('5%'),
        height: 50,
        marginLeft: 15,
        marginRight: 15,
        paddingLeft: 15,
        fontSize: RFValue(13, 812),
        color: Colors.textColorGrey,
        elevation: 2,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 2, height: 2 },
        backgroundColor: Colors.white,
        fontFamily: Fonts.FiraSansRegular,
        marginBottom: 20
    },
    bottomNoteText: {
        color: Colors.blue,
        fontSize: RFValue(13, 812),
        marginBottom: 5,
        fontFamily: Fonts.FiraSansRegular
    },
    bottomNoteInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(12, 812),
        fontFamily: Fonts.FiraSansRegular
    },
    buttonView: {
        height: wp('13%'),
        width: wp('30%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        elevation: 10,
        shadowColor: Colors.shadowBlue,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 10 },
        backgroundColor: Colors.blue
    },
    buttonText: {
        color: Colors.white,
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    bottomButtonView: {
        flexDirection: 'row',
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 40,
        paddingTop: 30,
        alignItems: 'center'
    },
    statusIndicatorView: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    statusIndicatorActiveView:
    {
        height: 5,
        width: 25,
        backgroundColor: Colors.blue,
        borderRadius: 10
    },
    statusIndicatorInactiveView: {
        width: 5,
        backgroundColor: Colors.lightBlue,
        borderRadius: 10,
        marginLeft: 5
    }

});
