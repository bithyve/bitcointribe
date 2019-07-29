import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Dimensions, Platform, Image, TextInput } from 'react-native';
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
} from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { Avatar } from 'react-native-elements';
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Model
import ModelPasscode from '../ModelCommom/ModelPasscode';


interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    images
} from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";


let wrongEnterAnswerCount = 0;

export default class ModelBackupSecretQuestionsFirstQuestion extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            anwser: "",
            firstQuestion: "",
            firstAnswer: "",
            answerBorderColor: "#EFEFEF",
            arr_ModelPasscode: [],
            flag_DisableBtnNext: true
        } );
    }


    componentWillReceiveProps( nextProps: any ) {
        var data = nextProps.data[ 0 ];
        data = data.data[ 0 ];
        this.setState( {
            firstQuestion: data.Question,
            anwser: data.Answer
        } );
    }


    //TODO: func check_CorrectAnswer
    check_CorrectAnswer() {
        setTimeout( () => {
            let firstAns = this.state.firstAnswer;
            if ( firstAns.length >= 6 ) {
                this.setState( {
                    flag_DisableBtnNext: false
                } )
            }
            else {
                this.setState( {
                    flag_DisableBtnNext: true,
                    answerBorderColor: "#EFEFEF"
                } )
            }
        }, 100 );
    }

    //TODO: Next button on click
    click_Next() {
        let answer = this.state.anwser;
        let enterAnswer = this.state.firstAnswer;
        if ( answer != enterAnswer ) {
            this.setState( {
                answerBorderColor: "#E64545",
            } )
            wrongEnterAnswerCount = wrongEnterAnswerCount + 1;
            console.log( { wrongEnterAnswerCount } );

        } else {
            this.props.click_Next();
        }
        // console.log( { answer, enterAnswer } );
    }

    render() {
        let { flag_DisableBtnNext, answerBorderColor, anwser, firstQuestion, firstAnswer } = this.state;
        return (
            <Modal
                transparent
                animationType={ 'fade' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <KeyboardAwareScrollView
                    enableAutomaticScroll
                    automaticallyAdjustContentInsets={ true }
                    keyboardOpeningTime={ 0 }
                    enableOnAndroid={ true }
                    contentContainerStyle={ { flexGrow: 1 } }
                >
                    <View style={ [
                        styles.modalBackground,
                        { backgroundColor: `rgba(0,0,0,0.4)` }
                    ] }
                    >
                        <View style={ styles.viewModelBody }>
                            <View style={ { flexDirection: "row", flex: 0.5 } }>
                                <Button
                                    transparent
                                    onPress={ () => this.props.pop() }
                                >
                                    <SvgIcon name="icon_back" size={ 25 } color="gray" />
                                </Button>
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }></Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <Image source={ images.backupSecretQuestion.icon } style={ { width: 80, height: 80, marginTop: -30 } } />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20 } ] }>Health Check</Text>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { fontSize: 14, margin: 10 } ] }>Security Questions</Text>
                                <Text note style={ { textAlign: "center" } }>Answer the questions exactly as you did at the time of setting up the wallet</Text>
                                <View style={ [ styles.itemQuestionPicker, { height: 80 } ] }>
                                    <TextInput
                                        value={ firstQuestion }
                                        style={ { padding: 5 } }
                                        multiline={ true }
                                        numberOfLines={ 10 }
                                        editable={ false }
                                    />
                                </View>
                                <Item rounded style={ styles.itemInputWalletName }>
                                    <Input
                                        secureTextEntry
                                        keyboardType="default"
                                        autoCapitalize='none'
                                        value={ firstAnswer }
                                        placeholder='Enter answer to the secret question'
                                        style={ [ globalStyle.ffFiraSansMedium, answerBorderColor == "#E64545" ? { borderColor: answerBorderColor, borderWidth: 1.5, marginTop: -1, borderRadius: 8 } : null ] }
                                        placeholderTextColor="#B7B7B7"
                                        onChangeText={ ( val ) => {
                                            this.setState( {
                                                firstAnswer: val
                                            } )
                                        } }
                                        onKeyPress={ () =>
                                            this.check_CorrectAnswer()
                                        }

                                    />
                                </Item>
                                { renderIf( answerBorderColor == "#E64545" )(
                                    <Text style={ { color: "red", fontSize: 12, alignSelf: "flex-end", marginRight: 8 } }>Invalid Answer!</Text>
                                ) }
                            </View>
                            <View style={ { flex: 0.1, justifyContent: "flex-end" } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12, marginBottom: 20 } ] }>Answer will be required in case you need to restore your wallet</Text>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_Next()
                                    }
                                    }
                                    title="Next"
                                    disabled={ flag_DisableBtnNext }
                                    style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                />
                                { renderIf( wrongEnterAnswerCount >= 2 )(
                                    <Button
                                        onPress={ () => {
                                            this.setState( {
                                                arr_ModelPasscode: [
                                                    {
                                                        modalVisible: true,
                                                    }
                                                ]
                                            } );

                                        } }
                                        style={ [ globalStyle.ffFiraSansSemiBold, {
                                            backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                            height: 50,
                                        } ] }
                                        full>
                                        <Text style={ { color: "#ffffff" } }>View Answer</Text>
                                    </Button>
                                ) }
                            </View>
                        </View>
                        <ModelPasscode data={ this.state.arr_ModelPasscode }
                            click_Next={ () => {
                                this.setState( {
                                    firstAnswer: "",
                                    answerBorderColor: "#EFEFEF",
                                    arr_ModelPasscode: [
                                        {
                                            modalVisible: false,
                                        }
                                    ]
                                } )
                                wrongEnterAnswerCount = 1;
                                setTimeout( () => {
                                    Alert.alert(
                                        "Your answer is",
                                        anwser,
                                        [
                                            {
                                                text: 'Ok', onPress: () => {
                                                    console.log( 'ok' );
                                                }
                                            }
                                        ],
                                        { cancelable: true }
                                    )
                                }, 100 );

                            } }
                            closeModal={ () => {
                                this.setState( {
                                    arr_ModelPasscode: [
                                        {
                                            modalVisible: false,
                                        }
                                    ]
                                } )
                            } }
                        />
                    </View>
                </KeyboardAwareScrollView>
            </Modal >
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center'
    },
    viewModelBody: {   
        flex: 0.7,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    },
    itemInputWalletName: {
        width: Dimensions.get( 'screen' ).width / 1.21,
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
        marginTop: 20,
        width: Dimensions.get( 'screen' ).width / 1.21,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
} );