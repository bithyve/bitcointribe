import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useDispatch, useSelector } from 'react-redux';
import { uploadEncMShare } from '../../store/actions/sss';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

const SecondaryDeviceHealthCheck = props => {
  const [SelectedOption, setSelectedOption] = useState(0);
  const SelectOption = Id => {
    if (Id == SelectedOption) {
      setSelectedOption(0);
    } else {
      setSelectedOption(Id);
    }
  };

  return (
    <View style={{ height: '100%', backgroundColor: Colors.backgroundColor }}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressBack();
            }}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View>
            <Text style={BackupStyles.modalHeaderTitleText}>{props.title}</Text>
            <Text style={BackupStyles.modalHeaderInfoText}>
              Last backup{' '}
              <Text
                style={{
                  fontFamily: Fonts.FiraSansMediumItalic,
                  fontWeight: 'bold',
                }}
              >
                {' '}
                {props.time}
              </Text>
            </Text>
          </View>
          <Image
            style={BackupStyles.cardIconImage}
            source={getIconByStatus(props.status)}
          />
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {props.data.map(value => {
          if (SelectedOption == value.id) {
            return (
              <AppBottomSheetTouchableWrapper
                onPress={() => SelectOption(value.id)}
                style={{
                  margin: wp('3%'),
                  backgroundColor: Colors.white,
                  borderRadius: 10,
                  height: wp('20%'),
                  width: wp('90%'),
                  justifyContent: 'center',
                  paddingLeft: wp('3%'),
                  paddingRight: wp('3%'),
                  alignSelf: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors.blue,
                    fontSize: RFValue(13),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  {value.title}
                </Text>
                {/* <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp('0.5%'),
                  }}
                >
                  Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit
                </Text> */}
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(9),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp('0.3%'),
                  }}
                >
                  {value.date}
                </Text>
              </AppBottomSheetTouchableWrapper>
            );
          }
          return (
            <AppBottomSheetTouchableWrapper
              onPress={() => SelectOption(value.id)}
              style={{
                margin: wp('3%'),
                backgroundColor: Colors.white,
                borderRadius: 10,
                height: wp('15%'),
                width: wp('85%'),
                justifyContent: 'center',
                paddingLeft: wp('3%'),
                paddingRight: wp('3%'),
                alignSelf: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  {value.title}
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(9),
                    fontFamily: Fonts.FiraSansRegular,
                    marginLeft: 'auto',
                  }}
                >
                  {value.date}
                </Text>
              </View>
              {/* <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(8),
                  fontFamily: Fonts.FiraSansRegular,
                  marginTop: hp('0.5%'),
                }}
              >
                Lorem ipsum dolor Lorem dolor sit amet, consectetur{' '}
                <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>
                  dolor sit
                </Text>
              </Text> */}
            </AppBottomSheetTouchableWrapper>
          );
        })}
      </ScrollView>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: hp('25%'),
            backgroundColor: Colors.white,
          }}
        >
          {props.reshareInfo ? 
          <Text
            style={{
              marginTop: hp('1%'),
              marginBottom: hp('1%'),
              color: Colors.textColorGrey,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.reshareInfo}
            <Text
              onPress={() => {
                props.onPressReshare();
              }}
              style={{ color: Colors.blue, textDecorationLine: 'underline' }}
            >
              Reshare
            </Text>
          </Text>
          : null }

          {props.changeInfo ? <Text
            style={{
              marginTop: hp('1%'),
              marginBottom: hp('1%'),
              color: Colors.textColorGrey,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.changeInfo}
            <Text
              onPress={() => {
                props.onPressChange();
              }}
              style={{ color: Colors.blue, textDecorationLine: 'underline' }}
            >
              Change Source
            </Text>
          </Text>
          : null }

          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressConfirm();
            }}
            style={{
              backgroundColor: Colors.blue,
              height: wp('13%'),
              width: wp('40%'),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              marginTop: hp('3%'),
              marginBottom: hp('3%'),
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Confirm
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
    </View>
  );
};

export default SecondaryDeviceHealthCheck;

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('3%'),
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
});
