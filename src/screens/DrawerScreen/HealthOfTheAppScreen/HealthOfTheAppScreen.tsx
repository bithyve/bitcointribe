import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
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
    List, ListItem,
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";

export default class HealthOfTheAppScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_TrustedContacts: [ {
                title: "Health of the App",
                subTitle: "Lorem ipsum dolor sit amet",
                icon: "shield"
            },
            {
                title: "Change Backup Method",
                subTitle: "Currently your wallet is backed via Trusted Contact",
                icon: "shield"
            },
            {
                title: "Contacts that have shared secret with you",
                subTitle: "Lorem ipsum dolor sit amet,",
                icon: "contact-book"
            }
            ],
            arr_Mnemonic: [
                {
                    title: "Change Backup Method",
                    subTitle: "Currently your wallet is backed via Trusted Contact",
                    icon: "shield"
                }
            ],
            arr_SecretQuestion: [
                {
                    title: "Health of the App",
                    subTitle: "Lorem ipsum dolor sit amet",
                    icon: "shield"
                }
            ],
            arr_2FactorAuto: [
                {
                    title: "Health of the App",
                    subTitle: "Lorem ipsum dolor sit amet",
                    icon: "shield"
                }
            ]
        } )
    }





    //TODO: func click_FirstMenuItem
    click_MenuItem( item: any ) {
        let title = item.title;
        if ( title == "Contacts that have shared secret with you" ) {
            this.props.navigation.push( "TrustedPartyShareSecretNavigator" );
        } else if ( title == "Settings" ) {
            this.props.navigation.push( "SettingsNavigator" );
        }
        else {
            Alert.alert( "Working." );
        }
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Health of the App</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <View style={ styles.viewTrustedContacts }>
                                <View style={ { flex: 1, marginLeft: 10, marginTop: 20, marginBottom: 20 } }>
                                    <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Trusted Contacts</Text>
                                </View>
                                <View style={ { flex: 1 } }>
                                    <FlatList
                                        data={ this.state.arr_TrustedContacts }
                                        showsVerticalScrollIndicator={ false }
                                        scrollEnabled={ false }
                                        renderItem={ ( { item } ) => (
                                            <TouchableOpacity
                                                onPress={ () => this.click_MenuItem( item ) }
                                            >
                                                <RkCard
                                                    rkType="shadowed"
                                                    style={ {
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        marginBottom: 4,
                                                    } }
                                                >
                                                    <View
                                                        rkCardHeader
                                                        style={ {
                                                            flex: 1,
                                                        } }
                                                    >
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                            <SvgIcon
                                                                name={ item.icon }
                                                                color="#BABABA"
                                                                size={ 30 }
                                                            />
                                                        </View>
                                                        <View style={ { flex: 1, flexDirection: "column" } }>
                                                            <Text
                                                                style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                            >
                                                                { item.title }
                                                            </Text>
                                                            <Text note numberOfLines={ 1 } style={ { fontSize: 11 } }>{ item.subTitle }</Text>
                                                        </View>
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                            <SvgIcon
                                                                name="icon_forword"
                                                                color="#BABABA"
                                                                size={ 20 }
                                                            />
                                                        </View>
                                                    </View>
                                                </RkCard>
                                            </TouchableOpacity>
                                        ) }
                                        keyExtractor={ ( item, index ) => index }
                                    />
                                </View>
                            </View>

                            <View style={ styles.viewMnemonic }>
                                <View style={ { flex: 1, marginLeft: 10, marginTop: 20, marginBottom: 20 } }>
                                    <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Mnemonic</Text>
                                </View>
                                <View style={ { flex: 1 } }>
                                    <FlatList
                                        data={ this.state.arr_Mnemonic }
                                        showsVerticalScrollIndicator={ false }
                                        scrollEnabled={ false }
                                        renderItem={ ( { item } ) => (
                                            <TouchableOpacity
                                                onPress={ () => this.click_MenuItem( item ) }
                                            >
                                                <RkCard
                                                    rkType="shadowed"
                                                    style={ {
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        marginBottom: 4,
                                                    } }
                                                >
                                                    <View
                                                        rkCardHeader
                                                        style={ {
                                                            flex: 1,
                                                        } }
                                                    >
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                            <SvgIcon
                                                                name={ item.icon }
                                                                color="#BABABA"
                                                                size={ 30 }
                                                            />
                                                        </View>
                                                        <View style={ { flex: 1, flexDirection: "column" } }>
                                                            <Text
                                                                style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                            >
                                                                { item.title }
                                                            </Text>
                                                            <Text note numberOfLines={ 1 } style={ { fontSize: 11 } }>{ item.subTitle }</Text>
                                                        </View>
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                            <SvgIcon
                                                                name="icon_forword"
                                                                color="#BABABA"
                                                                size={ 20 }
                                                            />
                                                        </View>
                                                    </View>
                                                </RkCard>
                                            </TouchableOpacity>
                                        ) }
                                        keyExtractor={ ( item, index ) => index }
                                    />
                                </View>
                            </View>

                            <View style={ styles.viewSecretQuestion }>
                                <View style={ { flex: 1, marginLeft: 10, marginTop: 20, marginBottom: 20 } }>
                                    <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secret Questions</Text>
                                </View>
                                <View style={ { flex: 1 } }>
                                    <FlatList
                                        data={ this.state.arr_SecretQuestion }
                                        showsVerticalScrollIndicator={ false }
                                        scrollEnabled={ false }
                                        renderItem={ ( { item } ) => (
                                            <TouchableOpacity
                                                onPress={ () => this.click_MenuItem( item ) }
                                            >
                                                <RkCard
                                                    rkType="shadowed"
                                                    style={ {
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        marginBottom: 4,
                                                    } }
                                                >
                                                    <View
                                                        rkCardHeader
                                                        style={ {
                                                            flex: 1,
                                                        } }
                                                    >
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                            <SvgIcon
                                                                name={ item.icon }
                                                                color="#BABABA"
                                                                size={ 30 }
                                                            />
                                                        </View>
                                                        <View style={ { flex: 1, flexDirection: "column" } }>
                                                            <Text
                                                                style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                            >
                                                                { item.title }
                                                            </Text>
                                                            <Text note numberOfLines={ 1 } style={ { fontSize: 11 } }>{ item.subTitle }</Text>
                                                        </View>
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                            <SvgIcon
                                                                name="icon_forword"
                                                                color="#BABABA"
                                                                size={ 20 }
                                                            />
                                                        </View>
                                                    </View>
                                                </RkCard>
                                            </TouchableOpacity>
                                        ) }
                                        keyExtractor={ ( item, index ) => index }
                                    />
                                </View>
                            </View>

                            <View style={ styles.view2FactorAuto }>
                                <View style={ { flex: 1, marginLeft: 10, marginTop: 20, marginBottom: 20 } }>
                                    <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secure Wallet Two-Factor Autoentication</Text>
                                </View>
                                <View style={ { flex: 1 } }>
                                    <FlatList
                                        data={ this.state.arr_2FactorAuto }
                                        showsVerticalScrollIndicator={ false }
                                        scrollEnabled={ false }
                                        renderItem={ ( { item } ) => (
                                            <TouchableOpacity
                                                onPress={ () => this.click_MenuItem( item ) }
                                            >
                                                <RkCard
                                                    rkType="shadowed"
                                                    style={ {
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        marginBottom: 4,
                                                    } }
                                                >
                                                    <View
                                                        rkCardHeader
                                                        style={ {
                                                            flex: 1,
                                                        } }
                                                    >
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                            <SvgIcon
                                                                name={ item.icon }
                                                                color="#BABABA"
                                                                size={ 30 }
                                                            />
                                                        </View>
                                                        <View style={ { flex: 1, flexDirection: "column" } }>
                                                            <Text
                                                                style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                            >
                                                                { item.title }
                                                            </Text>
                                                            <Text note numberOfLines={ 1 } style={ { fontSize: 11 } }>{ item.subTitle }</Text>
                                                        </View>
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                            <SvgIcon
                                                                name="icon_forword"
                                                                color="#BABABA"
                                                                size={ 20 }
                                                            />
                                                        </View>
                                                    </View>
                                                </RkCard>
                                            </TouchableOpacity>
                                        ) }
                                        keyExtractor={ ( item, index ) => index }
                                    />
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
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
    viewTrustedContacts: {
        flex: 1
    },
    viewMnemonic: {
        flex: 1
    },
    viewSecretQuestion: {
        flex: 1
    },
    view2FactorAuto: {
        flex: 1
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    }
} );
