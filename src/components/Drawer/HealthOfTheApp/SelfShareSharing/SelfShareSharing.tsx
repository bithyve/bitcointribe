import React from "react";
import { StyleSheet, ImageBackground, View, Platform, SafeAreaView, FlatList, Alert } from "react-native";
import {
    Container,
    Text
} from "native-base";
import { SvgIcon } from "@up-shared/components";

//import Mailer from 'react-native-mail';
var Mailer = require( 'NativeModules' ).RNMail;
import Share from "react-native-share";
var RNFS = require( 'react-native-fs' );


//TODO: Custome Pages
import { ModelLoader } from "hexaLoader";
import { CustomeStatusBar } from "hexaCustStatusBar";
import { FullLinearGradientShareButton } from "hexaCustomeLinearGradientButton";
import { HeaderTitle } from "hexaCustHeader";

//TODO: Custome Model
import { ModelBottomSingleButton, ModelBottomTwoButtons } from "hexaCustModel";

//TODO: Custome Alert 
import { AlertSimple } from "hexaCustAlert";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";

//TODO: Custome Object
import { colors, images, localDB } from "hexaConstants";

var dbOpration = require( "hexaDBOpration" );
var utils = require( "hexaUtils" );


//TODO: Common Funciton

var comFunDBRead = require( "hexaCommonDBReadData" );

export default class SelfShareSharing extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            title: "Share",
            arr_History: [],
            arr_ModelBottomSingleButton: [],
            arr_ModelBottomTwoButtons: [],
            //flag
            btnShareTitle: "Share"
        } )
    }


    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let title = this.props.navigation.getParam( "title" );
        //console.log( { data } );
        let { btnShareTitle } = this.state;
        let arr_History = JSON.parse( data.sssDetails.history )
        let shareStage = data.sssDetails.shareStage;
        let sharedDate = data.sssDetails.sharedDate;
        //console.log( { shareStage, sharedDate } );
        let flag_ShareBtnDisable, flag_ReShareBtnDisable, flag_ConfrimBtnDisable;
        if ( sharedDate == "" && shareStage != "Good" ) {
            btnShareTitle = "Share";
        }
        else if ( shareStage != "Good" && sharedDate != "" ) {
            btnShareTitle = "Confirm";
        }
        else if ( sharedDate != "" && shareStage == "Good" ) {
            btnShareTitle = "Confirm";
        } else {
            btnShareTitle = "Share";
        }
        //console.log( { data } );
        this.setState( {
            title,
            btnShareTitle,
            data,
            arr_History
        } )
    }



    //TODO: Sharing PDF
    click_ShareEmail = async ( data: any ) => {
        let resultWallet = await utils.getWalletDetails();
        let backupInfo = JSON.parse( resultWallet.backupInfo );
        if ( backupInfo[ 0 ].backupType == "new" ) {
            // console.log( { data } );
            let { title } = this.state;
            var email4shareFilePath = data.sssDetails.decryptedShare.split( '"' ).join( "" );
            //console.log( { email4shareFilePath } );
            //console.log( { email4shareFilePath } );
            if ( title != "Email Share" ) {
                //console.log( { email4shareFilePath } );
                let shareOptions = {
                    title: "5th share",
                    message: "Please find attached the 5th share pdf, it is password protected by the answer to the security question.",
                    // urls: [ email4shareFilePath ],                    
                    url: Platform.OS == 'android' ? "file://" + email4shareFilePath : email4shareFilePath,
                    type: 'application/pdf',
                    showAppsToView: true,
                    subject: "5th share pdf"
                };
                //console.log( { shareOptions } );
                await Share.open( shareOptions )
                    .then( ( res: any ) => {
                        this.click_CloseModel();
                        this.updateHistory( data, "Shared.", "" );
                        this.setState( {
                            btnShareTitle: "Confirm"
                        } );
                    } );
            } else {
                Mailer.mail( {
                    subject: '4th Share',
                    recipients: [ '' ],
                    body: '<b>Please find attached the 4th share pdf, it is password protected by the answer to the security question.</b>',
                    isHTML: true,
                    attachment: {
                        path: email4shareFilePath,  // The absolute path of the file from which to read data.
                        type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                        name: resultWallet.walletType.split( " " )[ 0 ] + " Hexa wallet Share 4.pdf",   // Optional: Custom filename for attachment
                    }
                }, ( error, event ) => {
                    if ( event == "sent" ) {
                        this.click_CloseModel();
                        alert.simpleOkActionWithPara( "Success", "Please permanently delete the email from the sent folder", this.updateHistory( data, "Shared.", "" ) );
                        this.setState( {
                            btnShareTitle: "Confirm"
                        } )
                    } else {
                        alert.simpleOk( "Oops", error );
                    }
                } );
                if ( Platform.OS == "android" ) {
                    setTimeout( () => {
                        this.click_CloseModel();
                        alert.simpleOkActionWithPara( "Success", "Please permanently delete the email from the sent folder", this.updateHistory( data, "Shared.", "" ) );
                        this.setState( {
                            btnShareTitle: "Confirm"
                        } )
                    }, 3000 );
                }
            }
        } else {
            Alert.alert( "coming soon" );
        }
    }

    //TODO: Re-Share Share
    click_ReShare( data: any ) {
        alert.simpleOk( "Oops", "coming soon" );
    }

    //TODO:  Confirm
    click_Confirm( data: any ) {
        // console.log( { data } );
        let value = JSON.parse( data.sssDetails.keeperInfo );
        this.props.navigation.push( "ConfirmSelfShareQRScanner", { data: value, onSelect: this.onSelect } );
    }

    onSelect = async ( returnValue: any ) => {
        if ( returnValue.data == returnValue.result ) {
            this.click_CloseModel();
            let { data } = this.state;
            let filePath = JSON.parse( data.sssDetails.decryptedShare );
            // console.log( { filePath } );
            this.updateHistory( data, "Confirmed.", filePath );
            let walletDetails = await utils.getWalletDetails();
            let sssDetails = await utils.getSSSDetails();
            let encrShares = [];
            for ( let i = 0; i < sssDetails.length; i++ ) {
                let data = {};
                data.shareId = sssDetails[ i ].shareId;
                data.updatedAt = sssDetails[ i ].sharedDate == "" ? 0 : parseInt( sssDetails[ i ].sharedDate );
                encrShares.push( data );
            }
            this.setState( {
                flag_ConfrimBtnDisable: false
            } )
        } else {
            alert.simpleOk( "Oops", "Try again." );
        }
    }

    //TODO: update histroy
    updateHistory = async ( data: any, title: string, filePath: any ) => {
        let { arr_History } = this.state;
        const dateTime = Date.now();
        let JsonData = {};
        JsonData.title = title;
        JsonData.date = utils.getUnixToDateFormat2();
        let temp = [ JsonData ];
        arr_History.push.apply( arr_History, temp );

        //console.log( { arr_History } );

        var resUpdateHistroyAndSharedDate;
        if ( title == "Shared." ) {
            resUpdateHistroyAndSharedDate = await dbOpration.updateHistroyAndSharedDate(
                localDB.tableName.tblSSSDetails,
                arr_History,
                dateTime,
                data.sssDetails.id
            );
        } else {
            resUpdateHistroyAndSharedDate = await dbOpration.updateHistroyAndAcceptDate(
                localDB.tableName.tblSSSDetails,
                arr_History,
                dateTime,
                data.sssDetails.id
            );
        }
        //console.log( resUpdateHistroyAndSharedDate );
        if ( resUpdateHistroyAndSharedDate ) {
            await comFunDBRead.readTblSSSDetails();
            this.setState( {
                arr_History
            } );
            await RNFS.unlink( filePath );
        }
        // console.log( { resUpdateHistroyAndSharedDate } );
    }

    //TODO: Close all model
    click_CloseModel() {
        this.setState( {
            arr_ModelBottomSingleButton: [ {
                modalVisible: false,
            } ],
            arr_ModelBottomTwoButtons: [ {
                modalVisible: false,
            } ]
        } );
    }

    render() {
        //array          
        let { data, arr_History, arr_ModelBottomSingleButton, arr_ModelBottomTwoButtons } = this.state;
        //Value      
        let { title } = this.state;
        //flag       
        let { btnShareTitle } = this.state;
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title={ title } pop={ () => this.props.navigation.pop() } />
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <View style={ { flex: 0.1, margin: 20 } }>
                            <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center" } ] }>Share this pdf to an email/cloud which you can</Text>
                            <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center" } ] }>access if required to hold this secret for safekeeping </Text>
                        </View>
                        <View style={ { flex: 2 } }>
                            <FlatList
                                data={
                                    arr_History
                                }
                                showsVerticalScrollIndicator={ false }
                                renderItem={ ( { item } ) => (
                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                            <View style={ { flex: 0.1 } }>
                                                <SvgIcon name="image_hexa" size={ 30 } color={ primaryColor } style={ { alignSelf: "center" } } />
                                            </View>
                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                <View style={ { flexDirection: "row", flex: 1, } }>
                                                    <Text style={ [ FontFamily.ffFiraSansMedium, { marginLeft: 10, fontSize: 16, flex: 1, alignSelf: "center", } ] }>{ item.title }</Text>
                                                    <Text style={ [ FontFamily.ffFiraSansMedium, { alignSelf: "center", flex: 1 } ] }>{ item.date }</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ) }
                                keyExtractor={ item => item.recordID }
                                extraData={ this.state }
                            />
                        </View>
                        <View style={ { flex: Platform.OS == "ios" ? 0.5 : 0.6 } }>
                            <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center" } ] }>Do not share this pdf with anyone other than your email/cloud</Text>
                            <FullLinearGradientShareButton
                                click_Done={ ( title: string ) => {
                                    if ( title == "Share" ) {
                                        this.click_ShareEmail( data )
                                    } else {
                                        this.click_Confirm( data )
                                    }

                                } }
                                click_Option={ ( title: string ) => {
                                    // console.log( { title } );
                                    if ( title === "Share" ) {
                                        this.setState( {
                                            arr_ModelBottomSingleButton: [ {
                                                modalVisible: true,
                                                title: "OPTION",
                                                subTitle: "Select option",
                                                svgIcon: Platform.OS == "ios" ? "recreateSVG" : "recreatePNG",
                                                btnTitle: "RECREATE SHARES"
                                            } ],
                                            arr_ModelBottomTwoButtons: [ {
                                                modalVisible: false,
                                            } ]
                                        } )
                                    } else {
                                        this.setState( {
                                            arr_ModelBottomSingleButton: [ {
                                                modalVisible: false
                                            } ],
                                            arr_ModelBottomTwoButtons: [ {
                                                modalVisible: true,
                                                title: "OPTION",
                                                subTitle: "Select any one option",
                                                svgIcon1: Platform.OS == "ios" ? "reshareSVG" : "resharePNG",
                                                svgIcon2: Platform.OS == "ios" ? "recreateSVG" : "recreatePNG",
                                                btnTitle1: "RESHARE",
                                                btnTitle2: "RECREATE SHARES"
                                            } ]
                                        } )
                                    }
                                } }
                                title={ btnShareTitle }
                                disabled={ false }
                                style={ [ { borderRadius: 10, margin: 10 } ] } />
                        </View>
                    </SafeAreaView>
                </ImageBackground>
                <ModelBottomSingleButton
                    data={ arr_ModelBottomSingleButton }
                    click_Done={ () => {
                        this.click_CloseModel();
                        Alert.alert( "coming soon" )
                    }

                    }
                />
                <ModelBottomTwoButtons
                    data={ arr_ModelBottomTwoButtons }
                    click_Option1={ () => {
                        this.click_CloseModel();
                        this.click_ShareEmail( data )
                    }
                    }
                    click_Option2={ () => {
                        this.click_CloseModel();
                        Alert.alert( "coming soon" )
                    }
                    }
                />

                <ModelLoader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message={ this.state.msg_Loading } />
                <CustomeStatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}




const primaryColor = colors.appColor;
const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    //botom model
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }
} );
