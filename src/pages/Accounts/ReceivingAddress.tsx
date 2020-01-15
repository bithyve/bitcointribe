import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from '../ManageBackup/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import QRCode from 'react-native-qrcode-svg';
import CopyThisText from '../../components/CopyThisText';
import { useDispatch, useSelector } from 'react-redux';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { fetchAddress } from '../../store/actions/accounts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { RFValue } from 'react-native-responsive-fontsize';

const ReceivingAddress = props => {
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const serviceType = props.navigation.getParam( 'serviceType' );
  const [ ReceiveHelperBottomSheet, setReceiveHelperBottomSheet ] = useState(
    React.createRef(),
  );
  const { loading, service } = useSelector(
    state => state.accounts[ serviceType ],
  );

  const checkNShowHelperModal = async () => {
    let isReceiveHelperDone = await AsyncStorage.getItem( 'isReceiveHelperDone' );
    if ( !isReceiveHelperDone && serviceType == TEST_ACCOUNT ) {
      AsyncStorage.setItem( 'isReceiveHelperDone', 'true' );
      ReceiveHelperBottomSheet.current.snapTo( 1 );
    }
  };

  useEffect( () => {
    checkNShowHelperModal();
  }, [] );

  const { receivingAddress } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;

  const dispatch = useDispatch();
  useEffect( () => {
    if ( !receivingAddress ) dispatch( fetchAddress( serviceType ) );
  }, [ serviceType ] );


  const renderReceiveHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={ 'Receiving Through the Test Account' }
        helperInfo={
          'For receiving bitcoins, you need to give an\naddress to the sender. Mostly in form of a QR\ncode.\n\nThis is pretty much like an email address but\nyour app generates a new one for you every time\nyou want to do a transaction.\n\nThe sender will scan this address or copy a long\nsequence of letters and numbers to send you the\nbitcoins or sats (a very small fraction of a\nbitcoin)\n\nNote that if you want to receive bitcoins/ sats\nfrom a “Trusted Contact”, the app does all this\nfor you and you don’t need to send a new\naddress every time.\n'
        }
        continueButtonText={ 'Continue' }
        quitButtonText={ 'Quit' }
        onPressContinue={ () => {
          if ( props.navigation.getParam( 'serviceType' ) == TEST_ACCOUNT ) {
            ( ReceiveHelperBottomSheet as any ).current.snapTo( 0 );
            props.navigation.navigate( 'ReceivingAddress', {
              serviceType,
              getServiceType,
            } );
          }
        } }
        onPressQuit={ () => {
          ( ReceiveHelperBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };



  const renderReceiveHelperHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          ( ReceiveHelperBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  return (
    <View style={ { flex: 1 } }>
      <SafeAreaView style={ { flex: 0 } } />
      <StatusBar backgroundColor={ Colors.white } barStyle="dark-content" />
      <View style={ BackupStyles.modalContainer }>
        <View style={ BackupStyles.modalHeaderTitleView }>
          <View style={ { flex: 1, flexDirection: 'row', alignItems: 'center' } }>
            <TouchableOpacity
              onPress={ () => {
                if ( getServiceType ) {
                  getServiceType( serviceType );
                }
                props.navigation.goBack();
              } }
              style={ { height: 30, width: 30, justifyContent: 'center' } }
            >
              <FontAwesome
                name="long-arrow-left"
                color={ Colors.blue }
                size={ 17 }
              />
            </TouchableOpacity>
            <Text style={ BackupStyles.modalHeaderTitleText }>
              Receiving Address
            </Text>
            { serviceType == TEST_ACCOUNT ? (
              <Text
                onPress={ () => {
                  AsyncStorage.setItem( 'isReceiveHelperDone', 'true' );
                  ReceiveHelperBottomSheet.current.snapTo( 1 );
                } }
                style={ {
                  color: Colors.textColorGrey,
                  fontSize: RFValue( 12 ),
                  marginLeft: 'auto',
                } }
              >
                Know More
              </Text>
            ) : null }
          </View>
        </View>
        <View style={ BackupStyles.modalContentView }>
          { !receivingAddress ? (
            <View style={ styles.loader }>
              <ActivityIndicator size="large" />
            </View>
          ) : (
              <QRCode value={ receivingAddress } size={ hp( '27%' ) } />
            ) }
          { receivingAddress ? <CopyThisText text={ receivingAddress } /> : null }
        </View>
        <View
          style={ {
            marginBottom: hp( '5%' ),
          } }
        >
          <BottomInfoBox
            title={ 'Note' }
            infoText={
              'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna'
            }
          />
        </View>
        <BottomSheet
          enabledInnerScrolling={ true }
          ref={ ReceiveHelperBottomSheet }
          snapPoints={ [ -50, hp( '95%' ) ] }
          renderContent={ renderReceiveHelperContents }
          renderHeader={ renderReceiveHelperHeader }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create( {
  loader: { height: hp( '27%' ), justifyContent: 'center' },
} );

export default ReceivingAddress;
