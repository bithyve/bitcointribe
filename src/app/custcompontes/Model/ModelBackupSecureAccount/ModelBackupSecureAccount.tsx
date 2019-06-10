import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Image, Platform, CameraRoll } from 'react-native';
import { Button, Icon, Text } from "native-base";
var Mailer = require( 'NativeModules' ).RNMail;
import Share from "react-native-share";
import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';
var RNFS = require( 'react-native-fs' );
import RNFetchBlob from 'react-native-fetch-blob'


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome Compontes  
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import FullLinearGradientIconWithLoadingButton from 'HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientIconWithLoadingButton';


import { SvgIcon } from "@up-shared/components";
//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";
//TODO: Custome Object
import {
    colors,
    images
} from "HexaWallet/src/app/constants/Constants";


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );
var utils = require( "HexaWallet/src/app/constants/Utils" );


interface Props {
    data: [];
    pop: Function;
    closeModal: Function;
    click_Next: Function;
}


//TODO: Bitcoin Files
import SecurePDFGen from 'HexaWallet/src/bitcoin/utilities/securePDFGenerator';


export default class ModelBackupSecureAccount extends Component<Props, any> {
    pdfObj = null;
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            pdfDetails: [],
            pdfFilePath: "",
            flag_NextBtnDisable: true,
            flag_Loading: true,
            flag_XPubQR: false
        } )
    }


    header( text: any ) {
        return { text: text, margins: [ 0, 0, 0, 8 ] };
    }

    componentWillReceiveProps( nextProps: any ) {
        let data = nextProps.data;
        console.log( { data } );
        if ( data[ 0 ].modalVisible == true ) {
            this.readPropsValue( data[ 0 ].secureAccountDetails )
            this.setState( {
                data: data[ 0 ].secureAccountDetails
            } )
        }
    }


    readPropsValue = async ( data: any ) => {
        let resultWallet = await utils.getMnemonic();
        console.log( { resultWallet } );
        let setupData = data.setupData;
        console.log( { setupData } );
        const securePDFGen = new SecurePDFGen(
            resultWallet
        );
        //console.log( setupData.secondaryMnemonic, setupData.setupData.bhXpub );
        let resGetSecondaryXpub = await securePDFGen.getSecondaryXpub( setupData.secondaryMnemonic, setupData.setupData.bhXpub );
        // console.log( { resGetSecondaryXpub } );
        let temp = [];
        temp.push( { secondaryXpub: resGetSecondaryXpub, qrData: setupData.setupData.qrData, secret: setupData.setupData.secret, secondaryMnemonic: setupData.secondaryMnemonic, bhXpub: setupData.setupData.bhXpub } )
        this.setState( {
            pdfDetails: temp
        } )
        this.generateSecondaryXpub( temp );
    }

    generateSecondaryXpub = async ( data: any ) => {
        let secondaryXpub = data[ 0 ].secondaryXpub;
        console.log( { secondaryXpub } );
        var docsDir;
        if ( Platform.OS == "android" ) {
            docsDir = await RNFS.ExternalStorageDirectoryPath //RNFS.DocumentDirectoryPath;
        } else {
            docsDir = await PDFLib.getDocumentsDirectory();
        }
        docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
        console.log( { docsDir } );
        var path = `${ docsDir }/secondaryXpub.png`;
        await RNFetchBlob.fetch( 'GET', "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + secondaryXpub, {
        } )
            .then( ( res: any ) => {
                let base64Str = res.base64()
                RNFS.writeFile( path, base64Str, "base64" )
                    .then( ( success: any ) => {
                        this.generate2FASecret( data );
                    } )
                    .catch( ( err: any ) => {
                        console.log( { err } );

                    } )
            } )
            .catch( ( errorMessage: string ) => {
                Alert.alert( errorMessage )

            } )
    }
    generate2FASecret = async ( data: any ) => {
        let secret2FA = data[ 0 ].secret;
        let qrData = data[ 0 ].qrData;
        var docsDir;
        if ( Platform.OS == "android" ) {
            docsDir = await RNFS.ExternalStorageDirectoryPath //RNFS.DocumentDirectoryPath;
        } else {
            docsDir = await PDFLib.getDocumentsDirectory();
        }
        docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
        // console.log( { docsDir } );
        var path = `${ docsDir }/secret2FA.png`;
        await RNFetchBlob.fetch( 'GET', "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + qrData, {
        } )
            .then( ( res: any ) => {
                let base64Str = res.base64()
                RNFS.writeFile( path, base64Str, "base64" )
                    .then( ( success: any ) => {
                        this.genreatePdf( data );
                    } )
                    .catch( ( err: any ) => {
                        console.log( { err } );

                    } )
            } )
            .catch( ( errorMessage: string ) => {
                Alert.alert( errorMessage )

            } )
    }

    chunkArray( arr: any, n: any ) {
        var chunkLength = Math.max( arr.length / n, 1 );
        var chunks = [];
        for ( var i = 0; i < n; i++ ) {
            if ( chunkLength * ( i + 1 ) <= arr.length ) chunks.push( arr.slice( chunkLength * i, chunkLength * ( i + 1 ) ) );
        }
        return chunks;
    }
    split2s( str: string, delim: any ) {
        var p = str.indexOf( delim );
        if ( p !== -1 ) {
            return [ str.substring( 0, p ), str.substring( p ) ];
        } else {
            return [ str ];
        }
    }


    genreatePdf = async ( data: any ) => {
        let secret2FA = data[ 0 ].secret;
        let secondaryMnemonic = data[ 0 ].secondaryMnemonic;
        let arrSecondaryMnemonic = secondaryMnemonic.split( ' ' );
        var firstArrSecondaryMnemonic, secoundArrSecondaryMnemonic, threeSecondaryMnemonic;
        let arrSepArray = this.chunkArray( arrSecondaryMnemonic, 3 );
        firstArrSecondaryMnemonic = arrSepArray[ 0 ].toString();
        firstArrSecondaryMnemonic = firstArrSecondaryMnemonic.split( ',' ).join( ' ' );
        secoundArrSecondaryMnemonic = arrSepArray[ 1 ].toString();
        secoundArrSecondaryMnemonic = secoundArrSecondaryMnemonic.split( ',' ).join( ' ' );
        threeSecondaryMnemonic = arrSepArray[ 2 ].toString();
        threeSecondaryMnemonic = threeSecondaryMnemonic.split( ',' ).join( ' ' );
        //bhXpub
        let bhXpub = data[ 0 ].bhXpub;
        console.log( { bhXpub } );
        var firstArrbhXpub, secoundArrbhXpub, threebhXpub;
        let arrSepArraybhXpub = bhXpub.match( /.{1,40}/g );
        console.log( arrSepArraybhXpub );
        firstArrbhXpub = arrSepArraybhXpub[ 0 ].toString();
        firstArrbhXpub = firstArrbhXpub.split( ',' ).join( ' ' );
        secoundArrbhXpub = arrSepArraybhXpub[ 1 ].toString();
        secoundArrbhXpub = secoundArrbhXpub.split( ',' ).join( ' ' );
        threebhXpub = arrSepArraybhXpub[ 2 ].toString();
        threebhXpub = threebhXpub.split( ',' ).join( ' ' );

        console.log( { secondaryMnemonic, bhXpub } );
        var docsDir;
        if ( Platform.OS == "android" ) {
            docsDir = await RNFS.ExternalStorageDirectoryPath;
        } else {
            docsDir = await PDFLib.getDocumentsDirectory();
        }
        const pdfPath = `${ docsDir }/sercurepdf.pdf`;
        console.log( { pdfPath } );
        docsDir = Platform.OS === 'android' ? `/${ docsDir }` : docsDir;
        console.log( { docsDir } );
        const imgSecondaryXpub = `${ docsDir }/secondaryXpub.png`; //"secondaryXpub.png"; //
        const img2FASecret = `${ docsDir }/secret2FA.png`; //"secondaryXpub.png"; //
        console.log( { imgSecondaryXpub, img2FASecret } );

        const page1 = PDFPage
            .create()
            .drawText( 'Secondary Xpub (Encrypted):', {
                x: 5,
                y: 480,
                fontSize: 18
            } )
            .drawImage(
                imgSecondaryXpub,
                'png',
                {
                    x: 50,
                    y: 310,
                    width: 150,
                    height: 150,
                    //source: 'assets'
                }
            )
            .drawText( 'Scan the above QR Code using your HEXA', {
                x: 25,
                y: 295,
                fontSize: 10
            } )
            .drawText( 'wallet in order to restore your Secure Account.', {
                x: 25,
                y: 283,
                fontSize: 10
            } )
            .drawText( '2FA Secret:', {
                x: 5,
                y: 250,
                fontSize: 18
            } )
            .drawImage(
                img2FASecret,
                'png',
                {
                    x: 50,
                    y: 80,
                    width: 150,
                    height: 150,
                    // source: 'assets'
                }
            )
            .drawText( secret2FA, {
                x: 25,
                y: 60,
                fontSize: 10
            } )
        const page2 = PDFPage
            .create()
            .drawText( 'Following assets can be used to recover your funds using', {
                x: 5,
                y: 480,
                fontSize: 10
            } )
            .drawText( 'the open - sourced ga - recovery tool.', {
                x: 5,
                y: 470,
                fontSize: 10
            } )
            .drawText( 'Secondary Mnemonic:', {
                x: 5,
                y: 440,
                fontSize: 18
            } )
            .drawText( firstArrSecondaryMnemonic, {
                x: 5,
                y: 420,
                fontSize: 10
            } )
            .drawText( secoundArrSecondaryMnemonic, {
                x: 5,
                y: 408,
                fontSize: 10
            } )
            .drawText( threeSecondaryMnemonic, {
                x: 5,
                y: 396,
                fontSize: 10
            } )
            .drawText( 'BitHyve Xpub:', {
                x: 5,
                y: 350,
                fontSize: 18
            } )
            .drawText( firstArrbhXpub, {
                x: 5,
                y: 330,
                fontSize: 10
            } )
            .drawText( secoundArrbhXpub, {
                x: 5,
                y: 318,
                fontSize: 10
            } )
            .drawText( threebhXpub, {
                x: 5,
                y: 306,
                fontSize: 10
            } )
        PDFDocument
            .create( pdfPath )
            .addPages( page1, page2 )
            .write() // Returns a promise that resolves with the PDF's path
            .then( path => {
                console.log( 'PDF created at: ' + path );
                this.setState( {
                    flag_Loading: false,
                    pdfFilePath: path
                } )
            } );
    }

    //TODO: Download file
    click_DonloadFile() {
        let flag_NextBtnDisable = this.state.flag_NextBtnDisable;
        let pdfFilePath = this.state.pdfFilePath;

        Mailer.mail( {
            subject: 'Store secure account pdf.',
            recipients: [ 'appasahebl@bithyve.com' ],
            body: '<b>Secure Account PDF.Store any secure location.</b>',
            isHTML: true,
            attachment: {
                path: pdfFilePath,  // The absolute path of the file from which to read data.
                type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                name: 'sercurepdf',   // Optional: Custom filename for attachment
            }
        }, ( error, event ) => {
            if ( event == "sent" ) {

                Alert.alert(
                    "Success",
                    "Email sent success.",
                    [
                        { text: 'Ok', onPress: () => console.log( 'OK' ) },
                    ],
                    { cancelable: true }
                )
            } else {
                Alert.alert(
                    error,
                    event,
                    [
                        { text: 'Ok', onPress: () => console.log( 'OK: Email Error Response' ) },
                    ],
                    { cancelable: true }
                )
            }

        } );
        if ( flag_NextBtnDisable ) {
            this.setState( {
                flag_NextBtnDisable: !flag_NextBtnDisable
            } )
        }
    }

    render() {
        let data = this.props.data.length != 0 ? this.props.data : [];
        let flag_NextBtnDisable = this.state.flag_NextBtnDisable;
        let flag_Loading = this.state.flag_Loading;
        return (
            <Modal
                transparent
                animationType={ 'fade' }
                visible={ data.length != 0 ? data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <View style={ [
                    styles.modalBackground,
                    { backgroundColor: `rgba(0,0,0,0.4)` }
                ] }>
                    <View style={ styles.viewModelBody }>
                        <View style={ { flexDirection: "row", flex: 0.2 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.pop() }
                            >
                                <SvgIcon name="icon_back" size={ 25 } color="gray" />
                            </Button>
                            <Text style={ [ globalStyle.ffFiraSansMedium, {
                                fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } ] }>Backup Secure Wallet</Text>

                        </View>
                        <View style={ { flex: utils.getIphoneSize() == "iphone X" ? 1.4 : 1.2, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ { textAlign: "center", margin: 20 } }>To backup your secure account you will have to follow these steps.</Text>
                            <Image
                                style={ { flex: 1, width: "100%", height: "100%" } }
                                resizeMode="contain"
                                source={ images.backupSecureAccount.steps }
                            />
                        </View>
                        <View style={ { flex: 0.4, justifyContent: "flex-end" } }>
                            <FullLinearGradientIconWithLoadingButton
                                click_Done={ () => this.click_DonloadFile() }
                                title="Share PDF"
                                iconName="share"
                                iconColor={ "#ffffff" }
                                iconSize={ 20 }
                                disabled={ flag_Loading }
                                animating={ flag_Loading }
                                style={ [ { borderRadius: 10 } ] } />
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Next( this.state.data ) }
                                title="Next"
                                disabled={ flag_NextBtnDisable }
                                style={ [ flag_NextBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] } />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}



const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center'
    },
    viewModelBody: {
        flex: utils.getIphoneSize() == "iphone X" ? 0.9 : 0.9,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );