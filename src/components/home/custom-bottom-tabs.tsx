import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import Colors from '../../common/Colors';
import DeviceInfo from 'react-native-device-info';
import Fonts from './../../common/Fonts';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

const CustomBottomTabs = ({ tabBarZIndex, selectTab, selected }) => {
    return (
        <View style={{ ...styles.bottomTabBarContainer, zIndex: tabBarZIndex }}>
            <TouchableOpacity
                onPress={() => selectTab('Transactions')}
                style={styles.tabBarTabView}
            >
                {selected == 'Transactions' ? (
                    <View style={styles.activeTabStyle}>
                        <Image
                            source={require('../../assets/images/HomePageIcons/icon_transactions_active.png')}
                            style={{ width: 25, height: 25, resizeMode: 'contain' }}
                        />
                        <Text style={styles.activeTabTextStyle}>transactions</Text>
                    </View>
                ) : (
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={require('../../assets/images/HomePageIcons/icon_transactions.png')}
                                style={styles.tabBarImage}
                            />
                        </View>
                    )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => selectTab('Add')}
                style={styles.tabBarTabView}
            >
                {selected == 'Add' ? (
                    <View style={styles.activeTabStyle}>
                        <Image
                            source={require('../../assets/images/HomePageIcons/icon_add_active.png')}
                            style={styles.tabBarImage}
                        />
                        <Text style={styles.activeTabTextStyle}>add</Text>
                    </View>
                ) : (
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={require('../../assets/images/HomePageIcons/icon_add.png')}
                                style={styles.tabBarImage}
                            />
                        </View>
                    )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => selectTab('QR')}
                style={styles.tabBarTabView}
            >
                {selected == 'QR' ? (
                    <View style={styles.activeTabStyle}>
                        <Image
                            source={require('../../assets/images/HomePageIcons/icon_qr_active.png')}
                            style={styles.tabBarImage}
                        />
                        <Text style={styles.activeTabTextStyle}>qr</Text>
                    </View>
                ) : (
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={require('../../assets/images/HomePageIcons/icon_qr.png')}
                                style={styles.tabBarImage}
                            />
                        </View>
                    )}
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabBarTabView}
                onPress={() => selectTab('More')}
            >
                {selected == 'More' ? (
                    <View style={styles.activeTabStyle}>
                        <Image
                            source={require('../../assets/images/HomePageIcons/icon_more.png')}
                            style={styles.tabBarImage}
                        />
                        <Text style={styles.activeTabTextStyle}>more</Text>
                    </View>
                ) : (
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={require('../../assets/images/HomePageIcons/icon_more.png')}
                                style={styles.tabBarImage}
                            />
                        </View>
                    )}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    bottomTabBarContainer: {
        backgroundColor: Colors.white,
        justifyContent: 'space-evenly',
        display: 'flex',
        marginTop: 'auto',
        flexDirection: 'row',
        height: hp('12%'),
        alignItems: 'center',
        borderLeftColor: Colors.borderColor,
        borderLeftWidth: 1,
        borderRightColor: Colors.borderColor,
        borderRightWidth: 1,
        borderTopColor: Colors.borderColor,
        borderTopWidth: 1,
        paddingBottom: DeviceInfo.hasNotch() ? hp('4%') : 0,
    },
    tabBarTabView: {
        padding: wp('5%'),
    },
    activeTabStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundColor,
        padding: 7,
        borderRadius: 7,
        width: 120,
        height: 40,
        justifyContent: 'center',
    },
    activeTabTextStyle: {
        marginLeft: 8,
        color: Colors.blue,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(12),
    },
    tabBarImage: {
        width: 21,
        height: 21,
        resizeMode: 'contain',
    },
})

export default CustomBottomTabs
