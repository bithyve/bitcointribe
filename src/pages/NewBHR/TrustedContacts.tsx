import React, { useState, useCallback } from 'react'
import { View, Text, SafeAreaView, StatusBar } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
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
import { v4 as uuid } from 'uuid'

const TrustedContacts = ( props ) => {
  const [ contacts, setContacts ] = useState( [] )
  const selectedContactsList = useCallback( ( list ) => {
    if ( list.length > 0 ) setContacts( [ ...list ] )
  }, [] )

  const onPressContinue = useCallback( () => {
    props.route.params?.onPressContinue( contacts )
  }, [ contacts, props.route.params?.onPressContinue ] )

  const onPressSkip = () => {
    const contactDummy = {
      id: uuid(),
    }
    props.route.params?.onPressContinue( [ contactDummy ] )
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
        <AppBottomSheetTouchableWrapper
          onPress={() => {
            props.navigation.goBack()
          }}
          style={{
            height: 30,
            width: 30,
            justifyContent: 'center'
          }}
        >
          <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
        </AppBottomSheetTouchableWrapper>
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
                fontFamily: Fonts.Medium,
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
            fontFamily: Fonts.Regular,
            fontSize: RFValue( 12 ),
            marginTop: 5,
          }}
        >
          Associate contact to{' '}
          <Text
            style={{
              fontFamily: Fonts.MediumItalic,
              fontWeight: 'bold',
            }}
          >
            send Recovery Keys
          </Text>
        </Text>
        {props.route.params?.LoadContacts ? renderContactList() : null}
      </View>
    </SafeAreaView>
  )
}

export default TrustedContacts
