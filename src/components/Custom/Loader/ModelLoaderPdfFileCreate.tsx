import React from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Text } from 'native-base';

const ModelLoaderPdfFileCreate = ({
    loading = false,
    color,
    size,
    opacity = 0.4,
    msg = 'Loading'
}) => {
    return (
        <Modal
            transparent
            animationType={'none'}
            visible={loading}
            onRequestClose={() => null}
        >
            <View
                style={[
                    styles.modalBackground,
                    { backgroundColor: `rgba(0,0,0,0.7)` }
                ]}
            >
                <View style={styles.activityIndicatorWrapper}>
                    <MaterialIndicator size={size} color={color} />
                    <Text
                        style={{
                            textAlign: 'center',
                            margin: 20,
                            color: '#ffffff'
                        }}
                    >
                        {msg}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center'
    },
    activityIndicatorWrapper: {
        height: 100,
        borderRadius: 10
    }
});

export default ModelLoaderPdfFileCreate;
