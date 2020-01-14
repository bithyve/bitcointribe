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

export default function QrCodeModalContents( props ) {
	const [ openCameraFlag, setOpenCameraFlag ] = useState( false )
	const barcodeRecognized = async ( barcodes ) => {
		if ( barcodes.data ) {
			setOpenCameraFlag( false );
			props.modalRef.current.snapTo( 1 ); // closes modal
			props.onQrScan( barcodes.data );
		}
	};

	return ( <View style={ styles.modalContentContainer }>
		<KeyboardAvoidingView style={ { flex: 1 } } behavior={ Platform.OS == 'ios' ? 'padding' : '' } enabled>
			<ScrollView style={ styles.qrModalScrollView }>
				<View style={ styles.qrModalImageNTextInputView }>
					<AppBottomSheetTouchableWrapper onPress={ () => props.onPressQrScanner() } style={ { alignSelf: 'center', backgroundColor: Colors.blue, width: wp( '50%' ), height: wp( '13%' ), alignItems: 'center', justifyContent: 'center', borderRadius: 10 } }>
						<Text style={ { color: Colors.white, fontFamily: Fonts.FiraSansMedium, fontSize: RFValue( 13 ) } }>Scan Qr code</Text>
					</AppBottomSheetTouchableWrapper>
					<TextInput placeholder={ 'Enter Recipients Address' } placeholderTextColor={ Colors.borderColor } style={ styles.qrModalTextInput } />
				</View>
				<View style={ styles.qrModalInfoView }>
					<View style={ { marginRight: 15 } }>
						<Text style={ styles.qrModalInfoTitleText }>QR</Text>
						<Text style={ styles.qrModalInfoInfoText }>Scan a QR code to send money or receive information from another Hexa wallet</Text>
					</View>
					<Ionicons
						name="ios-arrow-forward"
						color={ Colors.textColorGrey }
						size={ 15 }
						style={ { alignSelf: 'center' } }
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	</View >
	)
}
const styles = StyleSheet.create( {
	modalContentContainer: {
		height: '100%',
		backgroundColor: Colors.white,
		paddingBottom: hp( '10%' )
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
		width: wp( '72%' ),
		height: wp( '72%' ),
		borderRadius: 20,
		borderWidth: 2.5,
		borderColor: Colors.backgroundColor
	},
	qrModalTextInput: {
		borderRadius: 20,
		borderWidth: 1,
		borderColor: Colors.backgroundColor,
		width: wp( '72%' ),
		height: 60,
		marginTop: 25,
		marginBottom: 25,
		paddingLeft: 15,
		paddingRight: 15,
		fontSize: RFValue( 11, 812 ),
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
		fontSize: RFValue( 18, 812 )
	},
	qrModalInfoInfoText: {
		color: Colors.textColorGrey,
		fontSize: RFValue( 12, 812 )
	}

} )
