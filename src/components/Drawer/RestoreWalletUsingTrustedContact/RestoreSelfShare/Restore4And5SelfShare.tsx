import React from "react";
import { StyleSheet, ImageBackground, View, SafeAreaView, Image } from "react-native";
import {
    Container,
    Text
} from "native-base";



//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import HeaderTitle from "HexaWallet/src/app/custcompontes/Header/HeaderTitle/HeaderTitle";

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manage/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";


export default class Restore4And5SelfShare extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            title: "Share",
            type: "",
            arr_History: [],
            flag_ScanBtnDisable: true
        } )
    }


    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let title = this.props.navigation.getParam( "title" );
        let type = this.props.navigation.getParam( "type" );

        console.log( { data } );
        // let flag_History = utils.isJson( data.sssDetails.history );
        // var arr_History = [];
        // if ( flag_History ) {
        //     arr_History = JSON.parse( data.sssDetails.history );
        // }
        // let acceptedDate = data.sssDetails.acceptedDate;
        let flag_ScanBtnDisable = true;
        // if ( acceptedDate != "" ) {
        //     flag_ScanBtnDisable = false;
        // } else {
        //     flag_ScanBtnDisable = true;
        // }
        console.log( { data } );
        this.setState( {
            title,
            type,
            flag_ScanBtnDisable,
            data
        } )
    }



    //TODO: Sharing    
    click_QRCode( data: any ) {
        let { type } = this.state;
        this.props.navigation.push( "Restore4And5SelfShareQRCodeScanner", { data: data, type: type } );
        // let { title } = this.state;
        // let email4shareFilePath = data.sssDetails.encryptedMetaShare.split( '"' ).join( "" );
        // if ( title != "Email Share" ) {
        //     let shareOptions = {
        //         title: "For 5 share",
        //         message: "For 5 share.Pdf password is your answer.",
        //         urls: [ email4shareFilePath ],
        //         subject: "For 5 share "
        //     };
        //     Share.open( shareOptions )
        //         .then( ( res: any ) => {
        //             this.updateHistory( data, "Shared.", "" );
        //             this.setState( {
        //                 flag_ShareBtnDisable: false,
        //                 flag_ReShareBtnDisable: true,
        //                 flag_ConfrimBtnDisable: true
        //             } );
        //         } );
        // } else {
        //     console.log( { email4shareFilePath } );
        //     Mailer.mail( {
        //         subject: 'For 4 Share.',
        //         recipients: [ 'appasahebl@bithyve.com' ],
        //         body: '<b>For 4 share.Pdf password is your answer.</b>',
        //         isHTML: true,
        //         attachment: {
        //             path: email4shareFilePath,  // The absolute path of the file from which to read data.
        //             type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
        //             name: 'For4Share',   // Optional: Custom filename for attachment
        //         }
        //     }, ( error, event ) => {
        //         if ( event == "sent" ) {
        //             alert.simpleOk( "Success", "Email sent success." );
        //             this.updateHistory( data, "Shared.", "" );
        //             this.setState( {
        //                 flag_ShareBtnDisable: false,
        //                 flag_ReShareBtnDisable: true,
        //                 flag_ConfrimBtnDisable: true
        //             } )
        //         } else {
        //             alert.simpleOk( "Oops", error );
        //         }
        //     } );
        // }
    }

    //TODO: Re-Share Share

    click_ReShare( data: any ) {
        alert.simpleOk( "Oops", "coming soon" );
    }


    onSelect = async ( returnValue: any ) => {
        // if ( returnValue.data == returnValue.result ) {
        //     let { data } = this.state;
        //     let filePath = JSON.parse( data.sssDetails.encryptedMetaShare );
        //     console.log( { filePath } );
        //     this.updateHistory( data, "Confirmed.", filePath );
        //     let walletDetails = await utils.getWalletDetails();
        //     let sssDetails = await utils.getSSSDetails();
        //     let encrShares = [];
        //     for ( let i = 0; i < sssDetails.length; i++ ) {
        //         let data = {};
        //         data.shareId = sssDetails[ i ].shareId;
        //         data.updatedAt = sssDetails[ i ].sharedDate == "" ? 0 : parseInt( sssDetails[ i ].sharedDate );
        //         encrShares.push( data );
        //     }
        //     console.log( { encrShares } );
        //     let updateShareIdStatus = await comAppHealth.connection_AppHealthForAllShare( parseInt( walletDetails.lastUpdated ), encrShares );
        //     console.log( { updateShareIdStatus } );
        //     this.setState( {
        //         flag_ConfrimBtnDisable: false
        //     } )
        // } else {
        //     alert.simpleOk( "Oops", "Try again." );
        // }

    }



    //TODO: Share or Reshare button on click
    click_SentRequest( type: string, data: any ) {
        console.log( { type, data } );

    }

    render() {
        //array     
        let { data, arr_History } = this.state;
        //Value
        let { title } = this.state;
        //flag
        let { flag_ScanBtnDisable } = this.state;
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title={ title }
                        pop={ () => this.props.navigation.pop() }
                    />
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <View style={ { flex: 0.1, padding: 20 } }>
                            <Text numberOfLines={ 2 } note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Tab on Scan QRCode to scan 8 QR code  </Text>
                        </View>
                        <View style={ { flex: 2, alignItems: "center", justifyContent: "center" } }>
                            <Image style={ [ styles.imgAppLogo, { borderRadius: 10 } ] } source={ images.RestoreWalletUsingTrustedContact.share4and5SelfShareInfo } />
                        </View>
                        { renderIf( flag_ScanBtnDisable == true )(
                            <View style={ { flex: 0.3 } }>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_QRCode( data )
                                    } }
                                    title="Scan QRCode"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                    </SafeAreaView>
                </ImageBackground>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message={ this.state.msg_Loading } />
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
    },
    imgAppLogo: {
        width: "90%",
        height: "95%",

    },
} );
