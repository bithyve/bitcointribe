
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


export default function SmallHeaderModal(props) {
    return <TouchableOpacity activeOpacity={10} onPress={() => props.onPressHandle()} style={styles.modalHeader}>
    <View style={styles.modalHeaderHandle} />
</TouchableOpacity>
}

const styles = StyleSheet.create({
    modalHeaderHandle: {
        width: 50,
        height: 5,
        backgroundColor: Colors.borderColor,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 15
    },
    modalHeader: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        height: 25,
        width: '80%',
        alignSelf: 'center',
        borderColor: Colors.borderColor,
    },
})
