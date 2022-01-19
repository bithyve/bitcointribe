import React from 'react'
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { translations } from '../../common/content/LocContext'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export default function TestAccountKnowMoreSheetContents( props ) {
  const strings  = translations[ 'login' ]

  const data= [
    {
      title: strings.Initialbackup,
      text1: strings.Selectanencryption,
      text2: strings.Youcanincrease,
      image: require( '../../assets/images/icons/walletinit-1.png' )
    },
    {
      title: strings.AGSP,
      text1:  strings.AGSP1,
      text2:  strings.AGSP2,
      image: require( '../../assets/images/icons/walletinit-2.png' )
    },
    // {
    //   title: strings.SecurityQuestion,
    //   text1: strings.SecurityQuestion1,
    //   text2: strings.SecurityQuestion2,
    //   image: require( '../../assets/images/icons/walletinit-3.png' )
    // },
    {
      title: strings.UserDefinedPassphrase,
      text1: strings.UserDefinedPassphrase1,
      text2: strings.UserDefinedPassphrase2,
      image: require( '../../assets/images/icons/walletinit-4.png' )
    }
  ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: hp( 81 )
      }}>
        <TouchableOpacity
          style={{
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: Colors.lightBlue,
            height: 30,
            width: 30,
            borderRadius: 15,
            padding: 4,
            marginHorizontal: 10,
            marginTop: 10,
            alignSelf: 'flex-end'
          }}
          activeOpacity={10}
          onPress={() => props.closeModal()}
        >
          <FontAwesome name="close" color={Colors.white} size={19} />
        </TouchableOpacity>
        <FlatList
          pagingEnabled
          style={{
            // flex: 1,
            backgroundColor: Colors.blue,
          }}
          snapToInterval={hp( 81 )}
          decelerationRate="fast"
          data={data}
          initialScrollIndex={props.index ? props.index : 0}
          onScrollToIndexFailed={( info ) => {console.log( info )}}
          renderItem={( { item } ) =>
            <View style={styles.ElementView}>
              <Text style={styles.headerText}>{item.title}</Text>
              <Text
                style={{
                  ...styles.infoText,
                  marginTop: wp( '3%' ),
                  marginBottom: wp( '1%' ),
                }}
              >
                {item.text1}
              </Text>
              <View style={{
                justifyContent: 'center', alignItems: 'center'
              }}>
                <Image
                  source={item.image}
                  style={styles.helperImage}
                />
              </View>
              <Text
                style={{
                  ...styles.infoText,
                  marginBottom: wp( '15%' ),
                }}
              >
                {item.text2}
              </Text>
              {/* <View style={styles.separatorView} /> */}
            </View>
          }
        />

      </View>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    // height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
  },
  headerText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 20 ),
    marginTop: hp( '1%' ),
    marginBottom: hp( '1%' ),
    textAlign: 'center',
    paddingHorizontal:wp( '5%' ),
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: 1,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( '1%' ),
  },
  infoText: {
    textAlign: 'center',
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
  },
  clickHereText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  toKnowMoreText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  linkView: {
    flexDirection: 'row',
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ElementView: {
    height: hp( 81 ),
    justifyContent: 'space-between',
  },
  separatorView: {
    width: wp( '70%' ),
    height: 0,
    alignSelf: 'center',
    marginBottom: wp( '1%' ),
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: Colors.white,
  },
  helperImage: {
    width: wp( '80%' ),
    height: wp( '60%' ),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    marginBottom: wp( '15%' ),
  },
} )
