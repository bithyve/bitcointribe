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
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import KnowMoreButton from "../components/KnowMoreButton";

export default function PersonalCopyModalContents(props) {
    return <View style={styles.modalContainer}>
            <View style={styles.modalHeaderTitleView}>
                <TouchableOpacity onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </TouchableOpacity>
                <View style={{ marginTop: hp('2%') }}>
                    <Text style={styles.modalHeaderTitleText}>Personal Copy</Text>
                    <Text style={styles.modalHeaderInfoText}>Select a source</Text>
                </View>
                <KnowMoreButton onpress={() => { }} containerStyle={{ marginTop: 10, marginLeft: 'auto' }} textStyle={{}} />
            </View>

            <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('cloud')}>
                    <Image style={styles.listElementsIconImage} source={require('../assets/images/icons/icon-print.png')} />
                    <View style={{ justifyContent: 'space-between', flex: 1, }}>
                        <Text style={styles.listElementsTitle}>Cloud</Text>
                        <Text style={styles.listElementsInfo} >
                            Store on google drive or any such service
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
                </TouchableOpacity>
                <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('email')}>
                    <Image style={styles.listElementsIconImage} source={require('../assets/images/icons/icon-print.png')} />
                    <View style={{ justifyContent: 'space-between', flex: 1 }}>
                        <Text style={styles.listElementsTitle}>Email</Text>
                        <Text style={styles.listElementsInfo} numberOfLines={1}>
                            A copy sent to your email account
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
                </TouchableOpacity>
                <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('print')}>
                    <Image style={styles.listElementsIconImage} source={require('../assets/images/icons/icon-print.png')} />
                    <View style={{ justifyContent: 'space-between', flex: 1 }}>
                        <Text style={styles.listElementsTitle}>Print</Text>
                        <Text style={styles.listElementsInfo} numberOfLines={1}>
                            A printed physical copy of the document
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
                </TouchableOpacity>
                <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('local')}>
                    <Image style={{ resizeMode: 'contain', width: 20, height: 25, alignSelf: 'center' }} source={require('../assets/images/icons/icon-usb.png')} />
                    <View style={{ justifyContent: 'space-between', flex: 1 }}>
                        <Text style={styles.listElementsTitle}>Local</Text>
                        <Text style={styles.listElementsInfo}>
                            A digital copy stored locally
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
                </TouchableOpacity>
                <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('note')}>
                    <Image style={{ resizeMode: 'contain', width: 20, height: 25, alignSelf: 'center' }} source={require('../assets/images/icons/icon-usb.png')} />
                    <View style={{ justifyContent: 'space-between', flex: 1 }}>
                        <Text style={styles.listElementsTitle}>Note</Text>
                        <Text style={styles.listElementsInfo}>
                            24 word written down by hand
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
                </TouchableOpacity>
            </View>
        </View>
}


const styles = StyleSheet.create({
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
        paddingBottom: 15,
        paddingTop: 10,
        marginLeft: 20,
        marginTop: 20,
        marginRight: 20,
        marginBottom: 15,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    modalHeaderInfoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(12, 812),
        marginTop: 5
    },
    listElements: {
        flexDirection: 'row',
        marginLeft: 20,
        marginRight: 20,
        borderBottomWidth: 0.5,
        borderColor: Colors.borderColor,
        paddingTop: 25,
        paddingBottom: 25,
        paddingLeft: 10,
        alignItems: 'center',
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
        marginTop: 5,
        fontFamily: Fonts.FiraSansRegular
    },
    listElementIcon: {
        paddingRight: 5,
        marginLeft: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listElementsIconImage: {
        resizeMode: 'contain',
        width: 25,
        height: 25,
        alignSelf: 'center'
    }
})