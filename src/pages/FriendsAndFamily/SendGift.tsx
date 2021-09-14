import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CommonStyles from '../../common/Styles/Styles'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import { Trusted_Contacts, Wallet } from '../../bitcoin/utilities/Interface'
import useTrustedContacts from '../../utils/hooks/state-selectors/trusted-contacts/UseTrustedContacts'
import * as ExpoContacts from 'expo-contacts'
import { LocalizationContext } from '../../common/content/LocContext'

export default function AddContactSendRequest( props ) {
  const { translations, formatString } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]

  const [ encryptionKey, setEncryptKey ] = useState( '' )

  const [ trustedLink, setTrustedLink ] = useState( '' )
  const [ trustedQR, setTrustedQR ] = useState( '' )

  const SelectedContact = props.navigation.getParam( 'SelectedContact' )
    ? props.navigation.getParam( 'SelectedContact' )
    : []


  const [ Contact ] = useState(
    SelectedContact ? SelectedContact[ 0 ] : {
    },
  )
  const [ contactInfo, setContact ] = useState( SelectedContact ? SelectedContact[ 0 ] : {
  } )

  const wallet: Wallet = useSelector(
    ( state ) => state.storage.wallet,
  )
  const trustedContacts: Trusted_Contacts = useTrustedContacts()
  const dispatch = useDispatch()

  const getContact = () => {
    ExpoContacts.getContactsAsync().then( async ( { data } ) => {
      const filteredData = data.find( item => item.id === contactInfo.id )
      setContact( filteredData )
    } )
  }

  useEffect( () => {
    getContact()
  }, [] )


  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  return (
    <ScrollView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.pop( 3 )
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <RequestKeyFromContact
        isModal={false}
        headerText={'Send gift'}
        subHeaderText={'You can choose to send it to anyone using the QR or the link'}
        contactText={strings.adding}
        isGift={true}
        contact={Contact}
        QR={trustedQR}
        link={trustedLink}
        contactEmail={''}
        onPressBack={() => {
          props.navigation.goBack()
        }}
        onPressDone={() => {
          // openTimer()
        }}
        amt={numberWithCommas( 50000 )}
        onPressShare={() => {
        }}
      />
    </ScrollView>
  )
}
const styles = StyleSheet.create( {
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '1.7%' ),
  },
} )
