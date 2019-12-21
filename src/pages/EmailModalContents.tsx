import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import KnowMoreButton from "../components/KnowMoreButton";

export default function EmailModalContents(props) {
    return <SafeAreaView style={{ flex: 1 }}>
    <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
    <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
            </TouchableOpacity>
            <View style={{ marginTop: hp('2%') }}>
                <Text style={styles.modalHeaderTitleText}>Email</Text>
                <Text style={styles.modalHeaderInfoText}>Select a source</Text>
            </View>
            <KnowMoreButton onpress={() => { }} containerStyle={{ marginTop: 10, marginLeft: 'auto' }} textStyle={{}} />
        </View>
        <Text style={{
            marginLeft: 20, color: Colors.textColorGrey,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue(12, 812),
        }}>Select email to <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>store recovery secret</Text></Text>

        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('cloud')}>
                <Image style={styles.listElementsIconImage} source={require('../assets/images/icons/logo_brand_brands_logos_icloud.png')} />
                <View style={{ justifyContent: 'space-between', flex: 1, }}>
                    <Text style={styles.listElementsTitle}>iCloud</Text>
                    <Text style={styles.listElementsInfo} >
                        Store backup in iCloud Drive
						</Text>
                </View>
                <View style={styles.listElementIcon}>
                    <Ionicons
                        name="ios-arrow-forward"
                        color={Colors.textColorGrey}
                        size={15}
                        style={{ alignSelf: 'center' }}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('email')}>
                <Image style={styles.listElementsIconImage} source={require('../assets/images/icons/gmail.png')} />
                <View style={{ justifyContent: 'space-between', flex: 1 }}>
                    <Text style={styles.listElementsTitle}>Gmail</Text>
                    <Text style={styles.listElementsInfo} numberOfLines={1}>
                        Store backup in Gmail
								</Text>
                </View>
                <View style={styles.listElementIcon}>
                    <Ionicons
                        name="ios-arrow-forward"
                        color={Colors.textColorGrey}
                        size={15}
                        style={{ alignSelf: 'center' }}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('print')}>
                <Image style={styles.listElementsIconImage} source={require('../assets/images/icons/outlook.png')} />
                <View style={{ justifyContent: 'space-between', flex: 1 }}>
                    <Text style={styles.listElementsTitle}>Outlook</Text>
                    <Text style={styles.listElementsInfo} numberOfLines={1}>
                        Store backup in Outlook
								</Text>
                </View>
                <View style={styles.listElementIcon}>
                    <Ionicons
                        name="ios-arrow-forward"
                        color={Colors.textColorGrey}
                        size={15}
                        style={{ alignSelf: 'center' }}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listElements} onPress={() => props.onPressElement('local')}>
                <Image style={{ resizeMode: 'contain', width: 20, height: 25, alignSelf: 'center' }} source={require('../assets/images/icons/yahoo.png')} />
                <View style={{ justifyContent: 'space-between', flex: 1 }}>
                    <Text style={styles.listElementsTitle}>Yahoo</Text>
                    <Text style={styles.listElementsInfo}>
                        Store backup in Yahoo
								</Text>
                </View>
                <View style={styles.listElementIcon}>
                    <Ionicons
                        name="ios-arrow-forward"
                        color={Colors.textColorGrey}
                        size={15}
                        style={{ alignSelf: 'center' }}
                    />
                </View>
            </TouchableOpacity>
        </View>
    </View>
    </SafeAreaView>
}


const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
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