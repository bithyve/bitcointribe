import React, { useState, useEffect } from 'react';
import {
	StyleSheet,
	View,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	StatusBar,
	Text,
	Image,
	Platform,
	TextInput,
	KeyboardAvoidingView
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Feather from "react-native-vector-icons/Feather";
import HeaderTitle from "../components/HeaderTitle";
import BottomInfoBox from '../components/BottomInfoBox';

export default function RestoreSelectedContactsList(props) {
	const [walletNameBottomSheet, setWalletNameBottomSheet] = useState(React.createRef());
	const [successMessageBottomSheet, setSuccessMessageBottomSheet] = useState(React.createRef());
	const [walletNameOpenModal, setWalletNameOpenModal] = useState('half')
	const [inputStyle, setInputStyle] = useState(styles.inputBox);
	const [walletName, setWalletName] = useState('');
	const [isContactSelected, setIsContactSelected] = useState(true);

	function openCloseModal() {
		if (walletNameOpenModal == 'closed') {
			setWalletNameOpenModal('half');
		}
		if (walletNameOpenModal == 'half') {
			setWalletNameOpenModal('full');
		}
		if (walletNameOpenModal == 'full') {
			setWalletNameOpenModal('closed');
		}
	}

	useEffect(() => {
		if (walletNameOpenModal == 'closed') {
			walletNameBottomSheet.current.snapTo(0)
		}
		if (walletNameOpenModal == 'half') {
			walletNameBottomSheet.current.snapTo(1)
		}
		if (walletNameOpenModal == 'full') {
			walletNameBottomSheet.current.snapTo(2)
		}
	}, [walletNameOpenModal]);

	function renderContent() {
		return <KeyboardAvoidingView style={styles.modalContentContainer} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
			<View style={{ height: '100%' }}>
				<View style={{ display:"flex" }}>
					<View style={{paddingTop:wp('8%'), paddingLeft:wp('7%'), paddingRight:wp('7%'), paddingBottom:wp('8%'), }}>
					<Text style={{ color: Colors.blue, fontSize: RFValue(18, 812), fontFamily: Fonts.FiraSansMedium, marginTop: 10 }}>Type in the name{"\n"}of your wallet</Text>
					<Text style={{ ...styles.modalInfoText, marginTop: 7 }}>Your contacts will see this to <Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold' }}>identify you</Text></Text>
					</View>
					<TextInput
						style={{...inputStyle, marginTop:wp('2%'),  marginLeft:wp('7%'), marginRight:wp('7%'), marginBottom:wp('10%') }}
						placeholder={'Enter a name for wallet'}
						placeholderTextColor={Colors.borderColor}
						value={walletName}
						onChangeText={(text) => setWalletName(text)}
						onFocus={() => { setInputStyle(styles.inputBoxFocused); setWalletNameOpenModal('full') }}
						onBlur={() => { setInputStyle(styles.inputBox); setWalletNameOpenModal('half') }}
					/>
				</View>
				<View style={{  flexDirection:'row', marginBottom:Platform.OS=="ios" && DeviceInfo.hasNotch()? hp('2%'):0}} >
					{walletName ?
						<TouchableOpacity
							onPress={() => { walletNameBottomSheet.current.snapTo(0); successMessageBottomSheet.current.snapTo(1) }}
							style={{...styles.proceedButtonView,}}
						>
							<Text style={styles.proceedButtonText}>Proceed</Text>
						</TouchableOpacity>
						:
						<View style={{ flex:1 }}>
							<BottomInfoBox title={'Name of your existing wallet'} infoText={'This can be any name, preferably what you were using for your wallet previously'} />
						</View>
					}
				</View>
			</View>
		</KeyboardAvoidingView>
	}

	function renderHeader() {
		return <TouchableOpacity activeOpacity={10} onPress={() => openCloseModal()} style={styles.modalHeaderContainer}>
			<View style={styles.modalHeaderHandle} />
		</TouchableOpacity>
	}

	function renderSuccessContent() {
		return <View style={{ ...styles.modalContentContainer, height: '100%' }}>
			<View style={{ height: '100%' }}>
				<View style={styles.successModalHeaderView}>
					<Text style={styles.modalTitleText}>Account Successfully{"\n"}Restored</Text>
					<Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>Congratulations! You can now use{"\n"}your <Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold' }}>Wallet</Text></Text>
				</View>
				<View style={styles.successModalAmountView}>
					<Text style={styles.successModalWalletNameText}>Pam’s Wallet</Text>
					<View style={{ flexDirection: "row", alignItems: 'flex-end', }}>
						<Image
							style={styles.successModalAmountImage}
							source={require('./../assets/images/icons/icon_bitcoin_gray.png')} />
						<Text style={styles.successModalAmountText}>2,065,000</Text>
						<Text style={styles.successModalAmountUnitText}>sats</Text>
					</View>
				</View>
				<View style={styles.successModalAmountInfoView}>
					<Text style={styles.modalInfoText}>Your wallet has been successfully restored</Text>
				</View>
				<View style={{ flexDirection: 'row', marginTop: 'auto' }} >
					<TouchableOpacity
						onPress={() => { props.navigation.navigate('Home') }}
						style={styles.successModalButtonView}
					>
						<Text style={styles.proceedButtonText}>Go to Wallet</Text>
					</TouchableOpacity>
					<Image source={require('../assets/images/icons/illustration.png')} style={styles.successModalImage} />
				</View>
			</View>
		</View>
	}

	return (
		<View style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 0, }} />
			<StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
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
				<HeaderTitle
					firstLineTitle={'Restore wallet using'}
					secondLineTitle={'Recovery Secrets'}
					infoTextNormal={"These are the Recovery Secrets that you have stored in five places. "}
					infoTextBold={"You need three of them restore your wallet"}
				/>
				<TouchableOpacity style={{ ...styles.listElements, marginTop: 60 }} onPress={() => props.navigation.navigate('RestoreWalletBySecondaryDevice')}>
					<Image style={styles.iconImage} source={require('../assets/images/icons/icon_secondarydevice.png')} />
					<View style={styles.textInfoView}>
						<Text style={styles.listElementsTitle}>Secondary Device (One)</Text>
						<Text style={styles.listElementsInfo}>
							You need your secondary device with you to scan the QR code.
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
				<View style={styles.separator} />
				<TouchableOpacity onPress={() => props.navigation.navigate('RestoreWalletByContacts')} >
					<View style={{ ...styles.listElements, marginBottom: isContactSelected ? 0 : 10, }}>
						<Image style={styles.iconImage} source={require('../assets/images/icons/icon_contact.png')} />
						<View style={styles.textInfoView}>
							<Text style={styles.listElementsTitle}>Trusted Contacts (Two)</Text>
							<Text style={styles.listElementsInfo}>
								Select one or two contacts with whom you have stored your recover secret.
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
					</View>
					{isContactSelected &&
						<View style={{}}>
							<View style={{ ...styles.selectedContactView, marginBottom: 15 }}>
								<Text style={styles.selectedContactName}>
									Pamela <Text style={{ fontFamily: Fonts.FiraSansMedium }}>Aalto</Text>
								</Text>
								<View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
									<View style={styles.secretReceivedView}>
										<Text style={styles.secretReceivedText}>Secret Receieved</Text>
									</View>
									<View style={styles.secretReceivedCheckSignView}>
										<Feather name={'check'} size={12} color={Colors.darkGreen} />
									</View>
								</View>
							</View>
							<View style={{ ...styles.selectedContactView, marginBottom: 20 }}>
								<Text style={styles.selectedContactName}>
									Sophie <Text style={{ fontFamily: Fonts.FiraSansMedium }}>Babel</Text>
								</Text>
								<View style={{ flexDirection: 'row', marginLeft: 'auto', }}>
									<View style={styles.dotsView} />
									<View style={styles.dotsView} />
									<View style={styles.dotsView} />
								</View>
							</View>
						</View>
					}
				</TouchableOpacity>

				<View style={styles.separator} />
				<TouchableOpacity style={styles.listElements} onPress={() => props.navigation.navigate('RestoreWalletUsingDocuments')}>
					<Image style={styles.iconImage} source={require('../assets/images/icons/files-and-folders-2.png')} />
					<View style={styles.textInfoView}>
						<Text style={styles.listElementsTitle}>Personal Copies (Two)</Text>
						<Text style={styles.listElementsInfo}>Select one or two of the sources where you have kept the Recovery Secret.</Text>
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
			</ScrollView>
			<BottomSheet
				enabledInnerScrolling={true}
				ref={walletNameBottomSheet}
				snapPoints={[0, Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('50%'): hp('60%'), Platform.OS == 'ios' ? hp('95%') : hp('55%')]}
				renderContent={renderContent}
				renderHeader={renderHeader}
			/>
			<BottomSheet
				enabledInnerScrolling={true}
				ref={successMessageBottomSheet}
				snapPoints={[Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0, hp('60%')]}
				renderContent={renderSuccessContent}
				renderHeader={renderHeader}
			/>
		</View>
	);

}

const styles = StyleSheet.create({
	listElements: {
		flexDirection: 'row',
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
		marginBottom: 5,
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
	inputBox: {
		borderColor: Colors.borderColor,
		borderWidth: 0.5,
		borderRadius: 10,
		width:wp('85%'),
		height: 50,
		paddingLeft: 15,
		fontSize: RFValue(13, 812),
		color: Colors.textColorGrey,
		fontFamily: Fonts.FiraSansRegular,
	},
	inputBoxFocused: {
		borderColor: Colors.borderColor,
		borderWidth: 0.5,
		borderRadius: 10,
		width:wp('85%'),
		height: 50,
		paddingLeft: 15,
		fontSize: RFValue(13, 812),
		color: Colors.textColorGrey,
		elevation: 10,
		shadowColor: Colors.borderColor,
		shadowOpacity: 10,
		shadowOffset: { width: 2, height: 2 },
		backgroundColor: Colors.white,
		fontFamily: Fonts.FiraSansRegular,
	},
	proceedButtonView: {
		height: wp('13%'),
		width: wp('30%'),
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 8,
		elevation: 10,
		shadowColor: Colors.shadowBlue,
		shadowOpacity: 10,
		shadowOffset: { width: 0, height: 10 },
		backgroundColor: Colors.blue,
		marginRight: 20,
		marginLeft: 20
	},
	proceedButtonText: {
		color: Colors.white,
		fontSize: RFValue(13, 812),
		fontFamily: Fonts.FiraSansMedium
	},
	bottomNoteText: {
		color: Colors.blue,
		fontSize: RFValue(13, 812),
		marginBottom: 5,
		fontFamily: Fonts.FiraSansRegular
	},
	bottomNoteInfoText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(12, 812),
		fontFamily: Fonts.FiraSansRegular
	},
	dotsView: {
		backgroundColor: Colors.borderColor,
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 5
	},
	separator: {
		borderBottomColor: Colors.backgroundColor,
		borderBottomWidth: 5
	},
	iconImage: {
		resizeMode: 'contain',
		width: 25,
		height: 30,
		alignSelf: 'center'
	},
	textInfoView: {
		justifyContent: 'space-between',
		flex: 1
	},
	modalTitleText: {
		color: Colors.blue,
		fontSize: RFValue(18, 812),
		fontFamily: Fonts.FiraSansMedium,
	},
	modalInfoText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(12, 812),
		fontFamily: Fonts.FiraSansRegular,
	},
	modalHeaderContainer: {
		paddingTop: 20
	},
	modalHeaderHandle: {
		width: 50,
		height: 5,
		backgroundColor: Colors.borderColor,
		borderRadius: 10,
		alignSelf: 'center',
		marginTop: 7,
		marginBottom: 7
	},
	successModalHeaderView: {
		marginRight: wp('10%'),
		marginLeft: wp('10%'),
		marginTop: wp('10%'),
		flex: 1.7
	},
	successModalAmountView: {
		flex: 2,
		justifyContent: 'center',
		marginRight: wp('10%'),
		marginLeft: wp('10%'),
	},
	successModalWalletNameText: {
		color: Colors.black,
		fontSize: RFValue(25, 812),
		fontFamily: Fonts.FiraSansRegular
	},
	successModalAmountImage: {
		width: wp('3%'),
		height: wp('3%'),
		marginRight: 5,
		marginBottom: wp('1%'),
		resizeMode: 'contain',
	},
	successModalAmountText: {
		color: Colors.black,
		fontFamily: Fonts.FiraSansRegular,
		fontSize: RFValue(21, 812),
		marginRight: 5
	},
	successModalAmountUnitText: {
		color: Colors.borderColor,
		fontFamily: Fonts.FiraSansRegular,
		fontSize: RFValue(11, 812),
		marginBottom: 3
	},
	successModalAmountInfoView: {
		flex: 0.4,
		marginRight: wp('10%'),
		marginLeft: wp('10%'),
	},
	successModalButtonView: {
		height: wp('13%'),
		width: wp('35%'),
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 8,
		elevation: 10,
		shadowColor: Colors.shadowBlue,
		shadowOpacity: 10,
		shadowOffset: { width: 0, height: 10 },
		backgroundColor: Colors.blue,
		alignSelf: 'center',
		marginRight: wp('10%'), marginLeft: wp('10%'),
	},
	successModalImage: {
		width: wp('25%'),
		height: hp('18%'),
		marginLeft: 'auto',
		resizeMode: "cover"
	},
	selectedContactView: {
		marginLeft: 20,
		marginRight: 20,
		height: 50,
		borderColor: Colors.borderColor,
		borderWidth: 1,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15
	},
	selectedContactName: {
		marginLeft: 10,
		fontSize: RFValue(13, 812),
		fontFamily: Fonts.FiraSansRegular,
		color: Colors.textColorGrey
	},
	secretReceivedView: {
		borderRadius: 5,
		height: 25,
		backgroundColor: Colors.green,
		paddingLeft: 10,
		paddingRight: 10,
		justifyContent: 'center',
		alignItems: 'center'
	},
	secretReceivedText: {
		color: Colors.darkGreen,
		fontSize: RFValue(9, 812),
		fontFamily: Fonts.FiraSansMedium
	},
	secretReceivedCheckSignView: {
		backgroundColor: Colors.green,
		borderRadius: 25 / 2,
		height: 25,
		width: 25,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 5
	}
});
