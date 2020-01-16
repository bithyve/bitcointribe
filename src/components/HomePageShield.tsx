import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ImageBackground,
    View
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import AntDesign from "react-native-vector-icons/AntDesign";
import ProgressCircle from 'react-native-progress-circle'

export default function HomePageShield(props) {

    return (<ImageBackground source={props.shieldImage ? props.shieldImage : require("../assets/images/icons/protector.png")} style={{
        width: wp('17%'),
        height: wp('25%'),
        justifyContent: 'center',
        alignItems: 'center'
    }}
        resizeMode='contain'
    >
        <ProgressCircle
            percent={props.shieldStatus}
            radius={wp('4%')}
            borderWidth={2}
            color={Colors.white}
            shadowColor={props.circleShadowColor ? props.circleShadowColor :"#006CB4"}
            bgColor={props.shieldStatus == 0 ? Colors.red : props.shieldStatus > 0 && props.shieldStatus <= 50 ? Colors.yellow : props.shieldStatus > 50 && props.shieldStatus <= 100 ? Colors.green : Colors.red}
        >
        <View style={{
            backgroundColor: props.shieldStatus == 0 ? Colors.red : props.shieldStatus > 0 && props.shieldStatus <= 50 ? Colors.yellow : props.shieldStatus > 50 && props.shieldStatus <= 100 ? Colors.green : Colors.red, width: wp('7%'),
            height: wp('7%'), borderRadius: wp('7%') / 2, borderWidth: 1, borderColor: Colors.white,
            justifyContent:'center',
            alignItems:'center'
        }}>
            {props.shieldStatus == 0 ?
                <AntDesign size={20} color={Colors.white} name={'exclamation'} /> :
                props.shieldStatus > 0 && props.shieldStatus < 100 ?
                    <Text style={{color:Colors.white, fontSize:RFValue(9), fontFamily:Fonts.FiraSansRegular}}>{props.shieldStatus}%</Text> :
                    props.shieldStatus == 100 ?
                        <AntDesign size={20} color={Colors.white} name={'check'} />
                        : null
            }
        </View>
        </ProgressCircle>
    </ImageBackground>
    )
}

const styles = StyleSheet.create({

})