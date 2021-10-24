import React from 'react'
import {
  View,
  Image,
  Text,
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import Colors from '../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Toast from '../components/Toast'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { translations } from '../common/content/LocContext'
import Link from '../assets/images/svgs/link_blue.svg'

export default function CopyThisText( props ) {
  const common  = translations[ 'common' ]

  function writeToClipboard() {
    Clipboard.setString( props.text )
    Toast( common.copied )
  }

  return (
    <View
      style={{
        marginVertical: hp( 3 ),
        // marginTop: 30,
        paddingLeft: 25,
        paddingRight: 25,
        marginLeft:25, marginRight:25,
        alignItems:'center', justifyContent:'center',
        // flex: 1,
        // width: '90%',
        alignSelf: 'center'
      }}
    >
      <AppBottomSheetTouchableWrapper
        onPress={() => ( props.openLink ? props.openLink() : writeToClipboard() )}
        style={{
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            // flex: 1,
            width:wp( '70%' ),
            backgroundColor: props.backgroundColor ? props.backgroundColor : Colors.backgroundColor,
            borderBottomLeftRadius: wp( 3 ),
            borderTopLeftRadius: wp( 3 ),
            height: wp( props.height ? props.height : '13%' ),
            paddingLeft: 15,
            paddingRight: 15,
            justifyContent: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: RFValue( 13 ),
              color: Colors.lightBlue,
            }}
          >
            {props.text}
          </Text>
        </View>
        <View
          style={{
            width: wp( props.width ? props.width : '12%' ),
            height: wp( props.height ? props.height : '13%' ),
            backgroundColor: Colors.borderColor,
            borderTopRightRadius: wp( 3 ),
            borderBottomRightRadius: wp( 3 ),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {!props.openLink ?
            <Image
              style={{
                width: 18, height: 20
              }}
              source={require( '../assets/images/icons/icon-copy.png' )}
            />
            :

            <Link style={{
              color:props.text.includes( 'http' ) ? Colors.blue : Colors.babyGray
            }}/>
          }
        </View>
      </AppBottomSheetTouchableWrapper>
    </View>
  )
}
