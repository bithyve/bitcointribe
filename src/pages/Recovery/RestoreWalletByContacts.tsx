import React, { useState, useEffect } from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'
import ContactList from '../../components/ContactList'

export default function RestoreWalletByContacts( props ) {
  const [] = useState( 'Ugly' ) // for preserving health of this entity
  const [ selectedContacts, setSelectedContacts ] = useState( [] )
  const [ test, setTest ] = useState( false )
  const [ contacts, setContacts ] = useState( [] )
  function selectedContactsList( list ) {
    if ( list.length > 0 ) setContacts( [ ...list ] )
  }

  useEffect( ()=>{
    ( async()=>{
      const selectedContactsTemp = JSON.parse( await AsyncStorage.getItem( 'selectedContacts' ) )
      setTimeout( () => {
        setSelectedContacts( selectedContactsTemp )
        setTest( !test )
      }, 2 )
    } )()
  }, [] )

  const onPressContinue = async () => {
    let selectedContactList = JSON.parse( await AsyncStorage.getItem( 'selectedContacts' ) )
    if( !selectedContactList ){
      selectedContactList = []
    }
    if( selectedContactList.length>1 && contacts.length>1 ){
      if( selectedContactList[ 0 ].id!=contacts[ 0 ].id && selectedContactList[ 1 ].id!=contacts[ 1 ].id ){
        selectedContactList[ 0 ] = contacts[ 0 ]
        selectedContactList[ 1 ] = contacts[ 1 ]
      }
    }
    else if( selectedContactList.length==1 && contacts.length ==1 ){
      selectedContactList[ 1 ] = contacts[ 0 ]
    }
    else if( selectedContactList.length>1 && contacts.length ==1 ){
      selectedContactList[ 1 ] = contacts[ 0 ]
    }
    else if( selectedContactList.length==1 && contacts.length >1 ){
      if( selectedContactList[ 0 ].id!=contacts[ 0 ].id ){
        selectedContactList[ 0 ] = contacts[ 0 ]
      }
      selectedContactList[ 1 ] = contacts[ 1 ]
    }
    else if( selectedContactList.length==0 && contacts.length >1 ){
      selectedContactList[ 0 ] = contacts[ 0 ]
      selectedContactList[ 1 ] = contacts[ 1 ]
    }
    else {
      selectedContactList[ 0 ] = contacts[ 0 ]
    }
    await AsyncStorage.setItem( 'selectedContacts', JSON.stringify( selectedContactList ) )
    if( !selectedContactList[ 0 ].status && contacts.length>0 ){
      props.navigation.navigate( 'RecoveryCommunication', {
        contact:contacts[ 0 ],
        index: 1,
      } )
    }
    else if( !selectedContactList[ 1 ].status && contacts.length>1 ){
      props.navigation.navigate( 'RecoveryCommunication', {
        contact:contacts[ 1 ],
        index: 2,
      } )
    }
    else{
      props.navigation.navigate( 'RecoveryCommunication', {
        contact:contacts[ 0 ],
        index: 1,
      } )
    }
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{
        flex: 1
      }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.goBack()
            }}
            hitSlop={{
              top: 20, left: 20, bottom: 20, right: 20
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
                size={17}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: 54, marginLeft: 'auto'
            }}
            onPress={() => {}}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <Ionicons name="md-search" color={Colors.blue} size={20} />
            </View>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          style={{
            flex: 1
          }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <HeaderTitle
            firstLineTitle={'Recover wallet using'}
            secondLineTitle={'Contacts'}
            infoTextNormal={'Select contacts to '}
            infoTextBold={'send recovery request'}
          />
          <ContactList
            style={{
            }}
            isTrustedContact={false}
            selectedContacts={selectedContacts}
            onPressContinue={onPressContinue}
            onSelectContact={selectedContactsList}
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  )
}
