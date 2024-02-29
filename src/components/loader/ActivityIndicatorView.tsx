import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import Colors from 'src/common/Colors';

function ActivityIndicatorView({
    showLoader = true,
}: {
    showLoader?: boolean;
}) {
    return (
        <Modal
            visible={showLoader}
            transparent={true}
        >
            {showLoader ? (
                <View 
                    style={{
                        flex: 1,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    
                    }}
                >
                    <ActivityIndicator testID="activityIndicator" size="large" animating color={Colors.blue} />
                </View>
            ) : null}
        </Modal>
    );
}

export default ActivityIndicatorView;
