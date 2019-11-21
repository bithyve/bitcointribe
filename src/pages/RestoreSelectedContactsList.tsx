import React from 'react';
import {
	StyleSheet,
	View,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	StatusBar,
	Text,
	Image
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import CommonStyles from "../common/Styles";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default function RestoreSelectedContactsList(props) {

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
			<View style={{ flex: 1 }}>
				<View style={CommonStyles.headerContainer}>
					<TouchableOpacity
						style={CommonStyles.headerLeftIconContainer}
						onPress={() => { props.navigation.navigate('RestoreAndReoverWallet'); }}
					>
						<View style={CommonStyles.headerLeftIconInnerContainer}>
							<FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
						</View>
					</TouchableOpacity>
				</View>
				<ScrollView>
					<Text
						style={{
							color: Colors.blue,
							fontSize: RFValue(25, 812),
							marginLeft: 15,
							fontFamily: Fonts.FiraSansRegular
						}}
					>
						Restore wallet using</Text>
					<Text style={{ color: Colors.blue, fontSize: RFValue(25, 812), marginLeft: 15, fontFamily: Fonts.FiraSansRegular }}>
						Recovery Secrets{' '}
					</Text>
					<Text
						style={{
							color: Colors.textColorGrey,
							fontSize: RFValue(12, 812),
							marginLeft: 15,
							fontWeight: 'normal',
              marginRight: 15,
              marginTop:5,
							fontFamily: Fonts.FiraSansRegular
						}}
					>
						These are the Recovery Secrets that you have stored in five places.<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold' }}>You need three of them restore your wallet</Text>
					</Text>
					<TouchableOpacity style={{...styles.listElements, marginTop:60}} onPress={() => props.navigation.navigate('RestoreWalletBySecondaryDevice')}>
						<View style={{ flexDirection: 'row' }}>
							<Image style={{ resizeMode: 'contain', width: 25, height: 30 }} source={require('../assets/images/icons/icon_secondarydevice.png')} />
							<View style={{ justifyContent: 'space-between', flex: 1 }}>
								<Text style={styles.listElementsTitle}>Secondary Device (One)</Text>
								<Text style={styles.listElementsInfo}>
									You need your secondary device with you to scan the QR code.
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
						</View>
					</TouchableOpacity>
					<View style={{ borderBottomColor: Colors.backgroundColor, borderBottomWidth: 5 }} />
					<TouchableOpacity style={styles.listElements}>
						<View style={{ flexDirection: 'row' }}>
							<Image style={{ resizeMode: 'contain', width: 25, height: 30 }} source={require('../assets/images/icons/icon_contact.png')} />
							<View style={{ justifyContent: 'space-between', flex: 1 }}>
								<Text style={styles.listElementsTitle}>Trusted Contacts (Two)</Text>
								<Text style={styles.listElementsInfo}>
									Select one or two contacts with whom you have stored your recover secret.
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
						</View>
					</TouchableOpacity>

					<View style={{ borderBottomColor: Colors.backgroundColor, borderBottomWidth: 5 }} />
					<TouchableOpacity style={styles.listElements} onPress={() => props.navigation.navigate('RestoreWalletUsingDocuments')}>
						<View style={{ flexDirection: 'row' }}>
							<Image style={{ resizeMode: 'contain', width: 25, height: 30 }} source={require('../assets/images/icons/files-and-folders-2.png')} />
							<View style={{ justifyContent: 'space-between', flex: 1 }}>
								<Text style={styles.listElementsTitle}>Personal Copies (Two)</Text>
								<Text style={styles.listElementsInfo}>
									Select one or two of the sources where you have kept the Recovery Secret.
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
						</View>
					</TouchableOpacity>
				</ScrollView>
			</View>
		</SafeAreaView>
	);

}

const styles = StyleSheet.create({
	listElements: {
		margin: 20,
		marginTop: 10,
		marginBottom: 10,
		paddingTop: 20,
		paddingBottom: 20,
		justifyContent: 'center',
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
		fontFamily: Fonts.FiraSansRegular
	},
	listElementIcon: {
		paddingRight: 5,
		marginLeft: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
