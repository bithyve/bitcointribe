import React, { useRef } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import { ScrollView } from 'react-native-gesture-handler'
import { translations } from '../../common/content/LocContext'

export default function MBNewBhrKnowMoreSheetContents( props ) {
  const scrollViewRef = useRef<ScrollView>()
  const strings  = translations[ 'accounts' ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <AppBottomSheetTouchableWrapper
        style={{
          justifyContent: 'center', alignItems: 'center',
          paddingBottom: wp( '4%' ),
          paddingTop: wp( '4%' )
        }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>{props.type == 'manageBackup' ? 'Manage Backup using Levels' : props.type == 'Level 3' ? 'Level 3' : props.type == 'Level 1' ? 'Level 1' : 'Level 2'}</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
        ref={scrollViewRef}
        style={{
          flex: 1,
          backgroundColor: Colors.blue,
        }}
        snapToInterval={hp( '75%' )}
        decelerationRate="fast"
      >
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp( '15%' ),
              marginBottom: wp( '3%' ),
            }}
          >
            {props.type == 'manageBackup' ? 'Backup your wallet to recover it in case you lose your phone for some reason' : props.type == 'Level 3' ? 'The previous level backs up 2 Recovery Keys. This one backs up two more. Any three Recovery Keys would help you successfully recovery your wallet' : props.type == 'Level 2' ? 'A Recovery Key is part of the mechanism that helps you recover your wallet. We have built the backup mechanism so that no 2 Keys end up in similar formats with a single contact' : 'Backup your wallet on the cloud for a quick recovery process. However, upgrading the backup till the third level ensures increased security'}
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={props.type == 'manageBackup' ? require( '../../assets/images/icons/manageBackup.png' ) : props.type == 'Level 3' ? require( '../../assets/images/icons/level3.png' ) : props.type == 'Level 2' ? require( '../../assets/images/icons/level2.png' ) : require( '../../assets/images/icons/level1.png' )}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              // marginBottom: wp('15%'),
            }}
          >
            {props.type == 'manageBackup' ? 'The three levels you see are a result of multiple foolproofing mechanisms created to provide incremental layers of security' : props.type == 'Level 3' ? 'Backing up your wallet till Level 3 ensures that it is extremely hard for you to lose your wallet!' : props.type == 'Level 2' ? 'The wallet will let you know if a Recovery Key is inaccessible.In that case please ensure you take the necessary steps to properly backup the Recovery Key again' : 'You get to choose if you want to backup the wallet on the cloud or not'}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    height: '100%',
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
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: wp( '1.5%' ),
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( '1%' ),
    borderRadius: 5
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
    height: hp( '70%' ),
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
    height: wp( '65%' ),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    marginBottom: wp( '15%' ),
  },
} )
