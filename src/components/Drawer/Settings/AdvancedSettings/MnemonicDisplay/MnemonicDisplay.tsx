import React from "react";
import { StyleSheet, ImageBackground, SafeAreaView } from "react-native";
import {
    Container
} from "native-base";



//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";



//TODO: Custome Model
import ModelPasscode from "HexaWallet/src/app/custcompontes/Model/ModelCommom/ModelPasscode";
import ModelBackupSecretQuestionsFirstQuestion from "HexaWallet/src/app/custcompontes/Model/ModelBackupSecretQuestions/ModelBackupSecretQuestionsFirstQuestion";
import ModelMnemonicDisplay from "HexaWallet/src/app/custcompontes/Model/ModelMnemonicDisplay/ModelMnemonicDisplay";

//TODO: Custome Object
import { colors, images } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );

export default class MnemonicDisplay extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arrModelPasscode: [],
            arrModelBackupSecretQuestionsFirstQuestion: [],
            walletAnswerDetails: [],
            arrModelMnemonicDisplay: [],
            mnemonic: ""
        } )
    }

    async componentWillMount() {
        let walletDetails = await utils.getWalletDetails();
        this.setState( {
            arrModelPasscode: [
                {
                    modalVisible: true,
                }
            ],
            walletAnswerDetails: JSON.parse( walletDetails.setUpWalletAnswerDetails ),
            mnemonic: walletDetails.mnemonic
        } );

    }



    render() {
        //array
        let { arrModelPasscode, walletAnswerDetails, arrModelBackupSecretQuestionsFirstQuestion, arrModelMnemonicDisplay } = this.state;
        //values
        let { mnemonic } = this.state;
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <ModelPasscode
                            data={ arrModelPasscode }
                            closeModal={ () => this.props.navigation.pop() }
                            click_Next={ () => {
                                this.setState( {
                                    arrModelPasscode: [ {
                                        modalVisible: false
                                    } ],
                                    arrModelBackupSecretQuestionsFirstQuestion: [ {
                                        modalVisible: true,
                                        data: walletAnswerDetails
                                    } ]
                                } )
                            } }
                        />
                        <ModelBackupSecretQuestionsFirstQuestion
                            data={ arrModelBackupSecretQuestionsFirstQuestion }
                            click_Next={ () => {
                                this.setState( {
                                    arrModelBackupSecretQuestionsFirstQuestion: [
                                        {
                                            modalVisible: false,
                                            data: walletAnswerDetails
                                        }
                                    ],
                                    arrModelMnemonicDisplay: [ {
                                        modalVisible: true,
                                        data: mnemonic
                                    } ]
                                } );
                            } }
                            pop={ () => {
                                this.setState( {
                                    arrModelBackupSecretQuestionsFirstQuestion: [
                                        {
                                            modalVisible: false,
                                            data: walletAnswerDetails
                                        }
                                    ]
                                } );
                                this.props.navigation.pop()
                            } }
                        />
                        <ModelMnemonicDisplay
                            data={ arrModelMnemonicDisplay }
                            pop={ () => {
                                this.setState( {
                                    arrModelMnemonicDisplay: [ {
                                        modalVisible: false,
                                        data: mnemonic
                                    } ]
                                } )
                                this.props.navigation.pop()
                            } }
                        />
                    </SafeAreaView>
                </ImageBackground>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message="Loading" />
                <CustomeStatusBar backgroundColor={ colors.white } hidden={ true } barStyle="dark-content" />
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
    },
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }
} );
