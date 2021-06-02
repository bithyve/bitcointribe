import React, { useState, useCallback } from 'react'
import { View, Text, SafeAreaView, StatusBar } from 'react-native'
import { useSelector } from 'react-redux'
import Fonts from '../../common/Fonts'
import BackupStyles from './Styles'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import ContactList from '../../components/ContactList'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'

const TrustedContacts = ( props ) => {
  const [ contacts, setContacts ] = useState( [] )
  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )

  const selectedContactsList = useCallback( ( list ) => {
    if ( list.length > 0 ) setContacts( [ ...list ] )
  }, [] )

  const onPressContinue = useCallback( () => {
    props.navigation.state.params.onPressContinue( contacts )
  }, [ contacts, props.navigation.state.params.onPressContinue ] )

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
    props.navigation.state.params.onPressContinue( [ data ] )
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
    <SafeAreaView
      style={{
        // height: '90%',
        // flex: 1,
        backgroundColor: Colors.white,
        // alignSelf: 'center',
        // width: '100%',
      }}
    >
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View
        style={{
          ...BackupStyles.modalHeaderTitleView,
          paddingTop: hp( '0.5%' ),
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 20,
        }}
      >
        <Text style={BackupStyles.modalHeaderTitleText}>
          Associate a contact
        </Text>
        <AppBottomSheetTouchableWrapper
          onPress={onPressSkip}
          style={{
            height: wp( '13%' ),
            width: wp( '35%' ),
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              ...{
                color: Colors.white,
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.FiraSansMedium,
              },
              color: Colors.blue,
            }}
          >
            Skip
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>

      <View style={{
        // flex: 1
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
            send Recovery Keys..
          </Text>
        </Text>
        {props.navigation.state.params.LoadContacts ? renderContactList() : null}
      </View>
    </SafeAreaView>
  )
}

export default TrustedContacts
