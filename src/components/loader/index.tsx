import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet, Modal, AppState } from 'react-native'
import PropTypes from 'prop-types'
import Color from '../../common/Colors'

const Loader = ( { backgroundColor, indicatorColor, isLoading } ) => {
  const [ visibility, setVisibility ] = useState( true )
  useEffect( () => {
    const subscription = AppState.addEventListener(
      'change',
      onAppStateChange
    )
    return () => subscription.remove()
  }, [] )

  const  onAppStateChange = ( state ) => {
    if ( state === 'background' || state === 'inactive' ) setVisibility( false )
    if( state == 'active' ) setVisibility( true )
  }

  return <Modal
    animationType='fade'
    transparent={true}
    visible={visibility}>
    <View style={[ styles.container, {
      backgroundColor
    } ]}>
      {isLoading ? <ActivityIndicator size="large" animating color={indicatorColor} /> : null}
    </View>
  </Modal>
}

export default Loader

const styles = StyleSheet.create( {
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
} )

Loader.propTypes = {
  backgroundColor: PropTypes.string,
  indicatorColor: PropTypes.string,
  isLoading: PropTypes.bool,
}

Loader.defaultProps = {
  backgroundColor: 'rgba(1,1,1,0.4)',
  indicatorColor: Color.gray1,
}
