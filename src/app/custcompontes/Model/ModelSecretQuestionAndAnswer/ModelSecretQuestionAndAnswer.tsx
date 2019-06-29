import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Dimensions, Platform, Image } from 'react-native';
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

export default class ModelSecretQuestionAndAnswer extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_QuestionList: [],
            arr_SelectedList: [],
            firstQuestion: "",
            firstAnswer: "",
            secoundAnswer: "",
            answerBorderColor: "#808080",
            flag_DisableBtnNext: true
        } );
    }


    componentWillReceiveProps( nextProps: any ) {
        var data = nextProps.data;
        if ( data.length != 0 ) {
            data = data[ 0 ].data;
            console.log( { data } );
            this.setState( {
                arr_QuestionList: data.question,
                arr_SelectedList: data.seletedContactList,
                firstQuestion: data.question[ 0 ].item
            } );
        }
    }

    //TODO: Select Picker Question List change aciton
    onValueChange( value: string ) {
        this.setState( {
            firstQuestion: value
        } );
    }

    check_CorrectAnswer() {
        setTimeout( () => {
            let firstAns = this.state.firstAnswer;
            let secoundAns = this.state.secoundAnswer;
            if ( secoundAns.length >= 6 && firstAns.length >= 6 ) {
                if ( secoundAns != firstAns ) {
                    this.setState( {
                        flag_DisableBtnNext: true,
                        answerBorderColor: "#E64545",
                    } )
                } else {
                    this.setState( {
                        flag_DisableBtnNext: false,
                        answerBorderColor: "#808080",
                    } )
                }
            } else {
                this.setState( {
                    flag_DisableBtnNext: true
                } )
            }
        }, 100 );

    }

    //TODO: Next button on click
    click_Next() {
        let { secoundAnswer, arr_SelectedList } = this.state;
        console.log( { secoundAnswer, arr_SelectedList } );
    }

    render() {
        //array
        let { arr_QuestionList } = this.state;
        //values
        let { firstQuestion, firstAnswer, secoundAnswer, answerBorderColor } = this.state;
        //flag
        let { flag_DisableBtnNext } = this.state;
        const itemList = arr_QuestionList.map( ( item: any, index: number ) => (
            <Picker.Item label={ item.item } value={ item.item } style={ { width: 40 } } />
        ) );
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
                    contentContainerStyle={ { flexGrow: 0.7 } }
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20 } ] }>Security Questions</Text>
                                <Text note style={ { textAlign: "center" } }>Setup your question and answer.</Text>
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
                                                    <Title style={ [ globalStyle.ffFiraSansMedium, { color: "#000" } ] }>Select Question</Title>
                                                </Body>
                                                <Right />
                                            </Header> }
                                        mode="dropdown"
                                        style={ [ globalStyle.ffFiraSansMedium, ] }
                                        textStyle={ { paddingRight: 50 } }
                                        iosIcon={ <Icon name="arrow-down" style={ { fontSize: 25, marginLeft: -45, marginRight: 20 } } /> }
                                        selectedValue={ firstQuestion }
                                        onValueChange={ this.onValueChange.bind( this ) }
                                    >
                                        { itemList }
                                    </Picker>
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
                                <Item rounded style={ styles.itemInputWalletName }>
                                    <Input
                                        secureTextEntry
                                        keyboardType="default"
                                        autoCapitalize='none'
                                        value={ secoundAnswer }
                                        placeholder='Confirm answer to the secret question'
                                        style={ [ globalStyle.ffFiraSansMedium, answerBorderColor == "#E64545" ? { borderColor: answerBorderColor, borderWidth: 1.5, marginTop: -1, borderRadius: 8 } : null ] }
                                        placeholderTextColor="#B7B7B7"
                                        onChangeText={ ( val ) => {
                                            this.setState( {
                                                secoundAnswer: val
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
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12, marginBottom: 20 } ] }>These answers will be required in case you need to restore your wallet</Text>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_Next()
                                    }
                                    }
                                    title="Next"
                                    disabled={ flag_DisableBtnNext }
                                    style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                />
                            </View>
                        </View>
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