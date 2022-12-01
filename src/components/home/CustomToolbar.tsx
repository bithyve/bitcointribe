import React, { memo } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import { RFValue } from 'react-native-responsive-fontsize'
import ToggleContainer from '../../pages/Home/ToggleContainer'
import NewSwitch from '../NewSwitch'

export type Props = {
  onBackPressed: () => void;
  toolbarTitle: string | null;
  toolbarIcon: string;
  containerStyle: any | null;
  showSwitch: boolean;
  // cardData: AccountShell[];
  // prependsAddButton: boolean;
  // onAccountCardSelected: ( accountShell: AccountShell ) => void;
  // onAddNewAccountPressed: () => void;
  // currentLevel: number;
  // onCardLongPressed: ( accountShell: AccountShell ) => void;
};

const CustomToolbar: React.FC<Props> = ( {
  onBackPressed,
  toolbarIcon,
  toolbarTitle,
  containerStyle,
  showSwitch = true
}: Props ) => {
  return (
    <View style={[ styles.container, containerStyle ]}>
      <TouchableOpacity onPress={onBackPressed} style={styles.backContainer}>
        <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
          style={styles.backImage} />
      </TouchableOpacity>
      {
        toolbarIcon &&
        <View style={styles.iconContainer}>
          <Image source={{
            uri:toolbarIcon
          }} style={styles.iconStyle}/>
        </View>
      }
      <Text numberOfLines={1} style={styles.titleText}>{toolbarTitle}</Text>
      {
        showSwitch &&
      <View>
        <NewSwitch />
        {/* <ToggleContainer /> */}
      </View>
      }
    </View>
  )
}

const styles = StyleSheet.create( {
  container: {
    height: hp( 40 ),
    backgroundColor: Colors.appPrimary,
    flexDirection:'row',
    alignItems:'center',
    borderBottomStartRadius: 25,
    paddingEnd: wp( 20 )
  },
  backContainer:{
    marginHorizontal: wp( 26 ),
    // backgroundColor:'red',
    paddingHorizontal: wp( 4 ),
    paddingVertical: hp( 4 ),
    width: wp( 20 ),
    height: hp( 26 ),
  },
  backImage: {
    width: wp( 12 ),
    height: hp( 18 ),
    tintColor: Colors.backgroundColor1,
    transform:  [ {
      rotateY: '180deg'
    } ],
  },
  titleText: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.RobotoSlabBold,
    flex: 1,
    marginEnd: wp( 10 ),
  },
  iconContainer : {
    backgroundColor: Colors.white,
    borderRadius: wp( 50 ),
    width: wp( 50 ),
    height: wp( 50 ),
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: wp( 10 )
  },
  iconStyle: {
    width: wp( 48 ),
    height: wp( 48 ),
  }
} )

export default memo( CustomToolbar )
