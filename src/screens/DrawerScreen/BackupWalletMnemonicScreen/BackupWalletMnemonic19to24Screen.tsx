import React from "react";
import { StyleSheet, ImageBackground, View, Platform, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
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
    List,
    ListItem
} from "native-base";
import { Icon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//NsNotification
import BackboneEvents from "backbone-events-standalone";
// global event bus
window.EventBus = BackboneEvents.mixin( {} );

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );

export default class BackupWalletMnemonic19to24Screen extends React.Component<any, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {

        } );
    }



    async click_prev() {
        window.EventBus.trigger( "swipePrev", "optional event info" );
    }

    render() {
        let data = this.props.data.length != 0 ? this.props.data : "temp"
        return (
            <View style={ styles.container }>
                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={ 40 }
                    contentContainerStyle={ { flexGrow: 1, } }
                >
                    <View style={ styles.viewPagination }>
                        <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 22, textAlign: "center" } ] }>Write down these words in the order indicated</Text>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { marginTop: 20, textAlign: "center" } ] }>You will be asked to confirm these words later</Text>
                    </View>
                    <View style={ styles.viewList }>
                        <FlatList
                            data={ data }
                            showsVerticalScrollIndicator={ false }
                            scrollEnabled={ false }
                            renderItem={ ( { item } ) => (
                                <List>
                                    <ListItem noBorder style={ { height: 55, } }>
                                        <View style={ [ styles.mnemonicItem ] } >
                                            {/* <Text style={ { flex: 0.7, marginLeft: 20, color: "#B7B7B7", fontSize: 23, fontFamily: globalStyle.ffOpenSansExtraBold } }>{ item.index }</Text>
                                            <Text style={ { flex: 1, color: "#838383", fontFamily: globalStyle.ffFiraSansMedium } }>{ item.title }</Text> */}
                                            <Text style={ { flex: 0.7, marginLeft: 20, color: "#B7B7B7", fontSize: 23 } }>{ item.index }</Text>
                                            <Text style={ { flex: 1, color: "#838383" } }>{ item.title }</Text>
                                        </View>
                                    </ListItem>
                                </List>
                            ) }
                            keyExtractor={ ( item, index ) => index }
                        />
                    </View>
                    <View style={ styles.viewProcedBtn }>
                        <Button
                            onPress={ () => this.click_prev() }
                            style={ [ globalStyle.ffFiraSansSemiBold, {
                                backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                height: 50,
                            } ] }
                            full>
                            <Text>Previous</Text>
                        </Button>
                        <FullLinearGradientButton title="Next" disabled={ false } style={ [ { opacity: 1 }, { borderRadius: 10 } ] } click_Done={ () => this.props.click_Next() } />
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewList: {
        flex: 3,
    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    },
    mnemonicItem: {
        flex: 1,
        margin: 0,
        height: 45,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        borderRadius: 5
    }
} );
