import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import Fonts from '../../common/Fonts';
import NavStyles from '../../common/Styles/NavStyles';
import CommonStyles from '../../common/Styles/Styles';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useSelector } from 'react-redux';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from "react-native-device-info";
import ModalHeader from '../../components/ModalHeader';

const NoteHealthCheck = props => {
  const [selectedStatus] = useState('Ugly'); // for preserving health of this entity
  const [SelectedOption, setSelectedOption] = useState(0);
  const [ChangeBottomSheet] = useState(React.createRef());
  const [ReshareBottomSheet] = useState(React.createRef());
  const [ConfirmBottomSheet] = useState(React.createRef());
  const [pageData] = useState([
    {
      id: 1, title: "Recovery Key Not Accessible", date: "19 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    },
    {
      id: 2, title: "Recovery Key Received", date: "1 June ‘19, 9:00am", info: "consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet"
    },
    {
      id: 3, title: "Recovery Key In-Transit", date: "30 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    },
    {
      id: 4, title: "Recovery Key Accessible", date: "24 May ‘19, 5:00pm", info: "Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet"
    },
    {
      id: 5, title: "Recovery Key In-Transit", date: "20 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    },
    {
      id: 6, title: "Recovery Key Not Accessible", date: "19 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    }
  ]);
  const SelectOption = (Id) => {
    if (Id == SelectedOption) {
      setSelectedOption(0)
    }
    else {
      setSelectedOption(Id)
    }
  }

  const renderChangeContent = () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper'}
        note={
          'You can change the Keeper you selected to send your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderChangeHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderReshareContent = () => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare Recovery Key\nwith Keeper'}
        info={'Did your Keeper not receive the Recovery Key?'}
        note={
          'You can reshare the Recovery Key with your Keeper'
        }
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderReshareHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderConfirmContent = () => {
    return (
      <ErrorModalContents
        modalRef={ConfirmBottomSheet}
        title={'Confirm Recovery Key\nwith Keeper'}
        info={'Your Keeper seems away from their Hexa App'}
        note={
          'You can send them a reminder to open their app to\nensure they have your Recovery Key'
        }
        proceedButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderConfirmHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.backgroundColor }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ ...NavStyles.modalHeaderTitleView, paddingLeft: 10, paddingRight: 10, }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => { props.navigation.goBack(); }} style={{ height: 30, width: 30, justifyContent: "center" }} >
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ ...NavStyles.modalHeaderTitleView, marginLeft: 10, marginRight: 10, }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={NavStyles.modalHeaderTitleText}>Note</Text>
          <Text style={NavStyles.modalHeaderInfoText}>
            Last backup{' '}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', }}> {'1 months ago'}</Text>
          </Text>
        </View>
        <Image style={CommonStyles.cardIconImage} source={getIconByStatus(selectedStatus)} />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {pageData.map((value) => {
          if (SelectedOption == value.id) {
            return <TouchableOpacity onPress={() => SelectOption(value.id)} style={{ margin: wp('3%'), backgroundColor: Colors.white, borderRadius: 10, height: wp('20%'), width: wp('90%'), justifyContent: 'center', paddingLeft: wp('3%'), paddingRight: wp('3%'), alignSelf: 'center' }}>
              <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>{value.title}</Text>

              <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(9), fontFamily: Fonts.FiraSansRegular, marginTop: hp('0.3%') }}>{value.date}</Text>
            </TouchableOpacity>
          }
          return <TouchableOpacity onPress={() => SelectOption(value.id)} style={{ margin: wp('3%'), backgroundColor: Colors.white, borderRadius: 10, height: wp('15%'), width: wp('85%'), justifyContent: 'center', paddingLeft: wp('3%'), paddingRight: wp('3%'), alignSelf: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(10), fontFamily: Fonts.FiraSansRegular }}>{value.title}</Text>
              <Text style={{ color: Colors.textColorGrey, fontSize: RFValue(9), fontFamily: Fonts.FiraSansRegular, marginLeft: 'auto' }}>{value.date}</Text>
            </View>

          </TouchableOpacity>
        })}
      </ScrollView>
      {SelectedOption ?
        <View style={{ justifyContent: 'center', alignItems: 'center', height: hp('25%'), backgroundColor: Colors.white }}>
          <TouchableOpacity onPress={() => { ConfirmBottomSheet.current.snapTo(1) }} style={{ backgroundColor: Colors.blue, height: wp('13%'), width: wp('40%'), justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: hp('3%'), marginBottom: hp('3%') }}><Text style={{ color: Colors.white, fontSize: RFValue(10), fontFamily: Fonts.FiraSansMedium, }}>Confirm</Text></TouchableOpacity>
        </View> : null
      }
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ChangeBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderChangeContent}
        renderHeader={renderChangeHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderReshareContent}
        renderHeader={renderReshareHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ConfirmBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderConfirmContent}
        renderHeader={renderConfirmHeader}
      />
    </View>
  );
};

export default NoteHealthCheck;
