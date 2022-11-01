import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import { useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import moment from 'moment'

const { width } = Dimensions.get( 'window' )
const maxWidth = width * 0.7

const styles = StyleSheet.create( {
  cardReceivedMsg: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    margin: 2,
    maxWidth: maxWidth,
    marginRight: 'auto',
    backgroundColor: '#919090',
    elevation: 2,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 15,
    minWidth: 70,
  },
  cardSelfMsg: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    margin: 2,
    maxWidth: maxWidth,
    marginLeft: 'auto',
    backgroundColor: Colors.lightBlue,
    elevation: 2,
    minWidth: 70,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 0,
  },
  textReceivedMsg: {
    fontSize: 15,
    color: 'white',
    marginBottom: -5,
  },
  textSelfMsg: {
    fontSize: 15,
    color: 'white',
    marginBottom: -5,
  },
  containerTime: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  textDatedOn: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 5,
  },
} )

const MessageItem = ( { item } ) => {
  const walletId = useSelector( state=> state.storage.wallet.walletId )

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={
        walletId === item.sender
          ? styles.cardSelfMsg
          : styles.cardReceivedMsg
      }>
      <Text style={
        walletId === item.sender
          ? styles.textSelfMsg
          : styles.textReceivedMsg
      } >{item.message.text}</Text>

      <View style={styles.containerTime}>
        <Text
          style={[
            styles.textDatedOn,
            {
              color:
              walletId === item.sender ? 'white' : '#DCDCDC',
            },
          ]}>
          {moment( item.timestamp ).format( 'h:mm A' )}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default MessageItem

