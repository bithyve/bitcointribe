import React from 'react';
import { StyleSheet, View, Modal, Text } from 'react-native';
import {
    MaterialIndicator
} from 'react-native-indicators';
import PropTypes from 'prop-types';

const Loader = ( { loading = false, color = "#000000", size = 30, opacity = 0.4, message = "Loading" } ) => {
    return (
        <Modal
            transparent
            animationType={ 'none' }
            visible={ loading }
            onRequestClose={ () => null }
        >
            <View
                style={ [
                    styles.modalBackground,
                    { backgroundColor: `rgba(0,0,0,${ opacity })` }
                ] }
            >
                <View style={ styles.activityIndicatorWrapper }>
                    <MaterialIndicator size={ size } color={ color } />
                    <Text style={ { paddingBottom: 10 } }>{ message }</Text>
                </View>
            </View>
        </Modal>
    );
};

Loader.propTypes = {
    loading: PropTypes.bool.isRequired,
    color: PropTypes.string,
    size: PropTypes.string,
    opacity: ( props, propName, componentName ) => {
        if ( props[ propName ] < 0 || props[ propName ] > 1 ) {
            return new Error( 'Opacity prop value out of range' );
        }
    },
    message: PropTypes.string
};

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    activityIndicatorWrapper: {
        height: 100,
        width: 100,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    }
} );

export default Loader;
