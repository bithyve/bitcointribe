import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
  AsyncStorage,
  Linking,
  NativeModules,
  Alert,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import CommonStyles from '../../common/Styles';
import DeviceInfo from 'react-native-device-info';
import ToggleSwitch from '../../components/ToggleSwitch';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from '../../components/Toast';
import Octicons from "react-native-vector-icons/Octicons";

export default function Home(props) {
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <View style={{ flex: 1 }}>
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={() => { props.navigation.goBack(); }}
                    style={{ height: 30, width: 30, justifyContent: 'center' }}
                >
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17}/>
                </TouchableOpacity>
                <View>
                    <Text style={styles.modalHeaderTitleText}>Get Bittr</Text>
                    <Text style={styles.modalHeaderTitleText}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae rem porro ducimus repudiandae alias optio accusantium numquam illum autem, voluptatum ullam reiciendis laboriosam obcaecati hic! Ab sit iusto facere minus?</Text>
                </View>
                
            </View>
        </View>
        <View style={{flex:1}}>
            <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae rem porro ducimus repudiandae alias optio accusantium numquam illum autem, voluptatum ullam reiciendis laboriosam obcaecati hic! Ab sit iusto facere minus?</Text>
            <View>
                {[1,2,3,4].map((value)=>{
                    return <Text style={{color:Colors.textColorGrey, fontSize:RFValue(13), fontFamily:Fonts.FiraSansRegular}}><Octicons size={RFValue(13)} color={Colors.yellow} name={"primitive-dot"}/> Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
                })}
            </View>
        </View>
        <View style={{justifyContent:'space-around', alignItems:'center', flexDirection:'row'}}>
            <TouchableOpacity onPress={()=>{}} style={{width:wp('30%'), height:wp("13%"), backgroundColor:Colors.yellow, justifyContent:'center', alignItems:'center'}}>
                <Text>Continue To SignUp</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{}} style={{width:wp('20%'), height:wp("13%"), justifyContent:'center', alignItems:'center'}}>
                <Text>Back</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 10,
        paddingBottom: hp('1.5%'),
        paddingTop: hp('1%'),
        marginLeft: 10,
        marginRight: 10,
        marginBottom: hp('1.5%'),
      },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansMedium,
    },
});
