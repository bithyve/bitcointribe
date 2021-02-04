import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { ScrollView } from 'react-native-gesture-handler'
import DeviceInfo from 'react-native-device-info'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import idx from 'idx'
import { isEmpty } from '../common/CommonFunctions'
import { setVersions } from '../store/actions/versionHistory'


export default function VersionHistoryScreen(props) {
  const versionHistory = useSelector((state) => idx(state, (_) => _.versionHistory.versions))
  const [versionsArray, setVersionsArray] = useState([]);
  const [SelectedOption, setSelectedOption] = useState(0)
  const dispatch = useDispatch()

  const SelectOption = (Id) => {
    if (Id == SelectedOption) {
      setSelectedOption(0)
    } else {
      setSelectedOption(Id)
    }
  }
  const [data, setData] = useState([
    {
      'id': '',
      'version': '',
      'buildNumber': '',
      'versionName': '',
      'title': 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
      'date': ''
    }
  ])

  useEffect(() => {
    if (versionHistory) {
      setVersionsArray(versionHistory)
    }
  }, [versionHistory])

  useEffect(() => {
    let versionData = [];
    console.log("versionsArray", typeof versionsArray);
    console.log("versionsArray", versionsArray);

    let data = {
      'id': "1",
      'version': DeviceInfo.getVersion(),
      'buildNumber': DeviceInfo.getBuildNumber(),
      'versionName': `Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,
      'title': 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
      date: moment(new Date())
        .utc()
        .local()
        .format('DD MMMM YYYY HH:mm')
    }
    if (!isEmpty(versionsArray)) {  
      versionData = versionsArray;
      const id = versionData && versionData.length ? versionData.length + 1 : 1;
      if (versionData.filter(version => version.version == DeviceInfo.getVersion() && version.buildNumber == DeviceInfo.getBuildNumber()).length != 0) {
          data = {
          ...data,
          'id': id.toString()
        }
      }
    }
    versionData.push(data);
    setData(versionData);
    dispatch(setVersions(versionData));
  }, [])

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <View style={styles.rootContainer}>
        {data && data.length && (
          <View style={{
            flex: 1
          }}>
            <ScrollView style={{
            }}>
              {data.map((value) => {
                if (SelectedOption == parseInt(value.id)) {
                  return (
                    <TouchableOpacity
                      key={value.id}
                      onPress={() => SelectOption(value.id)}
                      style={styles.selection}
                    >
                      <Text style={styles.versionText}>
                        {value.versionName}
                      </Text>

                      <Text style={styles.text}>
                        {value.title}
                      </Text>
                      <Text style={{
                        ...styles.text, fontSize: RFValue(9),
                      }}>
                        {value.date}
                      </Text>
                    </TouchableOpacity>
                  )
                }
                return (
                  <TouchableOpacity
                    key={value.id}
                    onPress={() => SelectOption(value.id)}
                    style={{
                      ...styles.selection, height: wp('15%'),
                      width: wp('85%'),
                    }}>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center'
                    }}>
                      <Text style={{
                        ...styles.versionText, color: Colors.textColorGrey,
                        fontSize: RFValue(10),
                      }}>
                        {value.versionName}
                      </Text>
                      <Text
                        style={styles.date}
                      >
                        {value.date}
                      </Text>
                    </View>
                    <Text style={styles.text}>
                      {value.title}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>)}
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1, backgroundColor: Colors.backgroundColor1
  },
  selection: {
    margin: wp('3%'),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp('20%'),
    width: wp('90%'),
    justifyContent: 'center',
    paddingLeft: wp('3%'),
    paddingRight: wp('3%'),
    alignSelf: 'center',
  },
  versionText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  text: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp('0.4%'),
  },
  date: {
    color: Colors.textColorGrey,
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 'auto',
  }
})

