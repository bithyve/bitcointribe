import React, { useState, useEffect } from 'react'
import { View, Image, Text, StyleSheet, ActivityIndicator, Share } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from './BottomInfoBox'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { nameToInitials } from '../common/CommonFunctions'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import QRCode from 'react-native-qrcode-svg'
import {
	REGULAR_ACCOUNT,
	TEST_ACCOUNT,
	SECURE_ACCOUNT,
} from '../common/constants/wallet-service-types'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Toast from '../components/Toast'
import CopyThisText from '../components/CopyThisText'
import UserDetails from './UserDetails'

export default function RequestKeyFromContact(props) {
	const [contactName, setContactName] = useState('')
	const [shareLink, setShareLink] = useState('')
	console.log('props.QR RequestKeyFromContact > ', props.QR);
	
	const amount = props.amount
	const contact = props.contact
	const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false)
	const [dropdownBoxList, setDropdownBoxList] = useState([
		{
			id: '1',
			account_name: 'Test Account',
			type: TEST_ACCOUNT,
		},
		{
			id: '2',
			account_name: 'Checking Account',
			type: REGULAR_ACCOUNT,
		},
		{
			id: '3',
			account_name: 'Saving Account',
			type: SECURE_ACCOUNT,
		},
	])
	const [serviceType, setServiceType] = useState(
		props.serviceType ? props.serviceType : '',
	)
	//console.log("amountCurrency", props.amountCurrency);
	const [Contact, setContact] = useState(props.contact ? props.contact : {
	})

	useEffect(() => {
		setShareLink(props.link)
		// if ( props.infoText ) setInfoText( props.infoText )
	}, [props.link])

	useEffect(() => {
		if (contact) {
			setContact(props.contact)
		}
	}, [contact])

	useEffect(() => {
		if (props.serviceType) {
			setServiceType(props.serviceType)
		}
	}, [props.serviceType])

	useEffect(() => {
		const contactName =
			Contact && Contact.firstName && Contact.lastName
				? Contact.firstName + ' ' + Contact.lastName
				: Contact && Contact.firstName && !Contact.lastName
					? Contact.firstName
					: Contact && !Contact.firstName && Contact.lastName
						? Contact.lastName
						: ''
		setContactName(contactName)
	}, [Contact])

	const shareOption = async () => {
		try {
			const result = await Share.share({
				message:
					`${shareLink}`,
			});

			if (result.action === Share.sharedAction) {
				props.onPressShare()
				if (result.activityType) {
					// shared with activity type of result.activityType
				} else {
					// shared
				}
			} else if (result.action === Share.dismissedAction) {
				// dismissed
			}
		} catch (error) {
			// console.log(error);

		}
	}

	const renderVerticalDivider = () => {
		return (
			<View
				style={{
					width: 1,
					height: '60%',
					backgroundColor: Colors.borderColor,
					marginRight: 5,
					marginLeft: 5,
					alignSelf: 'center',
				}}
			/>
		)
	}

	const setPhoneNumber = () => {
		const phoneNumber = Contact.phoneNumbers[0].number
		let number = phoneNumber.replace(/[^0-9]/g, '') // removing non-numeric characters
		number = number.slice(number.length - 10) // last 10 digits only
		return number
	}

	return (
		<View style={styles.modalContainer}>
			<View
				style={{
					alignItems: 'center',
					flexDirection: 'row',
					paddingRight: 10,
					paddingBottom: hp('1.5%'),
					paddingTop: hp('1%'),
					marginLeft: 10,
					marginRight: 10,
					marginBottom: hp('1.5%'),
				}}
			>
				{props.isModal &&
					<View style={{
						flex: 1, flexDirection: 'row', alignItems: 'flex-start'
					}}>
						<AppBottomSheetTouchableWrapper
							onPress={() => {
								props.onPressBack();
							}}
							style={{ height: 30, width: 30, justifyContent: 'center' }}
						>
							<FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
						</AppBottomSheetTouchableWrapper>
						<View style={{
							flex: 1, marginLeft: 5
						}}>
							{props.headerText &&
								<Text style={styles.modalHeaderTitleText}>
									{props.headerText}
								</Text>
							}
							{props.subHeaderText &&
								<Text
									style={{
										color: Colors.textColorGrey,
										fontSize: RFValue(12),
										fontFamily: Fonts.FiraSansRegular,
										paddingTop: 5,
									}}
								>
									{props.subHeaderText}
								</Text>
							}
						</View>
					</View>
				}
			</View>
			<View style={{
				marginHorizontal: 20,
				justifyContent: 'center',
				alignItems: 'center',
				marginTop: !props.isModal ? 0 : hp('1.7%'),
				marginBottom: !props.isModal ? 0 : hp('1.7%'),
			}}>
				<UserDetails
					titleStyle={styles.titleStyle}
					contactName={contactName}
					contactText={props.contactText}
					Contact={Contact} />
			</View>
			<ScrollView contentContainerStyle={{
				flex: 1
			}}>
				<View
					style={{
						marginLeft: 20,
						marginRight: 20,
						justifyContent: 'center',
						alignItems: 'center',
						marginTop: !props.isModal ? hp('2%') : hp('1.7%'),
						marginBottom: !props.isModal ? hp('2%') : hp('1.7%'),
					}}
				>
					<View style={{
						height: hp('27%'),
						justifyContent: 'center',
						marginLeft: 20,
						marginRight: 20,
						alignItems: 'center',
						marginTop: !props.isModal ? 0 : hp('4%')
					}}>
						{!props.QR ? (
							<ActivityIndicator size="large" />
						) : (
								<QRCode value={props.QR} size={hp('27%')} />
							)}
					</View>
					<CopyThisText
						openLink={shareOption}
						backgroundColor={Colors.backgroundColor1}
						text={shareLink ? shareLink : 'Creating Link....'}
					/>
				</View>
			</ScrollView>

		</View>
	)
}
const styles = StyleSheet.create({
	titleStyle: {
		color: Colors.black,
		fontSize: RFValue(20),
		fontFamily: Fonts.FiraSansRegular,
		marginLeft: 25,
	},
	addModalView: {
		padding: 7,
		flexDirection: 'row',
		display: 'flex',
		marginTop: 10,
		justifyContent: 'space-between',
	},
	modalElementInfoView: {
		padding: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalHeaderTitleText: {
		color: Colors.blue,
		fontSize: RFValue(18),
		fontFamily: Fonts.FiraSansRegular,
	},
	modalContainer: {
		height: '100%',
		backgroundColor: Colors.white,
		alignSelf: 'center',
		width: '100%',
	},
	modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.white,
	},
	separatorView: {
		marginLeft: 15,
		marginRight: 15,
		height: 2,
		backgroundColor: Colors.backgroundColor,
	},
	contactProfileView: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	contactProfileImage: {
		borderRadius: 60 / 2,
		width: 60,
		height: 60,
		resizeMode: 'cover',
		shadowColor: Colors.shadowBlue,
		shadowOpacity: 1,
		shadowOffset: {
			width: 15, height: 15
		},
	},
	contactNameText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(20),
		fontFamily: Fonts.FiraSansRegular,
		marginLeft: 25,
	},
	contactIconImage: {
		width: 20,
		height: 20,
		resizeMode: 'cover',
	},
	buttonInnerView: {
		flexDirection: 'row',
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		width: wp('30%'),
	},
	buttonImage: {
		width: 20,
		height: 20,
		resizeMode: 'contain',
		tintColor: Colors.white,
	},
	buttonText: {
		color: Colors.white,
		fontSize: RFValue(12),
		fontFamily: Fonts.FiraSansRegular,
		marginLeft: 10,
	},
	amountContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: hp('1%'),
		borderBottomWidth: 1,
		borderColor: Colors.borderColor,
		paddingBottom: hp('1.5%'),
		paddingTop: hp('1.5%'),
	},
	amountInputImage: {
		width: 40,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
	},
	textBoxImage: {
		width: wp('6%'),
		height: wp('6%'),
		resizeMode: 'contain',
	},
	dropdownBoxModal: {
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.borderColor,
		marginTop: hp('1%'),
		width: wp('90%'),
		height: hp('18%'),
		elevation: 10,
		shadowColor: Colors.shadowBlue,
		shadowOpacity: 10,
		shadowOffset: {
			width: 0, height: 10
		},
		backgroundColor: Colors.white,
		position: 'absolute',
		zIndex: 9999,
		overflow: 'hidden',
	},
	dropdownBoxModalElementView: {
		height: 50,
		alignItems: 'center',
		flexDirection: 'row',
		paddingLeft: 15,
	},
	boldItalicText: {
		fontFamily: Fonts.FiraSansMediumItalic,
		fontStyle: 'italic',
		color: Colors.blue,
	},
})
