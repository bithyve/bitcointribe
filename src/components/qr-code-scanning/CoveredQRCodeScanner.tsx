import React, { useState, useRef } from 'react'
import { View, StyleSheet, ImageBackground, ImageSourcePropType } from 'react-native'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { RNCamera, BarCodeReadEvent } from 'react-native-camera'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import { setIsPermissionGiven } from '../../store/actions/preferences'
import { useSelector, useDispatch } from 'react-redux'

export type Props = {
  containerStyle?: Record<string, unknown>;
  coverImageSource?: ImageSourcePropType;
  onCodeScanned: ( event: BarCodeReadEvent ) => void;
};

// TODO: Make the styling here a bit more readable 🙂.
const CameraFrameIndicators: React.FC = () => {
  return (
    <>
      <View style={styles.view1}>
        <View style={styles.view2} />
        <View style={styles.view3} />
      </View>

      <View style={styles.view4}>
        <View style={styles.view5} />
        <View style={styles.view6} />
      </View>
    </>
  )
}

const CoveredQRCodeScanner: React.FC<Props> = ( {
  containerStyle = {
  },
  coverImageSource = require( '../../assets/images/icons/iPhone-QR.png' ),
  onCodeScanned,
}: Props ) => {
  const [ isCameraOpen, setIsCameraOpen ] = useState( true )
  const dispatch = useDispatch()

  const CameraCover: React.FC = () => {
    return (
      <AppBottomSheetTouchableWrapper onPress={() => {
        setIsCameraOpen( true )
        dispatch( setIsPermissionGiven( true ) )
        // let data ={
        //   key: "a9a1a6b7f20c58a55f83c949",
        //   name: 'primaryk'
        // }
        // onCodeScanned(data)
      }} >
        <ImageBackground
          source={coverImageSource}
          style={{
            ...styles.rootContainer, ...containerStyle
          }}
        >
          <CameraFrameIndicators />
        </ImageBackground>
      </AppBottomSheetTouchableWrapper>
    )
  }

  // TODO: It would probably be good to abstract this into its own component file
  // so we can use it independently of the toggleable cover overlay.
  const Scanner: React.FC = () => {
    const cameraRef = useRef<RNCamera>()

    return (
      <View style={{
        ...styles.rootContainer, ...containerStyle
      }}>
        <RNCamera
          ref={cameraRef}
          style={{
            flex: 1,
          }}
          onBarCodeRead={( event: BarCodeReadEvent ) => {
            onCodeScanned( event )
            setIsCameraOpen( false )
          }}
          captureAudio={false}
        >
          <CameraFrameIndicators />
        </RNCamera>
      </View >
    )
  }

  if ( isCameraOpen ) {
    return <Scanner />
  } else {
    return <CameraCover />
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    overflow: 'hidden',
    borderRadius: 20,
    alignSelf: 'center',
    width: widthPercentageToDP( 90 ),
    height: widthPercentageToDP( 90 ),
  },
  view1:{
    flexDirection: 'row',
    paddingTop: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%'
  },
  view2: {
    borderLeftWidth: 1,
    borderTopColor: 'white',
    borderLeftColor: 'white',
    height: heightPercentageToDP( '5%' ),
    width: heightPercentageToDP( '5%' ),
    borderTopWidth: 1
  },
  view3:{
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderTopColor: 'white',
    height: heightPercentageToDP( '5%' ),
    width: heightPercentageToDP( '5%' ),
    marginLeft: 'auto'
  },
  view4: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  view5: {
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    borderLeftColor: 'white',
    height: heightPercentageToDP( '5%' ),
    width: heightPercentageToDP( '5%' ),
  },
  view6: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderBottomColor: 'white',
    height: heightPercentageToDP( '5%' ),
    width: heightPercentageToDP( '5%' ),
    marginLeft: 'auto',
  }
} )

export default CoveredQRCodeScanner
