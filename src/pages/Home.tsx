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
	ScrollView
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
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useSelector } from "react-redux";
import { Database } from '../common/interfaces/Interfaces';

export default function Home() {
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
			title: 'Spending Accounts', date: '30 November 2019', time: '11 am', price: '0.025',
			transactionStatus: 'send'
		},
		{
			title: 'Spending Accounts', date: '1 November 2019', time: '11 am', price: '0.015',
			transactionStatus: 'receive'
		},
		{
			title: 'Spending Accounts', date: '30 Jully 2019', time: '10 am', price: '0.125',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving Accounts', date: '1 June 2019', time: '12 am', price: '0.5',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving Accounts', date: '11 May 2019', time: '1 Pm', price: '0.1',
			transactionStatus: 'send'
		},
		{
			title: 'Spending Accounts', date: '30 November 2019', time: '11 am', price: '0.025',
			transactionStatus: 'send'
		},
		{
			title: 'Spending Accounts', date: '1 November 2019', time: '11 am', price: '0.015',
			transactionStatus: 'receive'
		},
		{
			title: 'Spending Accounts', date: '30 Jully 2019', time: '10 am', price: '0.125',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving Accounts', date: '1 June 2019', time: '12 am', price: '0.5',
			transactionStatus: 'receive'
		},
		{
			title: 'Saving Accounts', date: '12 May 2019', time: '1 Pm', price: '0.1',
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
	const [openmodal, setOpenmodal] = useState('closed')


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
			return <View style={{ height: '100%', backgroundColor: Colors.white, paddingBottom: hp('10%') }}>
				<FlatList
					data={modaldata}
					ItemSeparatorComponent={() => <View style={{ backgroundColor: Colors.white }}><View style={{ marginLeft: 15, marginRight: 15, height: 2, backgroundColor: Colors.backgroundColor }} /></View>}
					renderItem={({ item }) =>
						<View style={{ backgroundColor: Colors.white, padding: 10, flexDirection: 'row', display: 'flex', justifyContent: "space-between" }}>
							<View style={{ padding: 10, flexDirection: 'row', justifyContent: "center", alignItems: 'center' }}>
								<View style={{ justifyContent: "center", }}>
									<FontAwesome name={item.transactionStatus == 'receive' ? 'long-arrow-down' : 'long-arrow-up'} size={15} color={item.transactionStatus == 'receive' ? Colors.green : Colors.red} />
								</View>
								<View style={{ justifyContent: "center", marginLeft: 10 }}>
									<Text style={{ color: Colors.blue, fontSize: RFValue(12, 812), marginBottom: 3, fontFamily: Fonts.FiraSansRegular }}>{item.title} </Text>
									<Text style={{ color: Colors.textColorGrey, fontSize: RFValue(10, 812), fontFamily: Fonts.FiraSansRegular }}>{item.date} <Entypo size={10} name={'dot-single'} color={Colors.textColorGrey} />{item.time}</Text>
								</View>
							</View >
							<View style={{ padding: 10, flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
								<Image source={require('../assets/images/icons/icon_bitcoin_gray.png')} style={{ width: 10, height: 10 }} />
								<Text style={{ marginLeft: 5, marginRight: 5, color: item.transactionStatus == 'receive' ? Colors.green : Colors.red, fontSize: RFValue(20, 812), fontFamily: Fonts.OpenSans }}>{item.price}</Text>
								<Text style={{ color: Colors.textColorGrey, fontSize: RFValue(10, 812), fontFamily: Fonts.OpenSans }}>6+</Text>
							</View>
						</View >
					}
				/>
			</View>
		} else if (selected == 'Add') {
			return <View style={{ height: '100%', backgroundColor: Colors.white, paddingBottom: hp('10%') }}>
				<FlatList
					data={modaldata}
					ItemSeparatorComponent={() => <View style={{ backgroundColor: Colors.white }}><View style={{ marginLeft: 15, marginRight: 15, height: 2, backgroundColor: Colors.backgroundColor }} /></View>}
					renderItem={({ item }) =>
						<View style={{ backgroundColor: Colors.white, padding: 7, flexDirection: 'row', display: 'flex', justifyContent: "space-between" }}>
							<View style={{ padding: 10, flexDirection: 'row', justifyContent: "center", alignItems: 'center' }}>
								<View style={{ justifyContent: "center", }}>
									<Image source={item.image} style={{ width: 25, height: 25 }} />
								</View>
								<View style={{ justifyContent: "center", marginLeft: 10 }}>
									<Text style={{ color: Colors.blue, fontSize: RFValue(14, 812), }}>{item.title} </Text>
									<Text style={{ color: Colors.textColorGrey, fontSize: RFValue(11, 812), }}>{item.info}</Text>
								</View>
							</View >
						</View >
					}
				/>
			</View>
		}
		else if (selected == 'Scan Qr Code') {
			return <View style={{ backgroundColor: Colors.white, height: '100%', paddingBottom: hp('10%') }}>
				<ScrollView style={{ display: 'flex', backgroundColor: Colors.white, }}>
					<View style={{ marginTop: 15, justifyContent: 'center', alignItems: 'center', borderBottomColor: Colors.backgroundColor, borderBottomWidth: 3 }}
					><Image source={require('../assets/images/icons/iPhone-QR.png')} style={{ width: wp('72%'), height: wp('72%'), borderRadius: 20, borderWidth: 2.5, borderColor: Colors.backgroundColor }} />
						<TextInput placeholder={'Enter Recipients Address'} placeholderTextColor={Colors.lightBlue} style={{ borderRadius: 20, borderWidth: 1, borderColor: Colors.backgroundColor, width: wp('72%'), height: 60, marginTop: 25, marginBottom: 25, paddingLeft: 15, paddingRight: 15, fontSize: RFValue(11, 812), fontFamily: Fonts.FiraSansMedium }} />
					</View>
					<View style={{ paddingTop: 20, paddingBottom: 20, paddingLeft: 30, paddingRight: 30, flexDirection: 'row', alignSelf: 'center' }}>
						<View style={{ marginRight: 15 }}>
							<Text style={{ color: Colors.blue, fontSize: RFValue(18, 812) }}>Qr</Text>
							<Text style={{ color: Colors.textColorGrey, fontSize: RFValue(12, 812) }}>Scan a QR code to send money or receive information from another Hexa wallet</Text>
						</View>
						<Ionicons
							name="ios-arrow-forward"
							color={Colors.textColorGrey}
							size={15}
							style={{ alignSelf: 'center' }}
						/>
					</View>
				</ScrollView>
			</View>;
		}
	}

	function renderHeader() {
		return <TouchableOpacity activeOpacity={10} onPress={() => openCloseModal()} style={{ backgroundColor: Colors.white, marginTop: 'auto', height: 40, borderTopLeftRadius: 10, borderLeftColor: Colors.borderColor, borderLeftWidth: 1, borderTopRightRadius: 10, borderRightColor: Colors.borderColor, borderRightWidth: 1, borderTopColor: Colors.borderColor, borderTopWidth: 1, zIndex: 9999 }}>
			<View style={{ width: 50, height: 5, backgroundColor: Colors.borderColor, borderRadius: 10, alignSelf: 'center', marginTop: 7 }}></View>
			<Text style={{ color: Colors.blue, fontSize: RFValue(18, 812), fontFamily: Fonts.firasonsRegular, marginLeft: 15 }}>{selected}</Text>
		</TouchableOpacity>
	}

	function openCloseModal() {
		if (openmodal == 'closed') {
			setOpenmodal('half'); bottomSheet.current.snapTo(1)
		}
		else if (openmodal == 'half') {
			setOpenmodal('full'); bottomSheet.current.snapTo(2)
		}
		else if (openmodal == 'full') {
			setOpenmodal('closed'); bottomSheet.current.snapTo(0)
		}
	}

	async function selectTab(tabTitle) {
		if (tabTitle == 'Transactions') setModaldata(transactionData);
		else if (tabTitle == 'Add') setModaldata(addData);
		else if (tabTitle == 'Scan Qr Code') setModaldata(transactionData);
		setSelected(tabTitle);
	}

	const database:Database = useSelector(state => state.storage.database);
	const walletName = database?  database.WALLET_SETUP.walletName: ""

	return (
		<ImageBackground
			source={require('./../assets/images/home-bg.png')}
			style={{ width: '100%', height: '100%', flex: 1, paddingTop: Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp('5%') : 0, }}
			imageStyle={{ resizeMode: "stretch" }}
		>
			<StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
			<View style={{ flex: 3.8 }}>
				<View style={{ marginTop: hp('3%'), marginLeft: 20, marginRight: 20 }}>
					<View style={{ flexDirection: 'row' }}>
						<View style={{ flex: 7, marginBottom: hp('3%'), justifyContent: 'center' }}>
							<Text style={{ color: Colors.white, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(25, 812), display: 'flex', marginBottom: hp('0.8%') }}>{ walletName? `${walletName}’s Wallet`: 'Hexa Wallet'}</Text>
							<View style={{ flexDirection: "row", alignItems: 'flex-end' }}>
								<Image
									style={{ width: wp('2.5%'), height: wp('2.5%'), marginRight: 5, marginBottom: 7 }}
									source={require('./../assets/images/icons/icon_bitcoin_light.png')} />
								<Text style={{ color: Colors.white, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(21, 812), marginRight: 5 }}>20,65,000</Text>
								<Text style={{ color: Colors.white, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(11, 812), marginBottom: 3 }}>sats</Text>
							</View>
						</View>
						<View style={{ flex: 3, alignItems: "flex-end", justifyContent: 'center', marginBottom: hp('3%'), }}>
							<ToggleSwitch onpress={() => { setSwitchOn(!switchOn); }} toggle={switchOn} />
						</View>
					</View>
					<View style={{ flexDirection: 'row' }}>
						<View style={{ flex: 7 }}>
							<Text style={{ fontSize: RFValue(12, 812), color: Colors.white, marginBottom: hp('5%'), width: wp('50%') }}>
								<Text style={{ fontStyle: 'italic' }}>Great!! </Text>
								The wallet backup is secure. Keep an eye on the health of the backup here
                                    </Text>
							<TouchableOpacity style={{ backgroundColor: Colors.homepageButtonColor, height: hp('5%'), width: wp('30%'), borderRadius: 5, alignSelf: 'flex-start', justifyContent: 'center', alignItems: 'center' }}>
								<Text style={{ fontFamily: Fonts.FiraSansMedium, fontSize: RFValue(13, 812), color: Colors.white }}>
									Manage Backup
                                        </Text>
							</TouchableOpacity>
						</View>
						<View style={{ flex: 4, alignItems: 'flex-end' }}>
							<Image
								style={{ width: wp('16%'), height: wp('25%'), resizeMode: 'contain' }}
								source={require('./../assets/images/icons/sheild.png')} />
						</View>
					</View>
				</View>
			</View>
			<View style={{ flex: 7 }}>
				<View style={{ height: '100%', backgroundColor: Colors.backgroundColor, marginTop: hp('4%'), borderTopLeftRadius: 25, shadowColor: 'black', shadowOpacity: 0.4, shadowOffset: { width: 2, height: -1, }, paddingTop: hp('1.5%'), paddingBottom: hp('7%'), width: '100%', overflow: 'hidden', paddingLeft: wp('3%') }}>
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
														style={{ width: wp('2%'), height: wp('2%'), marginRight: 5, marginBottom: 5 }}
														source={value.bitcoinicon} />
													<Text style={{ color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(17, 812), marginRight: 5 }}>{value.amount}</Text>
													<Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(11, 812), marginBottom: 2 }}>{value.unit}</Text>
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
				snapPoints={[Platform.OS == 'ios' && DeviceInfo.hasNotch() ? wp('27%') : Platform.OS == "android" ? wp('33%') : wp('24%'), hp('50%'), hp('90%')]}
				renderContent={renderContent}
				renderHeader={renderHeader}
			/>
			<View style={{ backgroundColor: Colors.white, justifyContent: 'space-evenly', display: 'flex', marginTop: 'auto', zIndex: 99999, flexDirection: 'row', height: hp('12%'), alignItems: 'center', borderTopLeftRadius: 10, borderLeftColor: Colors.borderColor, borderLeftWidth: 1, borderTopRightRadius: 10, borderRightColor: Colors.borderColor, borderRightWidth: 1, borderTopColor: Colors.borderColor, borderTopWidth: 1, paddingBottom: DeviceInfo.hasNotch() ? hp('4%') : 0 }}>
				<TouchableOpacity onPress={() => selectTab('Transactions')} style={{ padding: wp('5%'), }}>
					{selected == 'Transactions' ?
						(<View style={{ flexDirection: 'row', }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundColor, padding: 7, borderRadius: 7, width: 120, height: 40 }}>
								<Image source={require('../assets/images/HomePageIcons/icon_transactions_active.png')} style={{ width: 25, height: 25, resizeMode: 'contain', }} /><Text style={{ marginLeft: 8, color: Colors.blue, fontFamily: Fonts.firasonsRegular, fontSize: RFValue(12, 812), }}>transactions</Text></View>
						</View>) :
						(<View style={{ flexDirection: 'row', }}>
							<Image source={require('../assets/images/HomePageIcons/icon_transactions.png')} style={{ width: 21, height: 21, resizeMode: 'contain', }} />
						</View>)
					}
				</TouchableOpacity>
				<TouchableOpacity onPress={() => selectTab('Add')} style={{ padding: wp('5%'), }}>
					{selected == 'Add' ?
						(<View style={{ flexDirection: 'row', }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundColor, padding: 7, borderRadius: 7, width: 120, height: 40, justifyContent: 'center', }}>
								<Image source={require('../assets/images/HomePageIcons/icon_add_active.png')} style={{ width: 21, height: 21, resizeMode: 'contain', }} /><Text style={{ marginLeft: 8, color: Colors.blue, fontFamily: Fonts.firasonsRegular, fontSize: RFValue(12, 812), }}>add</Text></View>
						</View>) :
						(<View style={{ flexDirection: 'row', }}>
							<Image source={require('../assets/images/HomePageIcons/icon_add.png')} style={{ width: 21, height: 21, resizeMode: 'contain', }} />
						</View>)
					}
				</TouchableOpacity>
				<TouchableOpacity onPress={() => selectTab('Scan Qr Code')} style={{ padding: wp('5%'), }}>
					{selected == 'Scan Qr Code' ?
						(<View style={{ flexDirection: 'row', }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundColor, padding: 7, borderRadius: 7, width: 120, height: 40, justifyContent: 'center' }}>
								<Image source={require('../assets/images/HomePageIcons/icon_qr_active.png')} style={{ width: 21, height: 21, resizeMode: 'contain', }} /><Text style={{ marginLeft: 8, color: Colors.blue, fontFamily: Fonts.firasonsRegular, fontSize: RFValue(12, 812), }}>qr</Text></View>
						</View>) :
						(<View style={{ flexDirection: 'row', }}>
							<Image source={require('../assets/images/HomePageIcons/icon_qr.png')} style={{ width: 21, height: 21, resizeMode: 'contain', }} />
						</View>)
					}
				</TouchableOpacity>
				<TouchableOpacity style={{ padding: 20, }} onPress={() => {
					setOpenmodal('closed');
					bottomSheet.current.snapTo(0);
				}}>
					<View style={{ flexDirection: 'row', }}>
						<Image source={require('../assets/images/HomePageIcons/icon_more.png')} style={{ width: 21, height: 21, resizeMode: 'contain', }} />
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
});
