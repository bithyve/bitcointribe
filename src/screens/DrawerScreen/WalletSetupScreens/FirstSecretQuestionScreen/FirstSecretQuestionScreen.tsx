import React from "react";
import { StyleSheet, ImageBackground, View, Platform, Dimensions } from "react-native";
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
    Picker,
    Icon
} from "native-base";
import { Icon as CustIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Pages
import CustomeStatusBar from "bithyve/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "bithyve/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
//TODO: Custome Object
import { colors, images, localDB } from "bithyve/src/app/constants/Constants";
import renderIf from "bithyve/src/app/constants/validation/renderIf";

var localFirstAnswer = "";
var localSecoundAnswer = "";

export default class FirstSecretQuestionScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_QuestionList: [ {
                "item": "Name of your first pet?"
            }, {
                "item": "Name of your favourite teacher?"
            }, {
                "item": "Name of your favourite food?"
            }, {
                "item": "Name of your first company?"
            }, {
                "item": "Name of your first employee?"
            }
            ],
            firstQuestion: "Name of your first pet?",
            firstAnswer: "",
            secoundAnswer: "",
            flag_ConfirmDisableBtn: true
        };
    }

    //TODO: Select Picker Question List change aciton
    onValueChange( value: string ) {
        this.setState( {
            firstQuestion: value
        } );
    }

    //TODO: func check_CorrectAnswer
    check_CorrectAnswer() {
        let firstAns = localFirstAnswer;
        let secoundAns = localSecoundAnswer;
        //console.log( { firstAns, secoundAns } );
        if ( firstAns == secoundAns && firstAns.length >= 6 ) {
            this.setState( {
                flag_ConfirmDisableBtn: false
            } )
        } else {
            this.setState( {
                flag_ConfirmDisableBtn: true
            } )
        }
    }


    //TODO: func click_FirstQuestion
    click_FirstQuestion() {
        let question = this.state.firstQuestion;
        let answer = this.state.secoundAnswer;
        let walletName = this.props.navigation.getParam( "walletName" );
        let arr_QuestionList = this.state.arr_QuestionList;
        this.props.navigation.push( "SecondSecretQuestion", {
            walletName,
            question,
            answer,
            arr_QuestionList
        } );
    }
    render() {
        const itemList = this.state.arr_QuestionList.map( ( item: any, index: number ) => (
            <Picker.Item label={ item.item } value={ item.item } />
        ) );
        return (
            <View style={ styles.container }>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                    <View style={ { marginLeft: 10, marginTop: 15 } }>
                        <Button
                            transparent
                            onPress={ () => this.props.navigation.pop() }
                        >
                            <CustIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                            <Text style={ { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0, fontFamily: "FiraSans-Medium" } }>Set up your wallet</Text>
                        </Button>
                    </View>
                    <KeyboardAwareScrollView
                        enableOnAndroid
                        extraScrollHeight={ 40 }
                        contentContainerStyle={ { flexGrow: 1, } }
                    >
                        <View style={ styles.viewPagination }>
                            <Text style={ { fontWeight: "bold", fontFamily: "FiraSans-Medium", fontSize: 22, textAlign: "center" } }>Step 2: Select first secret question</Text>
                            <Text note style={ { marginTop: 20, textAlign: "center" } }>To Set up you need to select two secret questions</Text>
                        </View>
                        <View style={ styles.viewInputFiled }>

                            <View style={ styles.itemQuestionPicker }>
                                <Picker
                                    renderHeader={ backAction =>
                                        <Header style={ { backgroundColor: "#ffffff" } }>
                                            <Left>
                                                <Button transparent onPress={ backAction }>
                                                    <Icon name="arrow-back" style={ { color: "#000" } } />
                                                </Button>
                                            </Left>
                                            <Body style={ { flex: 3 } }>
                                                <Title style={ { color: "#000" } }>Select Question</Title>
                                            </Body>
                                            <Right />
                                        </Header> }
                                    mode="dropdown"
                                    iosIcon={ <Icon name="arrow-down" style={ { fontSize: 25, marginLeft: -30 } } /> }
                                    selectedValue={ this.state.firstQuestion }
                                    onValueChange={ this.onValueChange.bind( this ) }
                                >
                                    { itemList }
                                </Picker>
                            </View>


                            <Item rounded style={ styles.itemInputWalletName }>
                                <Input
                                    secureTextEntry
                                    keyboardType="default"
                                    autoCapitalize='sentences'
                                    placeholder='Write your answer here'
                                    placeholderTextColor="#B7B7B7"
                                    onChangeText={ ( val ) => {
                                        localFirstAnswer = val;
                                        this.setState( {
                                            firstAnswer: val
                                        } )
                                    } }
                                    onKeyPress={ () => {
                                        this.check_CorrectAnswer()
                                    } }
                                    onSubmitEditing={ () => {
                                        this.check_CorrectAnswer()
                                    } }
                                />
                            </Item>
                            <Item rounded style={ styles.itemInputWalletName }>
                                <Input
                                    keyboardType="default"
                                    autoCapitalize='none'
                                    placeholder='Confirm answer'
                                    placeholderTextColor="#B7B7B7"
                                    onChangeText={ ( val ) => {
                                        localSecoundAnswer = val;
                                        this.setState( {
                                            secoundAnswer: val
                                        } )
                                    } }
                                    onKeyPress={ () => {
                                        this.check_CorrectAnswer()
                                    } }
                                    onSubmitEditing={ () => {
                                        this.check_CorrectAnswer()
                                    } }
                                />
                            </Item>
                        </View>
                        <View style={ styles.viewProcedBtn }>
                            <Text note style={ { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } } numberOfLines={ 1 }>Make sure you don’t select questions, answers to </Text>
                            <FullLinearGradientButton title="Confirm & Select Second Question" disabled={ this.state.flag_ConfirmDisableBtn } style={ [ this.state.flag_ConfirmDisableBtn == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] } click_Done={ () => this.click_FirstQuestion() } />
                        </View>
                    </KeyboardAwareScrollView>
                </ImageBackground>
            </View>

        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#FCFCFC",
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
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
    itemQuestionPicker: {
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    }
} );
