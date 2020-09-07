import React, { useState, useRef } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function PersonalCopyHelpContents(props) {
    const scrollViewRef = useRef();
    return (
        <View
            style={styles.modalContainer}>
            <AppBottomSheetTouchableWrapper style={{ justifyContent: 'center', alignItems: 'center' }}
                activeOpacity={10}
                onPress={() => props.titleClicked && props.titleClicked()}>
                <Text
                    style={{
                        color: Colors.white,
                        fontFamily: Fonts.FiraSansMedium,
                        fontSize: RFValue(20),
                        marginTop: hp('1%'),
                        marginBottom: hp('1%'),
                    }}
                >
                    Personal Recovery Key
                </Text>
            </AppBottomSheetTouchableWrapper>
            <View
                style={{
                    backgroundColor: Colors.homepageButtonColor,
                    height: 1,
                    marginLeft: wp('5%'),
                    marginRight: wp('5%'),
                    marginBottom: hp('1%'),
                }}
            />
            <ScrollView
                ref={scrollViewRef}
                style={styles.modalContainer}
                snapToInterval={hp('85%')}
                decelerationRate='fast'
            >
                <View style={{ height: hp('85%'), justifyContent: 'space-between', paddingBottom: hp('6%') }}>
                    <Text
                        style={{
                            textAlign: 'center',
                            color: Colors.white,
                            fontSize: RFValue(13),
                            fontFamily: Fonts.FiraSansRegular,
                        }}
                    >
                        You can send two of your five Recovery Keys{'\n'}as documents with accounts that you possess.{'\n'}Make sure you delete these from your phone{'\n'}after sharing
                    </Text>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/images/icons/share_personal_copy.png')}
                            style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                        />
                    </View>
                    <Text
                        style={{
                            textAlign: 'center',
                            color: Colors.white,
                            fontSize: RFValue(13),
                            fontFamily: Fonts.FiraSansRegular,
                        }}
                    >
                        If you do not delete your keys from your phone,{'\n'}a hacker in possession of your phone may be{'\n'}able to access all three keys and access your{'\n'}Checking Account
                    </Text>
                    <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
                        scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: hp('85%'), animated: true });
                    }}>
                        <FontAwesome name="angle-double-down" color={Colors.white} size={40} />
                    </TouchableOpacity>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <View
                            style={{
                                borderStyle: 'dotted',
                                borderWidth: 1,
                                borderRadius: 1,
                                borderColor: Colors.white,
                                width: wp('70%'),
                                height: 0,
                            }}
                        />
                    </View>
                </View>
                <View style={{ height: hp('85%'), justifyContent: 'space-between', paddingBottom: hp('10%') }}>
                    <Text
                        style={{
                            textAlign: 'center',
                            color: Colors.white,
                            fontSize: RFValue(13),
                            fontFamily: Fonts.FiraSansRegular,
                        }}
                    >
                        To recover your wallet, you need to scan three{'\n'}of your five Recovery Keys. Having two{'\n'}personal Recovery Keys in your possession makes{'\n'}the recovery process faster, since you only need {'\n'}to request one key from external sources
                    </Text>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/images/icons/recovery_personal_copy.png')}
                            style={{ width: wp('80%'), height: wp('80%'), resizeMode: 'contain' }}
                        />
                    </View>
                    <Text
                        style={{
                            textAlign: 'center',
                            color: Colors.white,
                            fontSize: RFValue(13),
                            fontFamily: Fonts.FiraSansRegular,
                        }}
                    >
                        Personal Recovery Keys need to be available at{'\n'}all times to enable recovery. If your Personal{'\n'}Keys are not available, you require all{'\n'}three Recovery Keys not in your possession to{'\n'}enable recovery
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.blue,
        alignSelf: 'center',
        width: '100%',
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 2 },
    },
});