import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	KeyboardAvoidingView,
	TextInput,
	Platform,
	AsyncStorage,
	ImageBackground
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import { RNCamera } from 'react-native-camera';
import BottomInfoBox from '../components/BottomInfoBox';
import { ScrollView } from 'react-native-gesture-handler';
import Styles from '../pages/HealthCheck/Styles';

export default function QrCodeModalContents(props) {
	const [openCameraFlag, setOpenCameraFlag] = useState(false)
	const barcodeRecognized = async (barcodes) => {
		if (barcodes.data) {
			setOpenCameraFlag(false);
			props.modalRef ? props.modalRef.current.snapTo(1) : ''; // closes modal
			props.onQrScan(getFormattedString(barcodes.data));
		}
	};

	useEffect(() => {
		(async () => {
		let isCameraOpen;
		AsyncStorage.getItem('isCameraOpen', (err, value) => {
		  if (err) {
			  console.log(err)
		  } else {
			isCameraOpen = JSON.parse(value) // boolean false
		  }
		});
		if (!isCameraOpen) {
		  await AsyncStorage.setItem('isCameraOpen', JSON.stringify(true));
		}
	  })();
	  }, []);

	const getFormattedString = ( qrString: string ) => {
		qrString = qrString.split( 'Dquote' ).join( '"' );
		qrString = qrString.split( 'Qutation' ).join( ':' );
		qrString = qrString.split( 'Lbrace' ).join( '{' );
		qrString = qrString.split( 'Rbrace' ).join( '}' );
		qrString = qrString.split( 'Slash' ).join( '/' );
		qrString = qrString.split( 'Comma' ).join( ',' );
		qrString = qrString.split( 'Squote' ).join( "'" );
		qrString = qrString.split( 'Space' ).join( ' ' );
		return qrString;
	  };

	return (<View style={styles.modalContentContainer}>
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : undefined} enabled keyboardVerticalOffset={150}>
			<ScrollView style={styles.qrModalScrollView}>
				<Text style={styles.modalSubheaderText}>{'Scan a Bitcoin address or any Hexa QR'}</Text>
				<View style={styles.qrModalImageNTextInputView}>
					{props.isOpenedFlag && openCameraFlag ?
						(<View style={{
							width: wp('90%'),
							height: wp('90%'),
							overflow: "hidden",
							borderRadius: 20,
						}}>
							<RNCamera
								ref={(ref) => { this.cameraRef = ref; }}
								style={{
									width: wp('90%'),
									height: wp('90%')
								}}
								onBarCodeRead={barcodeRecognized}
								captureAudio={false}
							>
								<View style={{ flexDirection: 'row', paddingTop: 12, paddingRight: 12, paddingLeft: 12, width: '100%' }}>
									<View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderTopWidth: 1 }} />
									<View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
								</View>
								<View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 12, paddingRight: 12, paddingLeft: 12, width: '100%', }}>
									<View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
									<View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
								</View>
							</RNCamera>
						</View>) : (
							<AppBottomSheetTouchableWrapper onPress={() => setOpenCameraFlag(true)} >
								<ImageBackground source={require("../assets/images/icons/iPhone-QR.png")} style={{
									width: wp('90%'),
									height: wp('90%'),
									overflow: "hidden",
									borderRadius: 20,
								}} >
									<View style={{ flexDirection: 'row', paddingTop: 12, paddingRight: 12, paddingLeft: 12, width: '100%' }}>
										<View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderTopWidth: 1 }} />
										<View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
									</View>
									<View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 12, paddingRight: 12, paddingLeft: 12, width: '100%', }}>
										<View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
										<View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
									</View>
								</ImageBackground>
							</AppBottomSheetTouchableWrapper>
						)}
						{/* { !props.flag ? <TextInput placeholder={'Enter Recipients Address'} 
						placeholderTextColor={Colors.borderColor} 
						style={styles.qrModalTextInput} 
						autoCorrect={false}
						/> : null}
					 */}
				</View>
				{ !props.flag ? 
				<BottomInfoBox
				title={'What can you scan?'}
				infoText={
				  "Scan a bitcoin address, a Hexa Friends and Family request, a Hexa Keeper request or a restore request"
				}
			  />
				// <View style={styles.qrModalInfoView}>
				// 	<View style={{ marginRight: 15 }}>
				// 		<Text style={styles.qrModalInfoTitleText}>QR</Text>
				// 		<Text style={styles.qrModalInfoInfoText}>Scan a QR code to send money or receive information from another Hexa wallet</Text>
				// 	</View>
				// 	<Ionicons
				// 		name="ios-arrow-forward"
				// 		color={Colors.textColorGrey}
				// 		size={15}
				// 		style={{ alignSelf: 'center' }}
				// 	/>
				// </View>
				 : null }
			</ScrollView>
		</KeyboardAvoidingView>
	</View >
	)
}
const styles = StyleSheet.create({
	modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.white,
		paddingBottom: hp('10%')
	},
	modalSubheaderText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(14),
		fontFamily: Fonts.FiraSansRegular,
		marginLeft: 15,
		marginBottom: 20,
	  },
	qrModalScrollView: {
		display: 'flex',
		backgroundColor: Colors.white,
		marginTop:hp('1%')
	},
	qrModalImageNTextInputView: {
		marginBottom: 10,
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
		marginTop: 20,
		marginBottom: 20,
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

})
