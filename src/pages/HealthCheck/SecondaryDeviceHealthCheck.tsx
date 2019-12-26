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

const SecondaryDeviceHealthCheck = props => {
  const [selectedStatus, setSelectedStatus] = useState('error'); // for preserving health of this entity

  
  const { loading } = useSelector(state => state.sss);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ flex:1, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={{ height: 30, width: 30, justifyContent: "center" }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={BackupStyles.modalHeaderTitleText}>
            Secondary Device
          </Text>
        </View>
        <Text style={BackupStyles.modalHeaderInfoText}>
            Last backup{' '}
            <Text
              style={{
                fontFamily: Fonts.FiraSansMediumItalic,
                fontWeight: 'bold',
              }}
            >
              {'3 months ago'}
            </Text>
          </Text>
        <Image
          style={BackupStyles.cardIconImage}
          source={getIconByStatus(selectedStatus)}
        />
      </View>
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: { height: hp('27%'), justifyContent: 'center' },
});

export default SecondaryDeviceHealthCheck;
