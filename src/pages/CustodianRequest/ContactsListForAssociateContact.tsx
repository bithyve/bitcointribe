import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import ContactList from '../../components/ContactList'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { useSelector } from 'react-redux'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Loader from '../../components/loader'
import { v4 as uuid } from 'uuid'

const ContactsListForAssociateContact = ( props ) => {
  const [ contacts, setContacts ] = useState( [] )
  const postAssociation = props.route.params?.postAssociation
  const { approvingTrustedContact } = useSelector(
    ( state ) => state.trustedContacts.loading,
  )
  const [ showLoader, setShowLoader ] = useState( false )
  function selectedContactsList( list ) {
    if ( list.length > 0 ) setContacts( [ ...list ] )
  }

  return (
    <View style={{
      flex: 1
    }}>
      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center'
        }}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            hitSlop={{
              top: 20, left: 20, bottom: 20, right: 20
            }}
            style={{
              height: 30, width: 30, justifyContent: 'center'
            }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
          </TouchableOpacity>
          <View style={{
            flex: 1
          }}>
            <Text style={styles.modalHeaderTitleText}>
              {'Associate a contact'}
            </Text>
          </View>

          <AppBottomSheetTouchableWrapper
            disabled={approvingTrustedContact}
            onPress={() => {
              setShowLoader( true )
              const contactDummy = {
                id: uuid(),
              }
              postAssociation( contactDummy )
            }}
            style={{
              height: wp( '8%' ),
              width: wp( '22%' ),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: approvingTrustedContact
                ? Colors.lightBlue
                : Colors.blue,
              justifyContent: 'center',
              borderRadius: 8,
              alignSelf: 'center',
            }}
          >
            {approvingTrustedContact ? (
              <ActivityIndicator color={Colors.white} size={'small'} />
            ) : (
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.Regular,
                }}
              >
                Skip
              </Text>
            )}
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <Text style={styles.modalSubheaderText}>
        Associate a contact from your address book. This will help you remember
        who the request was from
      </Text>

      <ContactList
        isTrustedContact={true}
        isShowSkipContact={true}
        style={{
        }}
        onPressContinue={() => {
          postAssociation( contacts[ 0 ] )
        }}
        onSelectContact={selectedContactsList}
        onPressSkip={() => {
          const contactDummy = {
            id: uuid(),
          }
          postAssociation( contactDummy )
        }}
      />
      {showLoader ? <Loader isLoading={true} /> : null}

    </View>
  )
}

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Medium,
  },
  modalSubheaderText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    marginLeft: 20,
  },
} )
export default ContactsListForAssociateContact
