import React from "react";
import { StyleSheet, ImageBackground, View, Platform, SafeAreaView, FlatList, TouchableOpacity, Dimensions } from "react-native";
import {
    Container,
    Item,
    Input,
    Button,
    Text,
    Icon
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';
import GridView from 'react-native-super-grid';

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );

export default class ContactSharedSecretList extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_OrignalDetails: [],
            SelectedFakeContactList: [],
            flag_NextBtnDisable: true,
            flag_NextBtnDisable1: false,
            flag_Loading: false,
            flag_MaxItemSeletedof3: true
        } )
    }

    async componentWillMount() {
        var resSharedSecretList = await dbOpration.readTablesData(
            localDB.tableName.tblTrustedPartySSSDetails
        );
        resSharedSecretList = resSharedSecretList.temp;
        console.log( { resSharedSecretList } );
        let temp = [];
        for ( let i = 0; i < resSharedSecretList.length; i++ ) {
            let data = {};
            let allJson = JSON.parse( resSharedSecretList[ i ].allJson );
            let userDetails = JSON.parse( resSharedSecretList[ i ].userDetails )
            data.name = allJson.meta.tag;
            data.walletName = userDetails.name;
            data.m = "+91 9876543210"
            temp.push( data );
        }
        console.log( { temp } );

        this.setState( {
            data: temp,
            arr_OrignalDetails: temp
        } )
    }

    press = ( hey: any ) => {
        console.log( { hey } );

    }
    //TODO: Searching Contact List
    searchFilterFunction = ( text: string ) => {
        if ( text.length > 0 ) {
            const newData = this.state.data.filter( item => {
                const itemData = `${ item.name != null && item.name.toUpperCase() }   
    ${ item.walletName != null && item.walletName.toUpperCase() }`;
                const textData = text.toUpperCase();
                return itemData.indexOf( textData ) > -1;
            } );

            this.setState( { data: newData } );
        } else {
            this.setState( {
                data: this.state.arr_OrignalDetails
            } )
        }
    };




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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 22 : 17, marginLeft: 0 } ] }>Contacts that have shared secrets</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            extraScrollHeight={ 40 }
                        >
                            <View style={ { flex: 0.2 } }>
                                <View style={ { marginLeft: 10, marginRight: 10, backgroundColor: "#EDEDED", borderRadius: 10 } }>
                                    <Item style={ { borderColor: 'transparent', marginLeft: 10 } }>
                                        <Icon name="ios-search" color="#B7B7B7" />
                                        <Input placeholder="Enter a user name or wallet name"
                                            style={ [ globalStyle.ffFiraSansMedium ] }
                                            placeholderTextColor="#B7B7B7"
                                            onChangeText={ text => this.searchFilterFunction( text ) }
                                            autoCorrect={ false } />
                                    </Item>
                                </View>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, marginRight: 10, marginBottom: 20 } ] }>Send trusted friends wallets details.</Text>
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
                                            this.press( item )
                                        } }>
                                            <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                    <View style={ { alignItems: "center", justifyContent: "center" } }>
                                                        <Avatar style={ { alignSelf: "center" } } medium rounded title={ item.name.charAt( 0 ) } />
                                                    </View>
                                                    <View style={ { flexDirection: "column" } }>
                                                        <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10 } ] }>{ item.name }</Text>
                                                        <Text style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.m }</Text>
                                                        <Text note style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.walletName }</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ) }
                                    keyExtractor={ item => item.recordID }
                                    extraData={ this.state }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message="Loading" />
            </Container >
        );
    }
}

const primaryColor = colors.appColor;
const darkGrey = "#bdc3c7";
const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewInputFiled: {
        flex: 3,
        alignItems: "center",
        margin: 10
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    },
    btnNext: {
        position: "absolute",
        bottom: 10,
        width: "100%"

    },
    //Grid View Selected
    gridSelectedList: {
        flex: 1
    }
} );
