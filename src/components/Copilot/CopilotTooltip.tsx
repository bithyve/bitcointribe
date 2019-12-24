import React from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet, AsyncStorage } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { withNavigation } from 'react-navigation';
import { cps } from 'redux-saga/effects';

function CopilotTooltip(props) {

    const onPressOk = () => {
        if (props.currentStep.name == "sendTransaction") {
            AsyncStorage.setItem("isSendHelperDone", 'true');
            props.handleStop();
            props.navigation.navigate('Send', { serviceType: "TEST_ACCOUNT" })
        }
        else if (props.currentStep.name == "receiveTransaction") {
            AsyncStorage.setItem("isReceiveHelperDone", 'true');
            props.handleStop();
            props.navigation.navigate('ReceivingAddress', { serviceType: "TEST_ACCOUNT" })
        }
        else if (props.currentStep.name == "Buy") {
            AsyncStorage.setItem("isBuyHelperDone", 'true');
            props.handleStop();
            props.navigation.navigate('ReceivingAddress', { serviceType: "TEST_ACCOUNT" })
        }
        else if (props.currentStep.name == "Sell") {
            AsyncStorage.setItem("isSellHelperDone", 'true');
            props.handleStop();
            props.navigation.navigate('ReceivingAddress', { serviceType: "TEST_ACCOUNT" })
        }
        else if (props.currentStep.name == "transaction") {
            AsyncStorage.setItem("isTransactionHelperDone", 'true');
            props.handleNext();
        }
        else if (props.currentStep.name == "transactionDetails") {
            AsyncStorage.setItem("isTransactionDetailsHelperDone", 'true');
            props.handleNext();
            // props.navigation.navigate('TransactionDetails', {item: props.currentStep.item})
        }
        else {
            props.handleStop();
        }
    }

    return (
        <View style={styles.tooltipContainer}>
            <Text testID="stepDescription" style={styles.tooltipText}>{props.currentStep.text}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => onPressOk()} style={{ padding: 5 }} ><Text style={{ color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>Ok</Text></TouchableOpacity>
                <TouchableOpacity style={{ padding: 5 }} onPress={() => props.handleStop()}><Text style={{ color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>Skip</Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tooltipText: {
        color: '#fff',
        fontSize: RFValue(20, 812),
        backgroundColor: 'rgba(0,0,0,0)'
    },
    tooltipContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
    },
    bottomBar: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
});

export default withNavigation(CopilotTooltip);