import React, { useContext, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

import Colors from '../../common/Colors'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import { LocalizationContext } from '../../common/content/LocContext'
import Gifts from '../../assets/images/svgs/gift.svg'
import Add_gifts from '../../assets/images/svgs/add2.svg'
import Fonts from '../../common/Fonts'
import ArrowRight from '../../assets/images/svgs/icon_arrow_right.svg'

export type Props = {
  closeModal: () => {};
  sendRequestToContact: () => {};
  createGifts: () => {};
};

const CreateFNFInvite = ( props: Props ) => {
  const { translations } = useContext( LocalizationContext )
  return (
    <View style={styles.modalContentContainer}>
      <AppBottomSheetTouchableWrapper
        onPress={() => props.closeModal()}
        style={{
          width: wp( 7 ),
          height: wp( 7 ),
          borderRadius: wp( 7 / 2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.CLOSE_ICON_COLOR,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: wp( 3 ),
          marginRight: wp( 3 ),
        }}
      >
        <FontAwesome
          name="close"
          color={Colors.white}
          size={19}
          style={
            {
              // marginTop: hp( 0.5 )
            }
          }
        />
      </AppBottomSheetTouchableWrapper>
      <View style={{
        padding: 10
      }}>
        <View>
          <Text
            style={[
              styles.titleText,
            ]}
          >
            Create an F{'&'}F invite
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cardBackView}
          onPress={() => props.sendRequestToContact()}
        >
          <View style={{
            width: '15%'
          }}>
            <Add_gifts />
          </View>
          <View style={{
            flex:1
          }}>
            <Text style={styles.subtitleText}>
              Create Invitation link
            </Text>
            <Text style={styles.paragraphTitleText}>
              Send an invite link to any of your family and friends using
              generated link
            </Text>
          </View>
          <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
            style={{
              width: RFValue( 10 ),
              height: RFValue( 16 ),
              resizeMode: 'contain',
              // marginBottom: hp( 0.7 ),
              // marginLeft: wp( 3 )
              marginStart:RFValue( 15 )
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardBackView}
          onPress={() => props.createGifts()}
        >
          <View style={{
            width: '15%'
          }}>
            <Gifts />
          </View>
          <View style={{
            flex:1
          }}>
            <Text style={styles.subtitleText}>
              Create Invitation link with Gift
            </Text>
            <Text style={styles.paragraphTitleText}>
              Add gifts when sending an invite link to any of your family and
              friends using the generated link
            </Text>
          </View>
          <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
            style={{
              width: RFValue( 10 ),
              height: RFValue( 16 ),
              resizeMode: 'contain',
              // marginBottom: hp( 0.7 ),
              // marginLeft: wp( 3 )
              marginStart:RFValue( 15 )
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor,
    padding: 10,
    paddingBottom:70
  },
  titleText: {
    color: Colors.blue,
    fontWeight: '600',
    marginBottom: 20,
    fontFamily: Fonts.Medium,
    letterSpacing:1,
    fontSize: RFValue( 17 ),
    marginLeft:10
  },
  subtitleText: {
    color: Colors.black,
    marginBottom: 5,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular
  },
  paragraphTitleText: {
    fontSize: 12,
    color: Colors.gray3,
    textAlign: 'left',
    flexWrap: 'wrap',
    paddingRight:10
  },
  cardBackView: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.white,
    padding: 15,
    paddingVertical:30,
    marginVertical: 10,
    borderRadius: 10,
  },
} )
export default CreateFNFInvite
