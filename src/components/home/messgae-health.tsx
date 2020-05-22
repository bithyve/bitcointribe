import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../common/Colors';

const MessageAsPerHealth = ({ health }) => {
    if (health == 0) {
        return (
            <Text numberOfLines={1} style={{ ...styles.headerInfoText }}>
                The wallet backup is not secure.{'\n'}Please visit the health section
            to{'\n'}improve the health of your backup
            </Text>
        );
    } else if (health > 0 && health < 100) {
        return (
            <Text numberOfLines={1} style={styles.headerInfoText}>
                The wallet backup is not secured.{'\n'}Please complete the setup to
                {'\n'}safeguard against loss of funds
            </Text>
        );
    } else {
        return (
            <Text numberOfLines={1} style={styles.headerInfoText}>
                <Text style={{ fontStyle: 'italic' }}>Great!! </Text>The wallet backup
            is{'\n'}secure. Keep an eye on the{'\n'}health of the backup here
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    headerInfoText: {
        fontSize: RFValue(12),
        color: Colors.white,
    },
})

export default memo(MessageAsPerHealth)
