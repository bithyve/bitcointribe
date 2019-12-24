import React, { useState } from 'react';
import {
	View,
	Image,
	TouchableOpacity,
	Text,
	StyleSheet,
	ScrollView,
	FlatList,
	KeyboardAvoidingView,
	ImageBackground,
	TextInput,
	Platform
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import { RNCamera } from 'react-native-camera';

export default function QrCodeModalContents( props ) {

	const [ cameraRef, setcameraRef ] = useState( React.createRef() );
	const barcodeRecognized = async ( barcodes ) => {
		console.log( { barcodes } );
		//	await props.onScanQRCode( barcodes.data )
	};

	return ( <View style={ styles.modalContentContainer }>
		<KeyboardAvoidingView style={ { flex: 1 } } behavior={ Platform.OS == 'ios' ? 'padding' : '' } enabled>
			<ScrollView style={ styles.qrModalScrollView }>
				<View style={ styles.qrModalImageNTextInputView }>

					{/* <ImageBackground source={require('../assets/images/icons/iPhone-QR.png')} style={styles.qrModalImage} >
                        <View style={{ flexDirection: 'row', paddingTop: 10, paddingRight: 5, paddingLeft: 10, width: '100%' }}>
                            <View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderTopWidth: 1 }} />
                            <View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
                        </View>
                        <View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 5, paddingRight: 5, paddingLeft: 10, width: '100%', }}>
                            <View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
                            <View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
                        </View>  
                    </ImageBackground> */}
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