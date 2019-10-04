import React from "react";
import { StyleSheet, ImageBackground, View, SafeAreaView, FlatList, TouchableOpacity, Dimensions } from "react-native";
import {
    Container,
    Item,
    Input,
    Text,
    Icon,
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';
import GridView from 'react-native-super-grid';


//TODO: Custome Pages
import { ModelLoader } from "hexaLoader";
import { CustomeStatusBar } from "hexaCustStatusBar";
import { FullLinearGradientButton } from "hexaCustomeLinearGradientButton";
import { HeaderTitle } from "hexaCustHeader";



//TODO: Custome Alert 
import { AlertSimple } from "hexaCustAlert";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";

//TODO: Custome Object
import { colors, images, localDB } from "hexaConstants";
import { renderIf } from "hexaValidation";
var dbOpration = require( "hexaDBOpration" );

//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

export default class AllContactList extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_ContactList: [],
            filterValue: "",
            SelectedFakeContactList: [],
            flag_NextBtnDisable: true,
            flag_Loading: false,
            flag_MaxItemSeletedof3: true
        } )
    }

    componentWillMount() {
        Contacts.getAll( ( err, contacts ) => {
            if ( err ) {
                throw err;
            }
            console.log( { contacts } );
            this.setState( {
                data: contacts,
                arr_ContactList: contacts
            } )
        } )
    }

    press = ( hey ) => {
        this.state.data.map( ( item, index ) => {
            if ( item.recordID === hey.recordID ) {
                //if ( this.state.SelectedFakeContactList.length <= 2 ) {
                item.check = !item.check
                if ( item.check === true ) {
                    this.state.SelectedFakeContactList.push( item );
                    //  console.log( 'selected:' + item.givenName );
                } else if ( item.check === false ) {
                    const i = this.state.SelectedFakeContactList.indexOf( item )
                    if ( 1 != -1 ) {
                        this.state.SelectedFakeContactList.splice( i, 1 )
                        //  console.log( 'unselect:' + item.givenName )
                        return this.state.SelectedFakeContactList
                    }
                }
            }
        } )
        let seletedLength = this.state.SelectedFakeContactList.length;
        // console.log( { seletedLength } );
        this.setState( { data: this.state.data } )
        if ( seletedLength <= 2 ) {
            this.setState( {
                flag_NextBtnDisable: false,
                filterValue: "",
                data: this.state.arr_ContactList
            } )
        } else {
            this.setState( {
                flag_NextBtnDisable: true,
                filterValue: "",
                data: this.state.arr_ContactList
            } )
        }
    }

    //TODO: Searching Contact List
    searchFilterFunction = ( text: string ) => {
        if ( text.length > 0 ) {
            const newData = this.state.data.filter( item => {
                const itemData = `${ item.givenName != null && item.givenName.toUpperCase() }   
    ${ item.familyName != null && item.familyName.toUpperCase() }`;
                const textData = text.toUpperCase();
                return itemData.indexOf( textData ) > -1;
            } );
            this.setState( { data: newData } );
        } else {
            this.setState( {
                data: this.state.arr_ContactList
            } )
        }
    };


    //TODO: func click_Next
    click_Next = async () => {
        const dateTime = Date.now();
        let selectedContactList = this.state.SelectedFakeContactList;
        let selectedItem = this.props.navigation.getParam( "arrSelectedItem" );
        var arrTypes = [];
        if ( selectedContactList.length == 2 ) {
            arrTypes = [ { type: "Trusted Contacts 1" }, { type: "Trusted Contacts 2" } ];
            let resInsertContactList = await dbOpration.updateRestoreUsingTrustedContactKeepInfo(
                localDB.tableName.tblSSSDetails,
                dateTime,
                selectedContactList,
                arrTypes
            );
            if ( resInsertContactList ) {
                await comFunDBRead.readTblSSSDetails();
                this.props.navigation.pop();
            } else {
                alert.simpleOk( "Oops", "Trusted Contact not insert databse." );
            }
        } else {
            arrTypes = [ { type: selectedItem.givenName } ];

            let resInsertContactList = await dbOpration.updateRestoreUsingTrustedContactKeepInfo(
                localDB.tableName.tblSSSDetails,
                dateTime,
                selectedContactList,
                arrTypes
            );
            if ( resInsertContactList ) {
                await comFunDBRead.readTblSSSDetails();
                this.props.navigation.pop();
            } else {
                alert.simpleOk( "Oops", "Trusted Contact not insert databse." );
            }
        }
    }



    //TODO: Remove gird on click item
    click_RemoveGridItem( item: any ) {
        // console.log( { item } );
        let arr_SelectedItem = this.state.SelectedFakeContactList;
        let arr_FullArrayList = this.state.data;
        for ( var i = 0; i < arr_SelectedItem.length; i++ ) {
            if ( arr_SelectedItem[ i ].recordID === item.recordID ) {
                arr_SelectedItem.splice( i, 1 );
                // console.log( arr_FullArrayList[ i ] );
                break;
            }
        }
        for ( var i = 0; i < arr_FullArrayList.length; i++ ) {
            if ( arr_FullArrayList[ i ].recordID === item.recordID ) {
                let data = arr_FullArrayList[ i ];
                data.check = false;
                arr_FullArrayList[ i ] = data;
                break;
            }
        }
        this.setState( {
            SelectedFakeContactList: arr_SelectedItem,
            data: arr_FullArrayList
        } )
        let seletedLength = this.state.SelectedFakeContactList.length;
        if ( seletedLength <= 2 ) {
            this.setState( {
                flag_NextBtnDisable: false
            } )
        } else {
            this.setState( {
                flag_NextBtnDisable: true
            } )
        }
    }



    render() {
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title="Contacts" pop={ () => this.props.navigation.pop() } />
                    <SafeAreaView style={ styles.container }>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            extraScrollHeight={ 40 }
                        >
                            <View style={ { flex: 0.2 } }>
                                <View style={ { marginLeft: 10, marginRight: 10, backgroundColor: "#EDEDED", borderRadius: 10 } }>
                                    <Item style={ { borderColor: 'transparent', marginLeft: 10 } }>
                                        <Icon name="ios-search" color="#B7B7B7" />
                                        <Input placeholder="Enter a name to begin search"
                                            value={ this.state.filterValue }
                                            style={ [ FontFamily.ffFiraSansMedium ] }
                                            placeholderTextColor="#B7B7B7"
                                            onChangeText={ text => {
                                                this.setState( {
                                                    filterValue: text
                                                } );
                                                this.searchFilterFunction( text )
                                            } }
                                            autoCorrect={ false }
                                            returnKeyType="done"
                                        />
                                    </Item>
                                </View>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { marginLeft: 10, marginRight: 10, marginBottom: 20 } ] }>Choose two contacts that you trust and who can help you restore the wallet in case you lose the app</Text>
                            </View>
                            <View style={ { flex: 1 } }>
                                <GridView
                                    style={ styles.gridSelectedList }
                                    items={ this.state.SelectedFakeContactList }
                                    renderItem={ ( item, index ) => (
                                        <View style={ { alignItems: "center", justifyContent: "center", } }>
                                            <View style={ { flexDirection: "row" } }>
                                                { renderIf( item.thumbnailPath != "" )(
                                                    <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                ) }
                                                { renderIf( item.thumbnailPath == "" )(
                                                    <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                ) }
                                                <View style={ { alignItems: "flex-end", justifyContent: "flex-end", marginLeft: -14 } }>
                                                    <TouchableOpacity onPress={ () => this.click_RemoveGridItem( item ) }>
                                                        <SvgIcon name="close-circle" color="gray" size={ 20 } style={ { borderColor: "#F8F8F8", borderWidth: 2, borderRadius: 12 } } />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <Text numberOfLines={ 1 }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                        </View>
                                    ) }
                                    itemDimension={ Dimensions.get( 'screen' ).width / 4.0 }
                                    itemsPerRow={ 3 }
                                />
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
                                                    { renderIf( item.thumbnailPath != "" )(
                                                        <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                    ) }
                                                    { renderIf( item.thumbnailPath == "" )(
                                                        <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                    ) }
                                                    <Text style={ [ FontFamily.ffFiraSansRegular, { alignSelf: "center", marginLeft: 10 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>

                                                    <View style={ {
                                                        flex: 1,
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'center'
                                                    } }>
                                                        { item.check
                                                            ? (
                                                                <IconFontAwe name="checkbox-marked" size={ 30 } color={ primaryColor } />
                                                            )
                                                            : (
                                                                <IconFontAwe name="checkbox-blank-outline" size={ 30 } color={ darkGrey } />
                                                            ) }
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
                        { renderIf( this.state.flag_NextBtnDisable == false )(
                            <View style={ styles.btnNext }>
                                <FullLinearGradientButton title="Next" disabled={ this.state.flag_NextBtnDisable } style={ [ this.state.flag_NextBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10, marginLeft: 30, marginRight: 30 } ] } click_Done={ () => this.click_Next() } />
                            </View>
                        ) }
                    </SafeAreaView>
                </ImageBackground>
                <ModelLoader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message="Loading" />
                <CustomeStatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}

const primaryColor = colors.appColor;
const darkGrey = "#bdc3c7";
const styles = StyleSheet.create( {
    container: {
        flex: 1
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
