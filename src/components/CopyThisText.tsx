import Clipboard from '@react-native-clipboard/clipboard'
import React from 'react'
import {
  Image,
  Text,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Link from '../assets/images/svgs/link_blue.svg'
import Colors from '../common/Colors'
import { translations } from '../common/content/LocContext'
import Fonts from '../common/Fonts'
import Toast from '../components/Toast'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'

export default function CopyThisText( props ) {
  const common  = translations[ 'common' ]

  function writeToClipboard() {
    Clipboard.setString( props.text )
    Toast( props.toastText ? props.toastText : common.copied, true )
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
          {props.title && <Text style={{
            fontSize: RFValue( 10 ),
            marginBottom: RFValue( 2 ),
            color: Colors.THEAM_INFO_TEXT_COLOR,
            fontFamily: Fonts.Regular
          }}>{props.title}</Text>
          }
          <Text
            numberOfLines={1}
            style={{
              fontSize: RFValue( 13 ),
              color: props.title ? Colors.CLOSE_ICON_COLOR : Colors.CLOSE_ICON_COLOR,
              fontFamily: Fonts.Regular
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
                width: 18, height: 20, tintColor: Colors.theam_icon_color
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
