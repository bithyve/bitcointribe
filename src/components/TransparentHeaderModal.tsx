import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


export default function TransparentHeaderModal(props) {
    return <TouchableOpacity activeOpacity={10} onPress={() => props.onPressheader()} style={{ ...styles.modalHeaderContainer, }}>
        <View style={styles.modalHeaderHandle} />
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    modalHeaderContainer: {
        paddingTop: 20
    },
    modalHeaderHandle: {
        width: 30,
        height: 5,
        backgroundColor: Colors.borderColor,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 7,
        marginBottom: 7
    },
    contactProfileView: {
        flexDirection: 'row',
        marginLeft: 25,
        marginRight: 25,
        alignItems: 'center',
        justifyContent: "space-between",
        marginBottom: hp('3.5%'),
        marginTop: hp('1.7%')
    },
})