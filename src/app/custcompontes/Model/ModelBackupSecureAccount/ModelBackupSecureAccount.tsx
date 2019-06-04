import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Image, Platform } from 'react-native';
import { Button, Icon, Text } from "native-base";
var Mailer = require( 'NativeModules' ).RNMail;
import Share from "react-native-share";
import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';


//TODO: Custome Compontes  
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import FullLinearGradientIconButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientIconButton";
import { SvgIcon } from "@up-shared/components";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";
//TODO: Custome Object
import {
    colors,
    images
} from "HexaWallet/src/app/constants/Constants";


var utils = require( "HexaWallet/src/app/constants/Utils" );

interface Props {
    data: [];
    pop: Function;
    closeModal: Function;
    click_Next: Function;
}

export default class ModelBackupSecureAccount extends Component<Props, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            pdfFilePath: "",
            flag_NextBtnDisable: true
        } )
    }


    async  componentDidMount() {
        const page1 = PDFPage
            .create()
            .drawText( 'Secondary Xpub (Encrypted):', {
                x: 5,
                y: 5
            } )
        // Create a new PDF in your app's private Documents directory
        const docsDir = await PDFLib.getDocumentsDirectory();
        const pdfPath = `${ docsDir }/sercurepdf.pdf`;
        PDFDocument
            .create( pdfPath )
            .addPages( page1 )
            .write() // Returns a promise that resolves with the PDF's path
            .then( path => {
                console.log( 'PDF created at: ' + path );
                this.setState( {
                    pdfFilePath: path
                } )
            } );
    }

    //TODO: Download file
    click_DonloadFile() {
        let flag_NextBtnDisable = this.state.flag_NextBtnDisable;
        let pdfFilePath = this.state.pdfFilePath;
        if ( flag_NextBtnDisable ) {
            this.setState( {
                flag_NextBtnDisable: !flag_NextBtnDisable
            } )
            Mailer.mail( {
                subject: 'need help',
                recipients: [ '' ],
                ccRecipients: [ '' ],
                bccRecipients: [ '' ],
                body: '<b>A Bold Body</b>',
                isHTML: true,
                attachment: {
                    path: pdfFilePath,  // The absolute path of the file from which to read data.
                    type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                    name: 'sercurepdf',   // Optional: Custom filename for attachment
                }
            }, ( error, event ) => {
                Alert.alert(
                    error,
                    event,
                    [
                        { text: 'Ok', onPress: () => console.log( 'OK: Email Error Response' ) },
                        { text: 'Cancel', onPress: () => console.log( 'CANCEL: Email Error Response' ) }
                    ],
                    { cancelable: true }
                )
            } );
        }


        // const shareOptions = {
        //     title: 'Backup Secure Account',
        //     message: 'This pdf store on google driver to other secure location.',
        //     url: 'http://www.kciti.edu/wp-content/uploads/2017/07/cprogramming_tutorial.pdf',
        //     type: 'application/pdf',
        //     social: Share.Social.EMAIL
        // };
        // Share.shareSingle( shareOptions );
    }

    render() {
        let flag_NextBtnDisable = this.state.flag_NextBtnDisable;
        return (
            <Modal
                transparent
                animationType={ 'fade' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
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
                        <View style={ { flex: Platform.OS == "ios" ? 1.8 : 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ { textAlign: "center", margin: 20 } }>To backup your secure account you will have to follow these steps.</Text>
                            <Image
                                style={ { flex: 1, width: "100%", height: "100%" } }
                                resizeMode="contain"
                                source={ images.backupSecureAccount.steps }
                            />
                        </View>
                        <View style={ { flex: 0.4, justifyContent: "flex-end" } }>
                            <FullLinearGradientIconButton
                                click_Done={ () => this.click_DonloadFile() }
                                title="Share PDF"
                                iconName="share"
                                iconColor={ "#ffffff" }
                                iconSize={ 20 }
                                disabled={ false }
                                style={ [ { borderRadius: 10 } ] } />
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Next() }
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
        flex: utils.getIphoneSize() == "iphone X" ? 0.9 : 1,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );