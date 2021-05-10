import React, { useState, useCallback, useRef } from 'react'
import { View, Image, Text, StyleSheet, Platform, Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  widthPercentageToDP, heightPercentageToDP,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import KnowMoreButton from './KnowMoreButton'
import { useDispatch, useSelector } from 'react-redux'
// import {
//   restoreShareFromQR,
//   UnableRecoverShareFromQR,
// } from '../../store/actions/sss'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import ErrorModalContents from './ErrorModalContents'
import ModalHeader from './ModalHeader'
import Toast from './Toast'
import CoveredQRCodeScanner from './qr-code-scanning/CoveredQRCodeScanner'
import NavStyles from '../common/Styles/NavStyles'
import getFormattedStringFromQRString from '../utils/qr-codes/GetFormattedStringFromQRData'
import Indicator from './Indiactor'

export default function RestoreByCloudQRCodeContents( props ) {
  // const [ qrData, setQrData ] = useState( '' )
  const [QRData, setQRData] = useState([])
  const [showQr, setShowQR] = useState(false)
  const [scanCount, setScanCount] = useState(1)
  const [ qrDataArray, setQrDataArray ] = useState( [] )
  let [ counter, setCounter ] = useState( 1 )
  let [ startNumberCounter, setStartNumberCounter ] = useState( 1 )
  const dispatch = useDispatch()
  const errorBottomSheetRef = useRef<BottomSheet>( null )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ processButtonText, setProcessButtonText ] = useState( 'Okay' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const unableRecoverShareFromQR = useSelector(
    ( state ) => state.sss.unableRecoverShareFromQR,
  )
  // console.log( 'unableRecoverShareFromQR', unableRecoverShareFromQR )

  const checkUndefined = (arr) => {
    let isUndefined = false
    if (arr.length === 0) {
      isUndefined = true
    }
    for(let i = 0; i< arr.length; i++) {
      if (typeof arr[i] == 'undefined') {
        isUndefined =true
        break;
      }
    }
    return isUndefined;
  }
  const handleQRDataScanned = ( dataString ) => {
    // Added here just for testing will need to chnage <PendingTask>
    const parsedData = JSON.parse(dataString)
    // console.log('parsedData', parsedData);
    
    let newArr = [...QRData]

    if (parsedData.AnimatedQR) {
      
      const isUndefined = checkUndefined(newArr)
      console.log('checkUndefined', isUndefined);
      if (QRData.length < parsedData.totalCode || isUndefined) {
        console.log('parsedData.index>>>>>>>', parsedData.index);
        // qrData.push()
        newArr[parsedData.index]= JSON.stringify(parsedData.share)
        // newArr.splice(parsedData.index, 0, parsedData.share)

        // console.log('>>>>>> newArr.length', newArr.length);
        
        setScanCount(newArr.length)
        setQRData(newArr);
        setShowQR(true)
      } else {
        setShowQR(false)
        // REMOVE THIS <PendingTask>
        Alert.alert("", 'Done!!! Please wait while we restoring data')
        // newArr can get pass for recovery
        console.log('JSON.parse(newArr.toString())', newArr.join(""));
      }
    }
    // const tempArray = qrDataArray
    // const shareCode = qrData.substring( 0, 2 )
    // if ( shareCode !== 'e0' && shareCode !== 'c0' ) {
    //   console.log( 'shareCode', shareCode )
    //   setTimeout( () => {
    //     setErrorMessageHeader( 'Invalid QR' )
    //     setErrorMessage( 'Please try again' )
    //     setProcessButtonText( 'Try again' )
    //   }, 2 )
    //   errorBottomSheetRef.current.snapTo( 1 )
    //   console.log( 'shareCode1', shareCode )
    //   //Alert.alert('Invalid QR', 'Please try again');
    //   return
    // }
    // const startNumber1 = qrData.substring( 2, 3 )
    // console.log( 'startNumber', startNumber1 )
    // setQrData( qrData )
    // const temp1 =
    //   startNumberCounter == 1
    //     ? startNumberCounter + 'st'
    //     : startNumberCounter == 2
    //       ? startNumberCounter + 'nd'
    //       : startNumberCounter == 3
    //         ? startNumberCounter + 'rd'
    //         : startNumberCounter == 9
    //           ? 8
    //           : startNumberCounter + 'th'
    // for ( let i = 0; i < 8; i++ ) {
    //   if ( qrDataArray[ i ] == qrData ) {
    //     setTimeout( () => {
    //       setErrorMessageHeader( 'Scan QR code' )
    //       setErrorMessage( 'Please scan ' + temp1 + ' QR code' )
    //       setProcessButtonText( 'Okay' )
    //     }, 2 )
    //     errorBottomSheetRef.current.snapTo( 1 )
    //     return
    //   }
    //   if ( startNumberCounter != startNumber1 ) {
    //     console.log( 'in if', startNumber1, startNumberCounter )
    //     setTimeout( () => {
    //       setErrorMessageHeader( 'Scan QR code' )
    //       setErrorMessage( 'Please scan ' + temp1 + ' QR code' )
    //       setProcessButtonText( 'Okay' )
    //     }, 2 )
    //     errorBottomSheetRef.current.snapTo( 1 )

    //     return
    //   }
    // }
    // if ( qrDataArray.length <= 8 ) {
    //   tempArray.push( qrData )
    //   setQrDataArray( tempArray )
    //   const temp =
    //     counter == 1
    //       ? counter + 'st'
    //       : counter == 2
    //         ? counter + 'nd'
    //         : counter == 3
    //           ? counter + 'rd'
    //           : counter == 9
    //             ? 8
    //             : counter + 'th'

    //   Toast( temp + ' QR code scanned, please scan the next one' )

    //   counter++
    //   setCounter( counter )
    //   startNumberCounter++
    //   setStartNumberCounter( startNumberCounter )
    // }
    // if ( qrDataArray.length === 8 ) {
    // //   dispatch( restoreShareFromQR( qrDataArray ) )
    //   setQrDataArray( [] )
    //   setCounter( 1 )
    //   setQrData( '' )
    //   setStartNumberCounter( 1 )

    // //   props.onScanCompleted( shareCode )
    // }
  }

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={processButtonText}
        onPressProceed={() => {
          errorBottomSheetRef.current.snapTo( 0 )
        }}
        isBottomImage={true}
        bottomImage={require( '../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader, processButtonText ] )

  const renderErrorModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          errorBottomSheetRef.current.snapTo( 0 )
        }}
      />
    )
  }, [] )

//   if ( unableRecoverShareFromQR ) {
//     setTimeout( () => {
//       setErrorMessageHeader( 'Error receiving Recovery Key' )
//       setErrorMessage( 'Invalid QR or error while receiving, please try again' )
//       setProcessButtonText( 'Try again' )
//     }, 2 )
//     errorBottomSheetRef.current.snapTo( 1 )
//     dispatch( UnableRecoverShareFromQR( null ) )
//   }

  return (
    <View style={styles.rootContainer}>
      <ScrollView>
        <View style={NavStyles.modalHeaderTitleView}>
          <View style={{
            flexDirection: 'row', flex: 1 
          }}>
            <View>
              <Text style={NavStyles.modalHeaderTitleText}>
                Enter Recovery Key
              </Text>
              <Text numberOfLines={2} style={NavStyles.modalHeaderInfoText}>
                {/* {props.pageInfo} */}
                Your keeper have 7 QR codes 
              </Text>
            </View>
            <View style={{
              flexDirection: 'row', marginLeft: 'auto' 
            }}>
              <KnowMoreButton
                onpress={() => {
                  // Alert.alert(qrData);
                }}
                containerStyle={{
                }}
                textStyle={{
                }}
              />
              <Image
                source={require( '../assets/images/icons/icon_error_red.png' )}
                style={{
                  width: widthPercentageToDP( '5%' ),
                  height: widthPercentageToDP( '5%' ),
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>
        </View>

        <View style={{
          marginLeft: 30 
        }}>
          {/* <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue( 13, 812 ),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Step {scanCount == 8 ? 7 : scanCount} of 7
          </Text> */}
          <Text
            numberOfLines={2}
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 11, 812 ),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            {/* {props.pageInfo} */}
            Please scan the{' '}
            {scanCount == 1
              ? scanCount + 'st'
              : scanCount == 2
                ? scanCount + 'nd'
                : scanCount == 3
                  ? scanCount + 'rd'
                  : scanCount == 9
                    ? 8
                    : scanCount + 'th'}{' '}
            QR code from your keeper
          </Text>
        </View>

        <View style={styles.qrScannerSection}>
          <Text style={{
            ...NavStyles.modalHeaderSubtitleText, fontSize: RFValue( 15 ) 
          }}>
            Scan a Bitcoin address or any Hexa QR
          </Text>

          <CoveredQRCodeScanner
            // setShowQR={setShowQR}
            // showQR={showQr}
            // isAnimatedQR={true}
            onCodeScanned={( { data: dataString }: { data: string } ) => {
            handleQRDataScanned( getFormattedStringFromQRString( dataString ) )
          }} />
        </View>

        <View
          style={{
            marginBottom: heightPercentageToDP( '3%' ),
            marginTop: heightPercentageToDP( '1%' ),
            marginRight: 20,
          }}
        >
          <Indicator data={new Array(7).fill(0)} curentIndex={scanCount-1} />
        </View>
      </ScrollView>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={errorBottomSheetRef}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? heightPercentageToDP( '35%' ) : heightPercentageToDP( '40%' ),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </View>
  )
}
const styles = StyleSheet.create( {
  rootContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
  },

  qrScannerSection: {
    flex: 1,
    marginVertical: 16,
    paddingHorizontal: 16,
  },

  qrModalImage: {
    width: widthPercentageToDP( '100%' ),
    height: widthPercentageToDP( '100%' ),
    borderRadius: 20,
    marginTop: heightPercentageToDP( '5%' ),
  },

  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },

  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 2,
    marginRight: 2,
  },

  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 2,
    marginRight: 2,
  },
} )
