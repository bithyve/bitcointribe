import { Text, View, FlatList, StyleSheet, Keyboard } from 'react-native'
import React, { Component } from 'react'
import MessageItem from './MessageItem'
import DateSeperator from './DateSeperator'
import moment from 'moment'

const styles = StyleSheet.create( {
  list: {
    //paddingTop: 5,
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 15
  },
} )



const MessageList = ( props ) => {
  const renderMessageList = ( item, index ) => {

    const nextItem = props.data[ index + 1 ]
    let dateSeparator = null
    const date = item.timestamp
      ? item.timestamp
      : new Date().toDateString()
    if ( !nextItem ) {
      dateSeparator = date
    } else if ( !moment( date ).isSame( nextItem.timestamp, 'day' ) ) {
      dateSeparator = date
    }
    const msg = <MessageItem resendRequest={props.resendRequest} item={item} index={index}/>
    if ( dateSeparator ) {
      return (
        <React.Fragment>
          {msg}
          <DateSeperator date={dateSeparator} />
        </React.Fragment>
      )
    }
    return msg

  }

  return (
    <FlatList
      inverted
      style={{
        flexGrow: 1,
      }}
      // ref={flatListRef}
      keyboardShouldPersistTaps="handled"
      maxToRenderPerBatch={10}
      removeClippedSubviews
      initialNumToRender={10}
      updateCellsBatchingPeriod={100}
      windowSize={4}
      contentContainerStyle={styles.list}
      data={props.data}
      extraData={[ props.data ]}
      onScroll={( e ) => {
        Keyboard.dismiss()
      }}
      onScrollToIndexFailed={( e ) => console.log( e )}
      renderItem={( { item, index } ) =>
        renderMessageList( item, index )
      }
    />
  )
}

export default MessageList
