import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import NavStyles from '../../common/Styles/NavStyles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CopyThisText from '../../components/CopyThisText'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import QRCode from '../../components/QRCode'


const SendRequest = ( props ) => {
  const [ receivingAddress ] = useState( 'test' )
  return (
    <View style={{
      flex: 1
    }}>
      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={NavStyles.modalContainer}>
        <View style={NavStyles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack()
              }}
              hitSlop={{
                top: 20, left: 20, bottom: 20, right: 20
              }}
              style={{
                height: 30, width: 30, justifyContent: 'center'
              }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{
              flex: 1
            }}>
              <Text style={NavStyles.modalHeaderTitleText}>
                Send Request
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { }}
              style={{
                height: wp( '8%' ),
                width: wp( '22%' ),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.blue,
                justifyContent: 'center',
                borderRadius: 8,
                alignSelf: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}
        >
          {!receivingAddress ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <QRCode value={receivingAddress} size={hp( '27%' )} />
          )}
          {receivingAddress ? <CopyThisText text={receivingAddress} /> : null}
        </View>

        <View
          style={{
            marginBottom: hp( '5%' ),
          }}
        >
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  loader: {
    height: hp( '27%' ), justifyContent: 'center'
  },
} )

export default SendRequest
