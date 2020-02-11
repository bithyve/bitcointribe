import React, { useState } from 'react';
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

    return (<View style={{ height: hp('35%'),  backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
        <View style={styles.modalContentContainer}>
            <Image source={require('../assets/images/loading.gif')} style={styles.successModalImage} />
            <View style={{marginLeft:wp('8%'), marginRight:wp('8%')}}>
                <Text style={{color:Colors.white, fontSize:RFValue(16), fontFamily:Fonts.FiraSansMedium}}>{props.headerText}</Text>
                <Text style={{color:Colors.white, fontSize:RFValue(13), fontFamily:Fonts.FiraSansRegular, marginTop:wp('3%')}}>{props.messageText}</Text>
            </View>
            <View style={{marginTop:'auto'}}>
                <Image source={require('../assets/images/icons/loaderBottomImage.png')} style={ {width: wp("28%"), height: wp("26%"), marginLeft: "auto", resizeMode: "cover"}} />
            </View>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    modalContentContainer: {
        backgroundColor:Colors.blue,
        borderTopLeftRadius: 10,
        borderLeftColor: Colors.blue,
        borderLeftWidth: 1,
        borderTopRightRadius: 10,
        borderRightColor: Colors.blue,
        borderRightWidth: 1,
        borderTopColor: Colors.blue,
        borderTopWidth: 1,
        height:'100%'
    },
    successModalImage: {
        width: wp('80%'),
        height: hp('8%'),
        resizeMode: 'contain',
        alignSelf:'center'
    },
})