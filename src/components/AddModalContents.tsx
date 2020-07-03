import React, { useState } from 'react';
import {
	View,
	Image,
	Text,
	StyleSheet
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";
import { FlatList } from "react-native-gesture-handler"; 

export default function AddModalContents( props ) {
	const [ addData, setAddData ] = useState( [
		{
			title: `Buy bitcoin into Hexa wallet`, 
			image: require( '../assets/images/icons/icon_fastbicoin.png' ), 
			info: 'Redeem a FastBitcoins voucher',
			type:'buyBitcoins'
		},
		{
			title: `Pair with FastBitcoins account`, 
			image: require( '../assets/images/icons/icon_fastbicoin.png' ), 
			info: 'If you have completed your registration',
			type:'pairAccount'
		},
		{
			title: 'Add Contact', 
			image: require( '../assets/images/icons/icon_addcontact.png' ), 
			info: 'Add contacts from your Address Book',
			type:'addContact'
		},
		// {
		// 	title: 'Add Account', 
		// 	image: require( '../assets/images/icons/icon_addaccount.png' ), 
		// 	info: 'Add an account to your wallet, Select from options',
		// 	type:'addAccount'
		// },
		// {
		// 	title: 'Import Wallet', 
		// 	image: require( '../assets/images/icons/icon_importwallet.png' ), 
		// 	info: 'Import a non-Hexa wallet as an account',
		// 	type:'importWallet'
		// },
	] )
	return ( <View style={ styles.modalContentContainer }>
		<View style={{marginBottom: hp('13%')}}>
			<FlatList
				data={ addData }
				ItemSeparatorComponent={ () => <View style={ { backgroundColor: Colors.white } }><View style={ styles.separatorView } /></View> }
				renderItem={ ( { item } ) =>
					<AppBottomSheetTouchableWrapper onPress={ () => props.onPressElements( item.type ) } style={ {...styles.addModalView, backgroundColor: Colors.white }} >
						<View style={ styles.modalElementInfoView }>
							<View style={ { justifyContent: "center", } }>
								<Image source={ item.image } style={ { width: 25, height: 25 } } />
							</View>
							<View style={ { justifyContent: "center", marginLeft: 10, flexShrink: 1, } }>
								<Text style={ styles.addModalTitleText }>{ item.title } </Text>
								<Text style={ styles.addModalInfoText }>{ item.info }</Text>
							</View>
						</View>
					</AppBottomSheetTouchableWrapper>
				}
			/>
		</View>
	</View>
	)
}
const styles = StyleSheet.create( {
	modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.white,
	},
	addModalView: {
		padding: 7,
		flexDirection: 'row',
		display: 'flex',
		marginTop: 10,
		justifyContent: "space-between",
	},
	addModalTitleText: {
		color: Colors.blue,
		fontSize: RFValue( 13 ),
		fontFamily: Fonts.FiraSansRegular
	},
	addModalInfoText: {
		color: Colors.textColorGrey,
		fontSize: RFValue( 11 ),
		fontFamily: Fonts.FiraSansRegular,
		flexWrap: 'wrap',
	},
	modalElementInfoView: {
		padding: 10,
		flexDirection: 'row',
		justifyContent: "center",
		alignItems: 'center',
	},
	separatorView: {
		marginLeft: 15,
		marginRight: 15,
		height: 2,
		backgroundColor: Colors.backgroundColor
	},
} )