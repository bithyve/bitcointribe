import React, { useContext, } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'
import moment from 'moment'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import HeaderTitle from '../../components/HeaderTitle'
import CommonStyles from '../../common/Styles/Styles'
import { LocalizationContext } from '../../common/content/LocContext'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import DashedContainer from './DashedContainer'
import RecipientAvatar from '../../components/RecipientAvatar'
import ImageStyles from '../../common/Styles/ImageStyles'
import idx from 'idx'

const ManageGifts = ( { navigation } ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const gifts = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.gifts ) )
  const giftArr = Object.values( gifts )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }
  return (
    <ScrollView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 'auto'
      }}>
        <HeaderTitle
          firstLineTitle={'Manage Gifts'}
          secondLineTitle={'View and manage created Gifts'}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate( 'CreateGift' )}
          style={{
            ...styles.selectedContactsView,
          }}
        >
          <Text style={[ styles.contactText, {
            fontSize: RFValue( 24 ),
          } ]}>+</Text>
          {/* <Image
                    style={styles.addGrayImage}
                    source={require( '../../assets/images/icons/icon_add_grey.png' )}
                  /> */}
          <Text style={styles.contactText}>{strings[ 'creatnew' ]}</Text>

        </TouchableOpacity>
      </View>
      {giftArr.length > 0 &&
      giftArr.map( ( item, index ) => {
        return (
          <DashedContainer
            key={index}
            titleText={'Available Gift'}
            subText={'Lorem ipsum dolor sit amet'}
            amt={numberWithCommas( item.amount )}
            date={new Date()}
            image={<GiftCard />}
            onPress={() => {navigation.navigate( 'AddContact', {
              fromScreen: 'Gift',
              giftId: item.id
            } )}}
          />
        )
      } )
      }
      <View style={{
        marginHorizontal: wp( 6 ), marginTop: hp( 1 )
      }}>
        {[ 1, 2, 3, 4 ].map( ( item ) => {
          return(
            <>
              {/* <View style={{
                backgroundColor: Colors.backgroundColor1, borderRadius: wp( 2 )
              }}>

              </View> */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', marginVertical: hp( 0.5 )
              }}>
                <Text style={{
                  color: Colors.lightTextColor,
                  fontSize: RFValue( 10 ),
                  fontFamily: Fonts.FiraSansRegular,
                  fontWeight: '600'
                }}>Sent to recipient</Text>
                <Text style={{
                  color: Colors.lightTextColor,
                  fontSize: RFValue( 10 ),
                  fontFamily: Fonts.FiraSansRegular,
                  alignSelf: 'flex-end'
                }}>
                  {moment(  ).format( 'lll' )}
                </Text>
              </View>

              <TouchableOpacity style={{
                ...styles.listItem
              }}
              >
                <View style={styles.avatarContainer}>
                  {/* <RecipientAvatar recipient={contactDescription.contactDetails} contentContainerStyle={styles.avatarImage} /> */}
                </View>
                <View style={{
                  alignItems: 'flex-start', marginHorizontal: wp( 2 )
                }}>
                  <Text style={{
                    textAlign: 'center', fontFamily: Fonts.FiraSansRegular, color: Colors.textColorGrey
                  }}>Uraiah Cabe

                  </Text>
                  <Text style={{
                    ...styles.secondNamePieceText, fontFamily: Fonts.FiraSansRegular
                  }}>Lorem ipsum dolor sit amet</Text>
                </View>
              </TouchableOpacity>
            </>
          )

        } )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create( {
  secondNamePieceText: {
    fontSize: RFValue( 10 ),
    color: Colors.lightTextColor
  },
  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 9 ) / 2,
    marginHorizontal: wp( 1 ),
  },
  avatarContainer: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 9 )/2,
  },
  listItem: {
    marginVertical: hp( 0.5 ),
    borderRadius: wp( 2 ),
    padding: wp( 3 ),
    // justifyContent:'center',
    // alignItems:'center',
    backgroundColor: Colors.backgroundColor1,
    flexDirection: 'row'
  },
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
  },
  selectedContactsView: {
    // marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // marginRight: 20,
    // marginTop: 5,
    // paddingBottom: 15,
    // paddingTop: 15,
    // borderBottomWidth: 1,
    // borderColor: Colors.borderColor,
    backgroundColor: Colors.blue,
    borderRadius: wp ( 2 ),
    // width: wp( 22 )
    // padding: wp( 1 ),
    //width: wp( 24 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  contactText: {
    // marginLeft: 10,
    // marginHorizontal: wp ( 1 ),
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    // padding: wp( 2 )
  },
} )

export default ManageGifts

