import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
	TextInput,
	Platform,
	ImageBackground
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import { RNCamera } from 'react-native-camera';

export default function QrCodeModalContents(props) {
	const [openCameraFlag, setOpenCameraFlag] = useState(false)
	const barcodeRecognized = async (barcodes) => {
		if (barcodes.data) {
			!props.restoreQr ? setOpenCameraFlag(false) : setOpenCameraFlag(true);
			props.modalRef ? props.modalRef.current.snapTo(1) : ''; // closes modal
			props.onQrScan(getFormattedString(barcodes.data));
		}
	};

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
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
			<ScrollView style={styles.qrModalScrollView}>
				<View style={styles.qrModalImageNTextInputView}>
					{props.isOpenedFlag && openCameraFlag ?
						(<View style={{
							width: wp('100%'),
							height: wp('100%'),
							overflow: "hidden",
							borderRadius: 20,
							marginTop: hp('3%')
						}}>
							<RNCamera
								ref={(ref) => { this.cameraRef = ref; }}
								style={{
									width: wp('100%'),
									height: wp('100%')
								}}
								onBarCodeRead={barcodeRecognized}
						
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
									width: wp('100%'),
									height: wp('100%'),
									overflow: "hidden",
									borderRadius: 20,
									marginTop: hp('3%')
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
						{ !props.flag ? <TextInput placeholder={'Enter Recipients Address'} placeholderTextColor={Colors.borderColor} style={styles.qrModalTextInput} /> : null}
					
				</View>
				{ !props.flag ? 
				<View style={styles.qrModalInfoView}>
					<View style={{ marginRight: 15 }}>
						<Text style={styles.qrModalInfoTitleText}>QR</Text>
						<Text style={styles.qrModalInfoInfoText}>Scan a QR code to send money or receive information from another Hexa wallet</Text>
					</View>
					<Ionicons
						name="ios-arrow-forward"
						color={Colors.textColorGrey}
						size={15}
						style={{ alignSelf: 'center' }}
					/>
				</View> : null }
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

})
