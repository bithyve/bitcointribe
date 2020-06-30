import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function LoaderModal(props) {
    return (<View style={{ height: hp('25%'),  backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
        <View style={styles.modalContentContainer}>
            <View style={{marginTop:'auto', right:0, bottom:0, marginRight:-5, position:'absolute'}}>
                <Image source={require('../assets/images/loader.gif')} style={ { width: wp('30%'), height: wp('35%'), marginLeft: 'auto', resizeMode: "stretch",}} />
            </View>
            <View style={{marginLeft:wp('8%'), marginRight:wp('8%'), marginTop:wp('8%')}}>
                <Text style={{color:Colors.blue, fontSize:RFValue(18), fontFamily:Fonts.FiraSansMedium}}>{props.headerText}</Text>
                <Text style={{marginRight: wp('15%'), color:Colors.textColorGrey, fontSize:RFValue(11), fontFamily:Fonts.FiraSansRegular, marginTop:wp('3%')}}>{props.messageText}</Text>
                <Text style={{marginRight: wp('20%'), color:Colors.textColorGrey, fontSize:RFValue(11), fontFamily:Fonts.FiraSansRegular, marginTop:wp('3%')}}>{props.messageText2 ? props.messageText2 : ''}</Text>
            </View>
            
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    modalContentContainer: {
        backgroundColor:Colors.white,
        borderTopLeftRadius: 10,
        borderLeftColor: Colors.white,
        borderLeftWidth: 1,
        borderTopRightRadius: 10,
        borderRightColor: Colors.white,
        borderRightWidth: 1,
        borderTopColor: Colors.white,
        borderTopWidth: 1,
        height:'100%',
        position:'relative'
    },
    successModalImage: {
        width: wp('80%'),
        height: hp('8%'),
        resizeMode: 'contain',
        alignSelf:'center'
    },
})