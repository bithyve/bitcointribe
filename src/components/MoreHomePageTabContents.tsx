import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";

export default function MoreHomePageTabContents(props) {
    const [addData, setAddData] = useState([
        {
            title: 'Health of the App', image: require('../assets/images/icons/health.png'), info: 'Urgent action required to maintain health',
        },
        {
            title: 'Address Book', image: require('../assets/images/icons/addressbook.png'), info: 'Lorem ipsum dolor sit amet, consetetur adipiscing',
        },
        {
            title: 'Settings', image: require('../assets/images/icons/settings.png'), info: 'Lorem ipsum dolor sit amet, consetetur',
        },
        {
            title: 'All Accounts', image: require('../assets/images/icons/accounts.png'), info: 'Lorem ipsum dolor sit amet, consetetur',
        },
    ])
    return (<View style={{ ...styles.modalContentContainer, height: '100%', }}>
        <View style={{ height: '100%', paddingBottom: hp('10%') }}>
            <View>
                <FlatList
                    data={addData}
                    ItemSeparatorComponent={() => <View style={{ backgroundColor: Colors.white }}><View style={styles.separatorView} /></View>}
                    renderItem={({ item }) =>
                        <AppBottomSheetTouchableWrapper onPress={()=>props.onPressElements(item)} style={styles.addModalView}>
                            <View style={styles.modalElementInfoView}>
                                <View style={{ justifyContent: "center", }}>
                                    <Image source={item.image} style={{ width: 25, height: 25, resizeMode:'contain' }} />
                                </View>
                                <View style={{ justifyContent: "center", marginLeft: 10 }}>
                                    <Text style={styles.addModalTitleText}>{item.title} </Text>
                                    <Text style={styles.addModalInfoText}>{item.info}</Text>
                                </View>
                            </View>
                        </AppBottomSheetTouchableWrapper>
                    }
                />
            </View>
            <View style={{
                flexDirection: 'row', elevation: 10,
                shadowColor: Colors.borderColor,
                shadowOpacity: 10,
                shadowOffset: { width: 2, height: 2 },
                backgroundColor: Colors.white,
                justifyContent:'space-around',
                height:40,
                alignItems:'center', 
                marginLeft:10, 
                marginRight:10, 
                paddingLeft:10, 
                paddingRight:10,
                marginTop:hp('1%')
            }}>
                <Text style={styles.addModalTitleText}>FAQ's</Text>
                <View style={{height:20, width:1, backgroundColor:Colors.borderColor}} />
                <Text style={styles.addModalTitleText}>Terms And Conditions</Text>
                <View style={{height:20, width:1, backgroundColor:Colors.borderColor}} />
                <Text style={styles.addModalTitleText}>Privacy Policy</Text>
            </View>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    modalContentContainer: {
        height: '100%',
        backgroundColor: Colors.white
    },
    separatorView: {
        marginLeft: 15,
        marginRight: 15,
        height: 2,
        backgroundColor: Colors.backgroundColor
    },
    addModalView: {
        backgroundColor: Colors.white,
        padding: hp('1%'),
        flexDirection: 'row',
        display: 'flex',
        justifyContent: "space-between"
    },
    addModalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(14),
    },
    addModalInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11),
        marginTop:5
    },
    modalElementInfoView: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: 'center'
    },
})