import React, { useState, useCallback } from 'react'
import { View, Text } from 'react-native'
import { useSelector } from 'react-redux'
import Fonts from '../../common/Fonts'
import NavStyles from '../../common/Styles/NavStyles'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import ContactList from '../../components/ContactList'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'

const TrustedContacts = ( props ) => {
  const [ contacts, setContacts ] = useState( [] )
  const index = props.index
  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )

  const selectedContactsList = useCallback( ( list ) => {
    if ( list.length > 0 ) setContacts( [ ...list ] )
  }, [] )

  const onPressContinue = useCallback( () => {
    if ( contacts.length == 2 ) {
      contacts[ 0 ].type = 'contact1'
      contacts[ 1 ].type = 'contact2'
    } else if ( contacts.length == 1 ) {
      if ( index == 1 ) {
        contacts[ 0 ].type = 'contact1'
      } else if ( index == 2 ) {
        contacts[ 0 ].type = 'contact2'
      }
    }
    props.onPressContinue( contacts, index )
  }, [ contacts, props.onPressContinue ] )

  const onPressSkip = () => {
    let { skippedContactsCount } = trustedContacts.tc
    let data
    if ( !skippedContactsCount ) {
      skippedContactsCount = 1
      data = {
        firstName: 'F&F request',
        lastName: `awaiting ${skippedContactsCount}`,
        name: `F&F request awaiting ${skippedContactsCount}`,
      }
    } else {
      data = {
        firstName: 'F&F request',
        lastName: `awaiting ${skippedContactsCount + 1}`,
        name: `F&F request awaiting ${skippedContactsCount + 1}`,
      }
    }

    props.onPressContinue( [ data ], index )
  }

  const renderContactList = useCallback(
    () => (
      <ContactList
        isTrustedContact={true}
        isShowSkipContact={true}
        style={{
        }}
        onPressContinue={onPressContinue}
        onSelectContact={selectedContactsList}
        onPressSkip={onPressSkip}
      />
    ),
    [ onPressContinue, selectedContactsList ],
  )

  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <View style={{
        ...NavStyles.modalHeaderTitleView,
        justifyContent: 'space-between'
      }}>
        <Text style={NavStyles.modalHeaderTitleText}>
          Associate a contact
        </Text>
        <AppBottomSheetTouchableWrapper
          onPress={onPressSkip}
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
              ...{
                color: Colors.white,
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.FiraSansMedium,
              },
            }}
          >
            Skip
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>

      <View style={{
        flex: 1
      }}>
        <Text
          style={{
            marginLeft: 30,
            color: Colors.textColorGrey,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue( 12 ),
            marginTop: 5,
          }}
        >
          Associate contact to{' '}
          <Text
            style={{
              fontFamily: Fonts.FiraSansMediumItalic,
              fontWeight: 'bold',
            }}
          >
            send Recovery Keys
          </Text>
        </Text>
        {props.LoadContacts ? renderContactList() : null}
      </View>
    </View>
  )
}

export default TrustedContacts
