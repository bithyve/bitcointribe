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
import { Avatar, SearchBar } from 'react-native-elements';

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );



//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/HealthStatus";


export default class SecretSharingScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: []
        } )
    }

    componentWillMount = async () => {
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );
        this.setState( {
            data: data
        } );
    }

    //TODO: func click_Item
    click_Item = ( item: any ) => {
        this.props.navigation.push( "TrustedContactScreen", {
            data: item
        } );
    }
    render() {
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Secret Sharing</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 0.1, margin: 20 } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Some information on the functionality of this screen and how a user can come back to this</Text>
                        </View>

                        <View style={ { flex: 1 } }>
                            <FlatList
                                data={
                                    this.state.data
                                }
                                showsVerticalScrollIndicator={ false }
                                renderItem={ ( { item } ) => (
                                    <TouchableOpacity style={ {
                                    } } onPress={ () => {
                                        this.click_Item( item )
                                    } }>
                                        <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                            <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                { renderIf( item.thumbnailPath != "" )(
                                                    <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                ) }
                                                { renderIf( item.thumbnailPath == "" )(
                                                    <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                ) }
                                                <View style={ { flexDirection: "column", justifyContent: "center" } }>
                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: "#37A0DA" } ] }>Secret Not Shared</Text>
                                                </View>
                                                <View style={ {
                                                    flex: 1,
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'center'
                                                } }>
                                                    <SvgIcon name="icon_share" size={ 25 } color={ primaryColor } />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ) }
                                keyExtractor={ item => item.recordID }
                                extraData={ this.state }
                            />
                        </View>
                        <View style={ { flex: 0.14, alignItems: "center" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Some information about the importance of trust with these contacts</Text>
                        </View>
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
