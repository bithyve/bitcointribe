import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome from "react-native-vector-icons/FontAwesome"
import Slider from "react-native-slider";

export default function SendModalContents(props) {
    const [textContactNameRef, setTextContactNameRef] = useState(React.createRef());
    const [textAmountRef, setTextAmountRef] = useState(React.createRef());
    const [descriptionRef, setDescriptionRef] = useState(React.createRef());
    const [sliderValue, setSliderValue] = useState(4);
    return (<View style={styles.modalContentContainer}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
            <ScrollView>
                <View style={styles.modalHeaderTitleView}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                        </TouchableOpacity>
                        <Text style={styles.modalHeaderTitleText}>{"Send to Contact"}</Text>
                    </View>
                </View>
                <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                    <View style={styles.textBoxView}>
                        <TextInput
                            ref={(refs)=>setTextContactNameRef(refs)}
                            style={styles.textBox}
                            placeholder={'Contact Name'}
                            placeholderTextColor={Colors.borderColor}
                            onFocus={()=>{
                                props.modalRef.current.snapTo(2)
                            }}
                            onBlur={()=>{
                                if(!textAmountRef.isFocused() &&!descriptionRef.isFocused())
                                {
                                props.modalRef.current.snapTo(1)
                                }
                            }}
                        />
                        <View style={styles.contactNameInputImageView}>
                            <Image style={styles.textBoxImage} source={require("../assets/images/icons/phone-book.png")} />
                        </View>
                    </View>
                    <View style={styles.textBoxView}>
                        <View style={styles.amountInputImage}>
                            <Image style={styles.textBoxImage} source={require("../assets/images/icons/icon_bitcoin_gray.png")} />
                        </View>
                        <TextInput
                            ref={(refs)=>setTextAmountRef(refs)}
                            style={{ ...styles.textBox, paddingLeft: 10 }}
                            placeholder={'Enter Amount'}
                            placeholderTextColor={Colors.borderColor}
                            onFocus={()=>{
                                props.modalRef.current.snapTo(2)
                            }}
                            onBlur={()=>{
                                if(!descriptionRef.isFocused() &&!textContactNameRef.isFocused())
                                {
                                props.modalRef.current.snapTo(1)
                                }
                            }}
                        />
                    </View>
                    <View style={{ ...styles.textBoxView, height: 100 }}>
                        <TextInput
                            ref={(refs)=>setDescriptionRef(refs)}
                            multiline={true}
                            numberOfLines={4}
                            style={{ ...styles.textBox, paddingRight: 20, marginTop: 10, marginBottom: 10 }}
                            placeholder={'Description (Optional)'}
                            placeholderTextColor={Colors.borderColor}
                            onFocus={()=>{
                                props.modalRef.current.snapTo(2)
                            }}
                            onBlur={()=>{
                                if(!textAmountRef.isFocused() &&!textContactNameRef.isFocused())
                                {
                                    props.modalRef.current.snapTo(1)
                                }
                            }}
                        />
                    </View>
                </View>
                <View style={{ height: 1, backgroundColor: Colors.borderColor, marginRight: 10, marginLeft: 10, marginTop: hp('3%'), marginBottom: hp('3%') }} />
                <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                    <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>Transaction Priority</Text>
                    <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>Set priority for your transaction</Text>
                    <View style={{ ...styles.textBoxView, height: 55, marginTop: hp('2%'), alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                        <Slider
                            style={{flex:1, marginRight:10}}
                            minimumValue={0}
                            maximumValue={10}
                            minimumTrackTintColor={Colors.blue}
                            maximumTrackTintColor={Colors.borderColor}
                            thumbStyle={{borderWidth:5, borderColor:Colors.white, backgroundColor:Colors.blue, height:30, width:30, borderRadius:15}}
                            trackStyle={{height:8, borderRadius:10}}
                            thumbTouchSize={{width: 30, height: 30, backgroundColor:'blue',}}	
                            value={sliderValue}
                            onValueChange={(value) => setSliderValue(value)} 
                        />
                        <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular, marginLeft: 'auto' }}>Low</Text>
                    </View>
                </View>
                <View style={{ paddingLeft: 20, paddingRight: 20, marginTop: hp('5%') }}>
                    <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>Transaction Fee</Text>
                    <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>Transaction fee will be calculated in the next step according to the amount of money being sent</Text>
                </View>
                <View style={{ paddingLeft: 20, paddingRight: 20, flexDirection: 'row', marginTop: hp('5%'), marginBottom: hp('3%') }}>
                    <TouchableOpacity
                    onPress={()=>props.onPressContinue()}
                     style={styles.confirmButtonView}>
                        <Text style={styles.buttonText}>Confirm & Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.confirmButtonView, width: wp('30%'), backgroundColor: Colors.white }}>
                        <Text style={{ ...styles.buttonText, color: Colors.blue, }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </View>
    )
}

const styles = StyleSheet.create({
    modalContentContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 10,
        borderLeftColor: Colors.borderColor,
        borderLeftWidth: 1,
        borderTopRightRadius: 10,
        borderRightColor: Colors.borderColor,
        borderRightWidth: 1,
        borderTopColor: Colors.borderColor,
        borderTopWidth: 1,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansRegular,
    },
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
    textBoxView: {
        flexDirection: 'row',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        height: 50,
        marginTop: hp('1%'),
        marginBottom: hp('1%')
    },
    contactNameInputImageView: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: "center"
    },
    textBoxImage: {
        width: wp('6%'),
        height: wp('6%'),
        resizeMode: 'contain'
    },
    amountInputImage: {
        width: 40,
        height: 50,
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: Colors.borderColor,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10
    },
    textBox: {
        flex: 1,
        paddingLeft: 20,
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(13)
    },
    confirmButtonView: {
        width: wp('50%'),
        height: wp('13%'),
        backgroundColor: Colors.blue,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    buttonText: {
        color: Colors.white,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansMedium
    }
})