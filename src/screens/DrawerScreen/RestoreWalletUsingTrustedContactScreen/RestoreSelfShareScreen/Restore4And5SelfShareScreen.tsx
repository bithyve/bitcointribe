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
    Segment,
    Icon,
    Tab, Tabs, TabHeading
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { StackActions, NavigationActions } from "react-navigation";
import { QRScannerView } from 'ac-qrcode';
import { Avatar } from 'react-native-elements';
import IconFontAwe from "react-native-vector-icons/FontAwesome";


//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import RestoreScanQrCode from "HexaWallet/src/app/custcompontes/OnBoarding/RestoreScanQrCode/RestoreScanQrCode";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";


//TODO: Custome Object
import { colors, images } from "HexaWallet/src/app/constants/Constants";


export default class Restore4And5SelfShareScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            title: "",
            arr_ShareList: []
        } );
    }

    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let title = this.props.navigation.getParam( "title" );
        let arr_ShareList = []
        for ( let i = 0; i < 8; i++ ) {
            let data = {};
            data.id = i + 1;
            let no = i + 1;
            data.title = "Share " + no;
            if ( title == "Email  Shares Scan" ) {
                data.type = "e0" + no
            } else {
                data.type = "c0" + no;
            }
            data.statusMsg = "Scan";
            data.statusMsgColor = "#ff0000";
            arr_ShareList.push( data )
        }
        this.setState( {
            data,
            title,
            arr_ShareList
        } )
    }

    //TODO: click on card scan 
    click_Scan( item: any ) {
        this.props.navigation.push( "Restore4And5SelfShareQRCodeScanner", { data: item } )
    }


    render() {
        //array
        let { arr_ShareList } = this.state;
        //values
        let { title } = this.state;
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>{ title }</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 1 } }>
                            <Text note style={ { textAlign: "center", fontSize: 20, marginBottom: 20 } }>Scan  8 qrcode</Text>
                            <FlatList
                                data={
                                    arr_ShareList
                                }
                                showsVerticalScrollIndicator={ false }
                                renderItem={ ( { item } ) => (
                                    <TouchableOpacity style={ {
                                    } } onPress={ () => {
                                        this.click_Scan( item )
                                    } }
                                    >
                                        <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 5, borderRadius: 10 } }>
                                            <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                <Avatar medium rounded title={ item.id } />
                                                <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.title }</Text>
                                                    <View style={ { flexDirection: "row" } }>
                                                        <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                    </View>
                                                </View>
                                                <View style={ {
                                                    flex: 1,
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'center',

                                                } }>
                                                    <IconFontAwe name="angle-right" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ) }
                                keyExtractor={ item => item.id }
                                extraData={ this.state }
                            />
                        </View>

                    </ImageBackground>
                </SafeAreaView>
            </Container >
        );
    }
}

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
    }
} );