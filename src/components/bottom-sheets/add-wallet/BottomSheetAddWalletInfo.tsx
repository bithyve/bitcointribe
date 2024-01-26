import React, { useState } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import Fonts from '../../../common/Fonts'

type Props = {
  onRGBWalletClick: () => any;
  onLighteningWalletClick: () => any;
  title1: string;
  title2: string;
  desc1: string;
  desc2: string;
}

const BottomSheetAddWalletInfo: React.FC<Props> = ({ onRGBWalletClick, onLighteningWalletClick, title1, title2, desc1, desc2 }: Props) => {
  const dispatch = useDispatch()
  const common = translations['common']
  const strings = translations['accounts']
  const [isConfirm, setIsConfirm] = useState(false)
  const swanMessage = strings.swanMessage
  const swanTitle = strings.StackSats


  const renderWallet = (onPress, title, desc) => {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        {/* <Image
          style={styles.addIcon}
          source={require( '../../../assets/images/icons/icon_add.png' )}
        /> */}
        <View style={styles.innerContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text numberOfLines={2} style={styles.descText}>{desc}</Text>
        </View>
        <Image source={require('../../../assets/images/icons/icon_arrow.png')}
          style={{
            width: wp('2.5%'),
            height: wp('2.5%'),
            alignSelf: 'center',
            resizeMode: 'contain',
            tintColor: Colors.theam_icon_color
          }}
        />
      </TouchableOpacity>
    )
  }

  return (<View style={{
    ...styles.modalContentContainer
  }}>
    {renderWallet(onRGBWalletClick, title1, desc1)}
    {renderWallet(onLighteningWalletClick, title2, desc2)}
  </View>
  )
}

const styles = StyleSheet.create({
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp('6%'),
    marginBottom: hp(2)
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  modalContentContainer: {
    backgroundColor: Colors.bgColor,
    // backgroundColor: Colors.red,
    paddingBottom: hp(5)
  },
  titleText: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue(12),
    fontFamily: Fonts.Medium,
  },
  descText: {
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontSize: RFValue(11),
    fontFamily: Fonts.Regular,
    marginTop: 10
  },
  addIcon: {
    width: 30, height: 30
  },
  innerContainer: {
    flex: 1, marginStart: wp('2%')
  },
  container: {
    marginHorizontal: wp('6%'),
    marginTop: hp(2),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp(2),
    backgroundColor: Colors.white, borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  }
})
export default BottomSheetAddWalletInfo
