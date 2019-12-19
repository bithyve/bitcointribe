import React, { useState } from 'react';
import {
	View,
	Image,
	Text,
	StyleSheet,
	ScrollView,
	FlatList
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";

export default function AddModalContents(props) {
	const [addData, setAddData] = useState([
		{
			title: 'Getbittr', image: require('../assets/images/icons/icon_getbitter.png'), info: 'GetBittr gives you an easy way to stack sats',
		},
		{
			title: 'Fastbitcoins', image: require('../assets/images/icons/icon_fastbicoin.png'), info: 'The quickest way to buy bitcoins, from your local store',
		},
		{
			title: 'Add Account', image: require('../assets/images/icons/icon_addaccount.png'), info: 'Add an account to your wallet, Select from options',
		},
		{
			title: 'Add Contact', image: require('../assets/images/icons/icon_addcontact.png'), info: 'Add contacts from your address book',
		},
		{
			title: 'Import Wallet', image: require('../assets/images/icons/icon_importwallet.png'), info: 'Import a non-Hexa wallet as an account',
		},
		{
			title: 'Add Account', image: require('../assets/images/icons/icon_addaccount.png'), info: 'Add an account to your wallet, Select from options',
		},
		{
			title: 'Add Contact', image: require('../assets/images/icons/icon_addcontact.png'), info: 'Add contacts from your address book',
		},
		{
			title: 'Import Wallet', image: require('../assets/images/icons/icon_importwallet.png'), info: 'Import a non-Hexa wallet as an account',
		},
		{
			title: 'Add Account', image: require('../assets/images/icons/icon_addaccount.png'), info: 'Add an account to your wallet, Select from options',
		},
		{
			title: 'Add Contact', image: require('../assets/images/icons/icon_addcontact.png'), info: 'Add contacts from your address book',
		},
		{
			title: 'Import Wallet', image: require('../assets/images/icons/icon_importwallet.png'), info: 'Import a non-Hexa wallet as an account',
		}
	])
	return (<View style={styles.modalContentContainer}>
		<FlatList
			data={addData}
			ItemSeparatorComponent={() => <View style={{ backgroundColor: Colors.white }}><View style={styles.separatorView} /></View>}
			renderItem={({ item }) =>
				<AppBottomSheetTouchableWrapper onPress={() => props.onPressElements(item.title)} style={styles.addModalView} >
					<View style={styles.modalElementInfoView}>
						<View style={{ justifyContent: "center", }}>
							<Image source={item.image} style={{ width: 25, height: 25 }} />
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
	)
}
const styles = StyleSheet.create({
	modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.white,
		paddingBottom: hp('10%')
	},
	addModalView: {
		backgroundColor: Colors.white,
		padding: 7,
		flexDirection: 'row',
		display: 'flex',
		justifyContent: "space-between"
	},
	addModalTitleText: {
		color: Colors.blue,
		fontSize: RFValue(14, 812),
	},
	addModalInfoText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(11, 812),
	},
	modalElementInfoView: {
		padding: 10,
		flexDirection: 'row',
		justifyContent: "center",
		alignItems: 'center'
	},
	separatorView: {
		marginLeft: 15,
		marginRight: 15,
		height: 2,
		backgroundColor: Colors.backgroundColor
	},
})