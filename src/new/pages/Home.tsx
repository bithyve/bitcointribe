import React, { useState, useEffect } from 'react';
import {
	View,
	StyleSheet,
	StatusBar,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	TextInput,
	ImageBackground,
	Platform,
	ScrollView,
	KeyboardAvoidingView,
} from 'react-native';
import CardView from 'react-native-cardview';
import Fonts from "./../common/Fonts";
import BottomSheet from 'reanimated-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from "react-native-vector-icons/Ionicons"
import Colors from '../common/Colors';
import DeviceInfo from 'react-native-device-info';
import ToggleSwitch from "../components/ToggleSwitch";
import Entypo from "react-native-vector-icons/Entypo";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyles from "../common/Styles";

export default function Home(props) {
	const [switchOn, setSwitchOn] = useState(true);
	const [data, setData] = useState([
		[
			{ title: 'Test Account', unit: 'tsats', amount: '400,000', account: 'Murtuza’s Test Account', accountType: 'test', bitcoinicon: require("../assets/images/icons/icon_bitcoin_test.png") },
			{ title: 'Test Account', unit: 'sats', amount: '2,000,000', account: 'Multi-factor security', accountType: 'secure', bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png") },
		],
		[
			{ title: 'Regular Account', unit: 'sats', amount: '5,000', account: 'Fast and easy', accountType: 'saving', bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png") },
			{ title: 'Saving Account', unit: 'sats', amount: '60,000', account: 'Fast and easy', accountType: 'saving', bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png") }
		],
		[
			{ title: 'Regular Account', unit: 'sats', amount: '5,000', account: 'Murtuza’s Test Account', accountType: 'regular', bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png") }
		]
	]);
	const [selected, setSelected] = useState('Transactions');
	const [bottomSheet, setBottomSheet] = useState(React.createRef());
	const [transactionData, setTransactionData] = useState([
		{
			title: 'Spending accounts', date: '30 November 2019', time: '11:00 am', price: '0.025',
			transactionStatus: 'send'
		},
		{
			title: 'Spending accounts', date: '1 November 2019', time: '11:00 am', price: '0.015',
			transactionStatus: 'receive'
		},
		{
			title: 'Spending accounts', date: '30 Jully 2019', time: '10:00 am', price: '0.125',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving accounts', date: '1 June 2019', time: '12:00 am', price: '0.5',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving accounts', date: '11 May 2019', time: '1:00 pm', price: '0.1',
			transactionStatus: 'send'
		},
		{
			title: 'Spending accounts', date: '30 November 2019', time: '11:00 am', price: '0.025',
			transactionStatus: 'send'
		},
		{
			title: 'Spending accounts', date: '1 November 2019', time: '11:00 am', price: '0.015',
			transactionStatus: 'receive'
		},
		{
			title: 'Spending accounts', date: '30 Jully 2019', time: '10:00 am', price: '0.125',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving accounts', date: '1 June 2019', time: '12:00 am', price: '0.5',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving accounts', date: '12 May 2019', time: '1:00 pm', price: '0.1',
			transactionStatus: 'send'
		}
	]);
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
	const [modaldata, setModaldata] = useState(transactionData);
	const [openmodal, setOpenmodal] = useState('close')


	function getIconByAccountType(type) {
		if (type == 'saving') {
			return require("../assets/images/icons/icon_regular.png");
		}
		else if (type == 'regular') {
			return require("../assets/images/icons/icon_regular.png")
		}
		else if (type == 'secure') {
			return require("../assets/images/icons/icon_secureaccount.png");
		}
		else if (type == 'test') {
			return require("../assets/images/icons/icon_test.png")
		}
		else {
			return require("../assets/images/icons/icon_test.png")
		}
	}

	useEffect(function () {
		bottomSheet.current.snapTo(0);
	}, []);

	function renderContent() {
		if (selected == 'Transactions') {
			return <View style={styles.modalContentContainer}>
				<FlatList
					data={modaldata}
					ItemSeparatorComponent={() => <View style={{ backgroundColor: Colors.white }}><View style={styles.separatorView} /></View>}
					renderItem={({ item }) =>
						<View style={styles.transactionModalElementView}>
							<View style={styles.modalElementInfoView}>
								<View style={{ justifyContent: "center", }}>
									<FontAwesome name={item.transactionStatus == 'receive' ? 'long-arrow-down' : 'long-arrow-up'} size={15} color={item.transactionStatus == 'receive' ? Colors.green : Colors.red} />
								</View>
								<View style={{ justifyContent: "center", marginLeft: 10 }}>
									<Text style={styles.transactionModalTitleText}>{item.title} </Text>
									<Text style={styles.transactionModalDateText}>{item.date} <Entypo size={10} name={'dot-single'} color={Colors.textColorGrey} />{item.time}</Text>
								</View>
							</View >
							<View style={styles.transactionModalAmountView}>
								<Image source={require('../assets/images/icons/icon_bitcoin_gray.png')} style={{ width: 12, height: 12, resizeMode: 'contain' }} />
								<Text style={{ ...styles.transactionModalAmountText, color: item.transactionStatus == 'receive' ? Colors.green : Colors.red, }}>{item.price}</Text>
								<Text style={styles.transactionModalAmountUnitText}>6+</Text>
							</View>
						</View >
					}
				/>
			</View>
		} else if (selected == 'Add') {
			return <View style={styles.modalContentContainer}>
				<FlatList
					data={modaldata}
					ItemSeparatorComponent={() => <View style={{ backgroundColor: Colors.white }}><View style={styles.separatorView} /></View>}
					renderItem={({ item }) =>
						<View style={styles.addModalView}>
							<View style={styles.modalElementInfoView}>
								<View style={{ justifyContent: "center", }}>
									<Image source={item.image} style={{ width: 25, height: 25 }} />
								</View>
								<View style={{ justifyContent: "center", marginLeft: 10 }}>
									<Text style={styles.addModalTitleText}>{item.title} </Text>
									<Text style={styles.addModalInfoText}>{item.info}</Text>
								</View>
							</View >
						</View >
					}
				/>
			</View>
		}
		else if (selected == 'QR') {
			return <View style={styles.modalContentContainer}>
				<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
					<ScrollView style={styles.qrModalScrollView}>
						<View style={styles.qrModalImageNTextInputView}>
							<ImageBackground source={require('../assets/images/icons/iPhone-QR.png')} style={styles.qrModalImage} >
								<View style={{ flexDirection: 'row', paddingTop: 10, paddingRight:5, paddingLeft:10, width:'100%' }}>
									<View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderTopWidth: 1 }} />
									<View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
								</View>
								<View style={{ marginTop:'auto', flexDirection: 'row', paddingBottom: 5, paddingRight:5, paddingLeft:10, width:'100%',}}>
									<View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
									<View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
								</View>
							</ImageBackground>
							<TextInput placeholder={'Enter Recipients Address'} placeholderTextColor={Colors.borderColor} style={styles.qrModalTextInput} />
						</View>
						<View style={styles.qrModalInfoView}>
							<View style={{ marginRight: 15 }}>
								<Text style={styles.qrModalInfoTitleText}>Qr</Text>
								<Text style={styles.qrModalInfoInfoText}>Scan a QR code to send money or receive information from another Hexa wallet</Text>
							</View>
							<Ionicons
								name="ios-arrow-forward"
								color={Colors.textColorGrey}
								size={15}
								style={{ alignSelf: 'center' }}
							/>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>;
		}
	}

	function renderHeader() {
		return <TouchableOpacity activeOpacity={10} onPress={() => openCloseModal()} style={styles.modalHeaderContainer}>
			<View style={styles.modalHeaderHandle} />
			<Text style={styles.modalHeaderTitleText}>{selected}</Text>
		</TouchableOpacity>
	}

	function openCloseModal() {
		if (openmodal == 'closed') {
			setOpenmodal('half');
		}
		if (openmodal == 'half') {
			setOpenmodal('full');
		}
		if (openmodal == 'full') {
			setOpenmodal('closed');
		}
	}

	useEffect(() => {
		if (openmodal == 'closed') {
			bottomSheet.current.snapTo(0)
		}
		if (openmodal == 'half') {
			bottomSheet.current.snapTo(1)
		}
		if (openmodal == 'full') {
			bottomSheet.current.snapTo(2)
		}
	}, [openmodal]);

	useEffect(() => {
		if (openmodal == 'closed') {
			bottomSheet.current.snapTo(0)
		}
		if (openmodal == 'half') {
			bottomSheet.current.snapTo(1)
		}
		if (openmodal == 'full') {
			bottomSheet.current.snapTo(2)
		}
	}, []);

	async function selectTab(tabTitle) {
		if (tabTitle == 'Transactions') setModaldata(transactionData);
		else if (tabTitle == 'Add') setModaldata(addData);
		else if (tabTitle == 'QR') setModaldata(transactionData);
		setSelected(tabTitle);
	}

	return (
		<ImageBackground
			source={require('./../assets/images/home-bg.png')}
			style={{ width: '100%', height: '100%', flex: 1, paddingTop: Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp('5%') : 0, }}
			imageStyle={{ resizeMode: "stretch" }}
		>
			<StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
			<View style={{ flex: 3.8, }}>
				<View style={styles.headerViewContainer}>
					<View style={{ flexDirection: 'row' }}>
						<View style={styles.headerTitleViewContainer}>
							<Text style={styles.headerTitleText}>Murtuza’s Wallet</Text>
							<View style={{ flexDirection: "row", alignItems: 'flex-end' }}>
								<Image
									style={CommonStyles.homepageAmountImage}
									source={require('./../assets/images/icons/icon_bitcoin_light.png')} />
								<Text style={{ ...CommonStyles.homepageAmountText, color: Colors.white, }}>20,65,000</Text>
								<Text style={{ ...CommonStyles.homepageAmountUnitText, color: Colors.white, }}>sats</Text>
							</View>
						</View>
						<View style={styles.headerToggleSwitchContainer}>
							<ToggleSwitch onpress={() => { setSwitchOn(!switchOn); }} toggle={switchOn} />
						</View>
					</View>
					<View style={{ flexDirection: 'row' }}>
						<View style={{ flex: 7 }}>
							<Text style={styles.headerInfoText}>
								<Text style={{ fontStyle: 'italic' }}>Great!! </Text>
								The wallet backup is secure. Keep an eye on the health of the backup here
                        	</Text>
							<TouchableOpacity onPress={()=>{props.navigation.navigate('ManageBackup')}} style={styles.headerButton}>
								<Text style={styles.headerButtonText}>Manage Backup</Text>
							</TouchableOpacity>
						</View>
						<View style={{ flex: 4, alignItems: 'flex-end' }}>
							<Image
								style={styles.headerShieldImage}
								source={require('./../assets/images/icons/sheild.png')} />
						</View>
					</View>
				</View>
			</View>
			<View style={{ flex: 7 }}>
				<View style={styles.cardViewContainer}>
					<FlatList
						horizontal
						showsHorizontalScrollIndicator={false}
						data={data}
						renderItem={(Items) => {
							return <View style={{ flexDirection: 'column' }} >
								{Items.item.map((value) => {
									return <TouchableOpacity onPress={() => { alert('test') }}>
										<CardView cornerRadius={10} style={styles.card}>
											<View style={{ flexDirection: 'row', }}>
												<Image style={{ width: wp('10%'), height: wp('10%') }} source={getIconByAccountType(value.accountType)} />
												{value.accountType == 'secure' ? (<TouchableOpacity onPress={() => { alert('2FA') }} style={{ marginLeft: 'auto' }}>
													<Text style={{ color: Colors.blue, fontSize: RFValue(11, 812), fontFamily: Fonts.FiraSansRegular }}>2FA</Text>
												</TouchableOpacity>) : null}

											</View>
											<View style={{ flex: 1, justifyContent: 'flex-end' }}>
												<Text style={styles.cardTitle}>{value.title}</Text>
												<Text style={{ color: Colors.textColorGrey, fontSize: RFValue(11, 812), }}>{value.account}</Text>
												<View style={{ flexDirection: "row", alignItems: 'flex-end', marginTop: hp('1%') }}>
													<Image
														style={styles.cardBitCoinImage}
														source={value.bitcoinicon} />
													<Text style={styles.cardAmountText}>{value.amount}</Text>
													<Text style={styles.cardAmountUnitText}>{value.unit}</Text>
												</View>
											</View>
										</CardView>
									</TouchableOpacity>
								})
								}
							</View>
						}
						}
					/>
				</View>
			</View>
			<BottomSheet
				enabledInnerScrolling={true}
				ref={bottomSheet}
				snapPoints={[Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('12%') : Platform.OS == "android" ? hp('18%') : hp('13%'), hp('50%'), hp('90%')]}
				renderContent={renderContent}
				renderHeader={renderHeader}
			/>
			<View style={styles.bottomTabBarContainer}>
				<TouchableOpacity onPress={() => selectTab('Transactions')} style={styles.tabBarTabView}>
					{selected == 'Transactions' ?
						(<View style={styles.activeTabStyle}>
							<Image source={require('../assets/images/HomePageIcons/icon_transactions_active.png')} style={{ width: 25, height: 25, resizeMode: 'contain', }} />
							<Text style={styles.activeTabTextStyle}>transactions</Text>
						</View>) :
						(<View style={{ flexDirection: 'row', }}>
							<Image source={require('../assets/images/HomePageIcons/icon_transactions.png')} style={styles.tabBarImage} />
						</View>)
					}
				</TouchableOpacity>
				<TouchableOpacity onPress={() => selectTab('Add')} style={styles.tabBarTabView}>
					{selected == 'Add' ?
						(<View style={styles.activeTabStyle}>
							<Image source={require('../assets/images/HomePageIcons/icon_add_active.png')} style={styles.tabBarImage} />
							<Text style={styles.activeTabTextStyle}>add</Text>
						</View>) :
						(<View style={{ flexDirection: 'row', }}>
							<Image source={require('../assets/images/HomePageIcons/icon_add.png')} style={styles.tabBarImage} />
						</View>)
					}
				</TouchableOpacity>
				<TouchableOpacity onPress={() => selectTab('QR')} style={styles.tabBarTabView}>
					{selected == 'QR' ?
						(<View style={styles.activeTabStyle}>
							<Image source={require('../assets/images/HomePageIcons/icon_qr_active.png')} style={styles.tabBarImage} />
							<Text style={styles.activeTabTextStyle}>qr</Text>
						</View>) :
						(<View style={{ flexDirection: 'row', }}>
							<Image source={require('../assets/images/HomePageIcons/icon_qr.png')} style={styles.tabBarImage} />
						</View>)
					}
				</TouchableOpacity>
				<TouchableOpacity style={styles.tabBarTabView} onPress={() => {
					setOpenmodal('closed');
					bottomSheet.current.snapTo(0);
				}}>
					<View style={{ flexDirection: 'row', }}>
						<Image source={require('../assets/images/HomePageIcons/icon_more.png')} style={styles.tabBarImage} />
					</View>
				</TouchableOpacity>
			</View>
		</ImageBackground>

	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	card: {
		margin: 0,
		width: wp('42.6%'),
		height: hp('20.1%'),
		borderColor: Colors.borderColor,
		borderWidth: 1,
		marginRight: wp('2%'),
		marginBottom: wp('2%'),
		padding: wp('3'),
		backgroundColor: Colors.white
	},
	cardTitle: {
		color: Colors.blue,
		fontSize: RFValue(10, 812),
	},
	activeTabStyle: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.backgroundColor,
		padding: 7,
		borderRadius: 7,
		width: 120,
		height: 40,
		justifyContent: 'center'
	},
	activeTabTextStyle: {
		marginLeft: 8,
		color: Colors.blue,
		fontFamily: Fonts.firasonsRegular,
		fontSize: RFValue(12, 812),
	},
	bottomTabBarContainer: {
		backgroundColor: Colors.white,
		justifyContent: 'space-evenly',
		display: 'flex',
		marginTop: 'auto',
		zIndex: 99999,
		flexDirection: 'row',
		height: hp('12%'),
		alignItems: 'center',
		borderLeftColor: Colors.borderColor,
		borderLeftWidth: 1,
		borderRightColor: Colors.borderColor,
		borderRightWidth: 1,
		borderTopColor: Colors.borderColor,
		borderTopWidth: 1,
		paddingBottom: DeviceInfo.hasNotch() ? hp('4%') : 0
	},
	cardViewContainer: {
		height: '100%',
		backgroundColor: Colors.backgroundColor,
		marginTop: hp('4%'),
		borderTopLeftRadius: 25,
		shadowColor: 'black',
		shadowOpacity: 0.4,
		shadowOffset: { width: 2, height: -1, },
		paddingTop: hp('1.5%'),
		paddingBottom: hp('7%'),
		width: '100%',
		overflow: 'hidden',
		paddingLeft: wp('3%')
	},
	modalHeaderContainer: {
		backgroundColor: Colors.white,
		marginTop: 'auto',
		flex: 1,
		height: 40,
		borderTopLeftRadius: 10,
		borderLeftColor: Colors.borderColor,
		borderLeftWidth: 1,
		borderTopRightRadius: 10,
		borderRightColor: Colors.borderColor,
		borderRightWidth: 1,
		borderTopColor: Colors.borderColor,
		borderTopWidth: 1,
		zIndex: 9999
	},
	modalHeaderHandle: {
		width: 50,
		height: 5,
		backgroundColor: Colors.borderColor,
		borderRadius: 10,
		alignSelf: 'center',
		marginTop: 7
	},
	modalHeaderTitleText: {
		color: Colors.blue,
		fontSize: RFValue(18, 812),
		fontFamily: Fonts.firasonsRegular,
		marginLeft: 15
	},
	modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.white,
		paddingBottom: hp('10%')
	},
	headerViewContainer: {
		marginTop: hp('3%'),
		marginLeft: 20,
		marginRight: 20
	},
	headerTitleViewContainer: {
		flex: 7,
		marginBottom: hp('3%'),
		justifyContent: 'center'
	},
	headerTitleText: {
		color: Colors.white,
		fontFamily: Fonts.FiraSansRegular,
		fontSize: RFValue(25, 812),
		display: 'flex',
		marginBottom: hp('0.8%')
	},
	headerToggleSwitchContainer: {
		flex: 3,
		alignItems: "flex-end",
		justifyContent: 'center',
		marginBottom: hp('3%'),
	},
	headerInfoText: {
		fontSize: RFValue(12, 812),
		color: Colors.white,
		marginBottom: hp('4%'),
		width: wp('50%')
	},
	headerButton: {
		backgroundColor: Colors.homepageButtonColor,
		height: hp('5%'),
		width: wp('30%'),
		borderRadius: 5,
		alignSelf: 'flex-start',
		justifyContent: 'center',
		alignItems: 'center'
	},
	headerButtonText: {
		fontFamily: Fonts.FiraSansMedium,
		fontSize: RFValue(13, 812),
		color: Colors.white
	},
	headerShieldImage: {
		width: wp('16%'),
		height: wp('25%'),
		resizeMode: 'contain'
	},
	cardBitCoinImage: {
		width: wp('3%'),
		height: wp('3%'),
		marginRight: 5,
		marginBottom: wp('0.5%'),
		resizeMode: 'contain'
	},
	cardAmountText: {
		color: Colors.black,
		fontFamily: Fonts.FiraSansRegular,
		fontSize: RFValue(17, 812),
		marginRight: 5
	},
	cardAmountUnitText: {
		color: Colors.textColorGrey,
		fontFamily: Fonts.FiraSansRegular,
		fontSize: RFValue(11, 812),
		marginBottom: 2
	},
	tabBarImage: {
		width: 21,
		height: 21,
		resizeMode: 'contain',
	},
	tabBarTabView: {
		padding: wp('5%')
	},
	separatorView: {
		marginLeft: 15,
		marginRight: 15,
		height: 2,
		backgroundColor: Colors.backgroundColor
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
		fontSize: RFValue(12, 812),
		marginBottom: 3,
		fontFamily: Fonts.FiraSansRegular
	},
	transactionModalDateText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(10, 812),
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
		fontSize: RFValue(20, 812),
		fontFamily: Fonts.OpenSans,
	},
	transactionModalAmountUnitText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(10, 812),
		fontFamily: Fonts.OpenSans
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
	qrModalScrollView: {
		display: 'flex',
		backgroundColor: Colors.white,
	},
	qrModalImageNTextInputView: {
		marginTop: 15,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomColor: Colors.backgroundColor,
		borderBottomWidth: 3
	},
	qrModalImage: {
		width: wp('72%'),
		height: wp('72%'),
		borderRadius: 20,
		borderWidth: 2.5,
		borderColor: Colors.backgroundColor
	},
	qrModalTextInput: {
		borderRadius: 20,
		borderWidth: 1,
		borderColor: Colors.backgroundColor,
		width: wp('72%'),
		height: 60,
		marginTop: 25,
		marginBottom: 25,
		paddingLeft: 15,
		paddingRight: 15,
		fontSize: RFValue(11, 812),
		fontFamily: Fonts.FiraSansMedium
	},
	qrModalInfoView: {
		paddingTop: 20,
		paddingBottom: 20,
		paddingLeft: 30,
		paddingRight: 30,
		flexDirection: 'row',
		alignSelf: 'center'
	},
	qrModalInfoTitleText: {
		color: Colors.blue,
		fontSize: RFValue(18, 812)
	},
	qrModalInfoInfoText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(12, 812)
	}

});
