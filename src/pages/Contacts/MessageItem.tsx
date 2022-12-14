import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import { useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import moment from 'moment'
import { ChannelMessageTypes } from '../../bitcoin/utilities/Interface'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'

const { width } = Dimensions.get( 'window' )
const maxWidth = width * 0.7

const styles = StyleSheet.create( {
  cardReceivedMsg: {
    padding: 5,
    margin: 5,
    maxWidth: maxWidth,
    marginRight: 'auto',
    backgroundColor: '#F0F0F0',
    elevation: 2,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 15,
    minWidth: 70,
  },
  cardSelfMsg: {
    margin: 5,
    maxWidth: maxWidth,
    marginLeft: 'auto',
    backgroundColor: '#F0F0F0',
    elevation: 2,
    minWidth: 70,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 0,
    padding: 10
  },
  textMsg: {
    fontSize: RFValue( 13 ),
    color: '#505050',
    marginBottom: -5,
    fontFamily: Fonts.RobotoSlabRegular,
    marginVertical: 4
  },
  textReqStatus: {
    fontSize: RFValue( 13 ),
    color: '#505050',
    marginBottom: -5,
    fontFamily: Fonts.RobotoSlabMedium,
    marginVertical: 8,
    textTransform: 'capitalize'
  },
  containerTime: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  textDatedOn: {
    fontSize: RFValue( 9 ),
    textAlign: 'right',
    marginTop: 5,
    color:'#505050',
    fontFamily: Fonts.RobotoSlabRegular,
  },
  bold: {
    fontFamily: Fonts.RobotoSlabBold,
  },
  light: {
    fontFamily: Fonts.RobotoSlabLight
  }
} )

const MessageItem = ( { item, resendRequest } ) => {
  const walletId = useSelector( state=> state.storage.wallet.walletId )

  const ContactRequest = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={resendRequest}
        style={
          walletId === item.sender
            ? styles.cardSelfMsg
            : styles.cardReceivedMsg
        }>
        <View>
          <Text style={styles.textMsg} >

            <Text>{`${item.message.walletName} sent a `}</Text>
            <Text style={styles.bold}>Friend Request</Text>
          </Text>
          <Text style={styles.textReqStatus}>{item.message.actionStatus}</Text>
          <View style={styles.containerTime}>
            <Text
              style={[
                styles.textDatedOn,

              ]}>
              {moment( item.timestamp ).format( 'h:mm a' )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const TextMessage = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={
          walletId === item.sender
            ? styles.cardSelfMsg
            : styles.cardReceivedMsg
        }>
        <View>
          <Text style={styles.textMsg} >

            <Text>{`${item.message.walletName} sent a `}</Text>
            <Text style={styles.bold}>message</Text>
          </Text>

          <Text style={[ styles.textMsg, styles.light ]}>{item.message.text}</Text>

          <View style={styles.containerTime}>
            <Text
              style={[
                styles.textDatedOn,

              ]}>
              {moment( item.timestamp ).format( 'h:mm a' )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    item.message.type === ChannelMessageTypes.CONTACT_REQUEST ? (
      <ContactRequest />
    ): item.message.type === ChannelMessageTypes.TEXT ? (
      <TextMessage />
    ): (
      <View />
    )
  )
}

export default MessageItem

