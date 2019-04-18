import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Item,
    Input,
    Button,
    Left,
    Right,
    Body,
    Text,
    Icon,
    List,
    ListItem,
    Thumbnail
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import ModelTrustedContactEmailAndPhoneShare from "HexaWallet/src/app/custcompontes/Model/ModelTrustedContactEmailAndPhoneShare/ModelTrustedContactEmailAndPhoneShare";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

export default class TrustedContactScreen extends React.Component<any, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_TrustedContactEmailAndPhoneShare: [],
            arr_ConstactDetailsList: []
        } )
    }

    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        // console.log( { data } );
        let temp = [];
        let arr_Emails = data.emailAddresses;
        let arr_PhoneNumbers = data.phoneNumbers;
        for ( let i = 0; i < arr_PhoneNumbers.length; i++ ) {
            let dataJson = {};
            dataJson.label = arr_PhoneNumbers[ i ].label;
            dataJson.value = arr_PhoneNumbers[ i ].number;
            temp.push( dataJson );
        }
        for ( let i = 0; i < arr_Emails.length; i++ ) {
            let dataJson = {};
            dataJson.label = arr_Emails[ i ].label;
            dataJson.value = arr_Emails[ i ].email;
            temp.push( dataJson );
        }
        this.setState( {
            data: data,
            arr_ConstactDetailsList: temp
        } )
    }

    componentDidMount = async () => {
        let data = this.props.navigation.getParam( "data" );
        //  console.log( { data } );
        let resSSSDetails = await dbOpration.readSSSTableData(
            localDB.tableName.tblSSSDetails,
            data.recordID
        );
        console.log( { resSSSDetails } );
        let walletDetails = utils.getWalletDetails();
        const sss = new S3Service(
            walletDetails[ 0 ].mnemonic
        );
        const { share, otp } = sss.createTransferShare( resSSSDetails.temp[ 0 ].share, data.givenName )
        console.log( { otpEncryptedShare: share, otp } )
        const { messageId, success } = await sss.uploadShare( share );
        console.log( { otpEncryptedShare: share, messageId, success } )
    }

    render() {
        let data = this.state.data;
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0, fontFamily: "FiraSans-Medium" } }>Trusted Contact</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 0.1, margin: 20 } }>
                            <Text note style={ { textAlign: "center" } }>Some information about the importance of trust with these contacts</Text>
                        </View>
                        <View style={ Platform.OS == "ios" ? { flex: 0.4 } : { flex: 0.5 } }>
                            <View style={ { flex: 1, flexDirection: 'row' } }>
                                <View style={ { flex: 5, alignItems: "flex-end" } }>
                                    { renderIf( data.thumbnailPath != "" )(
                                        <Avatar medium rounded source={ { uri: data.thumbnailPath } } />
                                    ) }
                                    { renderIf( data.thumbnailPath == "" )(
                                        <Avatar medium rounded title={ data.givenName != null && data.givenName.charAt( 0 ) } />
                                    ) }
                                </View>
                                <View style={ { flex: 4.4 } }>
                                    <Button bordered style={ { marginLeft: 10, height: "70%", borderColor: "#D0D0D0" } }>
                                        <Text style={ { color: "#838383" } }>Change Contact</Text>
                                    </Button>
                                </View>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", marginRight: 20 } }>
                                <Text style={ { fontWeight: "bold", fontSize: 17 } }>{ data.givenName }{ " " }{ data.familyName }</Text>
                                <Text style={ { fontSize: 14, color: colors.appColor } }>Secret Not Shared</Text>
                            </View>
                        </View>
                        <View style={ { flex: 1 } }>
                            <FlatList
                                data={
                                    [ 1 ]
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
                                                    <Text style={ { marginLeft: 10, fontWeight: "bold", fontSize: 16, flex: 1, alignSelf: "flex-start" } }>Secret Created</Text>
                                                    <Text style={ { alignSelf: "flex-end", flex: 1 } }>19 April ‘19, 11:00am</Text>
                                                </View>
                                                <Text style={ { marginLeft: 10, fontSize: 14, color: "#37A0DA" } }>Lorem ipsum dolor sit amet, consectetur</Text>
                                            </View>
                                        </View>
                                    </View>
                                ) }
                                keyExtractor={ item => item.recordID }
                                extraData={ this.state }
                            />
                        </View>
                        <View style={ Platform.OS == "ios" ? { flex: 0.6 } : { flex: 0.8 } }>
                            <Text note style={ { textAlign: "center" } }>Select how you want to share secret with the selected trusted contact</Text>
                            <Button
                                onPress={ () => {
                                    this.props.navigation.push( "ShareSecretViaQRScreen", {
                                        data: "Lorem ipsum dolor sit amet, consectetur"
                                    } );
                                } }
                                style={ {
                                    backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                    height: 50,
                                } }
                                full>
                                <Text>Share secret via QR code</Text>
                            </Button>
                            <FullLinearGradientButton
                                click_Done={ () => {
                                    this.setState( {
                                        arr_TrustedContactEmailAndPhoneShare: [ {
                                            modalVisible: true,
                                            contactDetails: data,
                                            arr_ConstactDetailsList: this.state.arr_ConstactDetailsList
                                        } ]
                                    } )
                                } }
                                title="Share secret email/phone"
                                disabled={ false }
                                style={ [ { borderRadius: 10 } ] } />
                        </View>
                        <ModelTrustedContactEmailAndPhoneShare
                            data={ this.state.arr_TrustedContactEmailAndPhoneShare }
                            closeModal={ () => {
                                this.setState( {
                                    arr_TrustedContactEmailAndPhoneShare: [ {
                                        modalVisible: false,
                                        contactDetails: ""
                                    } ]
                                } )
                            } }
                        />
                    </ImageBackground>
                </SafeAreaView>
            </Container >
        );
    }
}

const primaryColor = colors.appColor;
const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    }
} );
