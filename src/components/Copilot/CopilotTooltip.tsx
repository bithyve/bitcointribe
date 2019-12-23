import React from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";

export default function CopilotTooltip(props) {
    return (
        <View style={styles.tooltipContainer}>
            <Text testID="stepDescription" style={styles.tooltipText}>{props.currentStep.text}</Text>
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
        backgroundColor: 'rgba(0,0,0,0)'
    },
    bottomBar: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
});