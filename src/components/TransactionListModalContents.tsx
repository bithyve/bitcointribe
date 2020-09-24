import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    FlatList
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";

export default function TransactionListModalContents(props) {

    return (<View style={styles.modalContentContainer}>
        <FlatList
            data={props.transactionData}
            ItemSeparatorComponent={() => <View style={{ backgroundColor: Colors.white }}><View style={styles.separatorView} /></View>}
            renderItem={({ item }) =>
                <TouchableOpacity onPress={() => props.onPressTransaction()} style={styles.transactionModalElementView}>
                    <View style={styles.modalElementInfoView}>
                        <View style={{ justifyContent: "center", }}>
                            <FontAwesome name={item.transactionStatus == 'receive' ? 'long-arrow-down' : 'long-arrow-up'} size={15} color={item.transactionStatus == 'receive' ? Colors.green : Colors.red} />
                        </View>
                        <View style={{ justifyContent: "center", marginLeft: 10 }}>
                            <Text style={styles.transactionModalTitleText}>{item.title} </Text>
                            <Text style={styles.transactionModalDateText}>{item.date} <Entypo size={10} name={'dot-single'} color={Colors.textColorGrey} />{item.time}</Text>
                        </View>
                    </View>
                    <View style={styles.transactionModalAmountView}>
                        <Image source={require('../assets/images/icons/icon_bitcoin_gray.png')} style={{ width: 12, height: 12, resizeMode: 'contain' }} />
                        <Text style={{ ...styles.transactionModalAmountText, color: item.transactionStatus == 'receive' ? Colors.green : Colors.red, }}>{item.price}</Text>
                        <Text style={styles.transactionModalAmountUnitText}>6+</Text>
                        <Ionicons
                            name="ios-arrow-forward"
                            color={Colors.textColorGrey}
                            size={12}
                            style={{ marginLeft: 20, alignSelf: 'center' }}
                        />
                    </View>
                </TouchableOpacity>
            }
        />
    </View>
    )
}
const styles = StyleSheet.create({
    modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.white,
		paddingBottom: hp('10%')
    },
    transactionModalElementView: {
		backgroundColor: Colors.white,
		padding: 10,
		flexDirection: 'row',
		display: 'flex',
		justifyContent: "space-between"
    },
    modalElementInfoView: {
		padding: 10,
		flexDirection: 'row',
		justifyContent: "center",
		alignItems: 'center'
    },
    transactionModalTitleText: {
		color: Colors.blue,
		fontSize: RFValue(12),
		marginBottom: 3,
		fontFamily: Fonts.FiraSansRegular
    },
    transactionModalAmountView: {
		padding: 10,
		flexDirection: 'row',
		display: 'flex',
		alignItems: 'center'
    },
    transactionModalAmountText: {
		marginLeft: 5,
		marginRight: 5,
		fontSize: RFValue(20),
		fontFamily: Fonts.OpenSans,
	},
	transactionModalAmountUnitText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(10),
		fontFamily: Fonts.OpenSans
    },
    transactionModalDateText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(10),
		fontFamily: Fonts.FiraSansRegular
	},
})
