import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TextInput,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import RadioButton from '../components/RadioButton'
import AntDesign from 'react-native-vector-icons/AntDesign'
import * as ExpoContacts from 'expo-contacts'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Contacts from 'react-native-contacts'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { FlatList } from 'react-native-gesture-handler'
import * as Permissions from 'expo-permissions'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import ErrorModalContents from '../components/ErrorModalContents'
import ModalHeader from '../components/ModalHeader'
import Toast from '../components/Toast'
import { useDispatch, useSelector } from 'react-redux'
import { setIsPermissionGiven } from '../store/actions/preferences'
import ModalContainer from './home/ModalContainer'
import { LocalizationContext } from '../common/content/LocContext'

export default function ContactList( props ) {
  let [ selectedContacts, setSelectedContacts ] = useState( [] )
  const [ searchName, setSearchName ] = useState( '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ filterContactData, setFilterContactData ] = useState( [] )
  const [ radioOnOff, setRadioOnOff ] = useState( false )
  const [ contactPermissionAndroid, setContactPermissionAndroid ] = useState(
    false,
  )
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const [ contactPermissionIOS, setContactPermissionIOS ] = useState( false )
  const [
    contactListErrorBottomSheet,
    setContactListErrorBottomSheet,
  ] = useState( React.createRef() )
  const [
    contactPermissionBottomSheet,
    setContactPermissionBottomSheet,
  ] = useState( React.createRef() )

  const [
    permissionsModal,
    setPermissionsModal,
  ] = useState( false )

  const [
    permissionsErrModal,
    setPermissionsErrModal,
  ] = useState( false )

  const selectedcontactlist = props.selectedContacts
    ? props.selectedContacts
    : []
  const [ contactData, setContactData ] = useState( [] )
  const dispatch = useDispatch()
  const { approvingTrustedContact } = useSelector(
    ( state ) => state.trustedContacts.loading,
  )

  useEffect( () => {
    if ( props.selectedContacts ) {
      setSelectedContacts( selectedcontactlist )
      for ( let i = 0; i < filterContactData.length; i++ ) {
        if (
          props.selectedContacts.findIndex(
            ( value ) => value.id == filterContactData[ i ].id,
          ) > -1
        ) {
          filterContactData[ i ].checked = true
        } else {
          filterContactData[ i ].checked = false
        }
      }
      setRadioOnOff( !radioOnOff )
      setFilterContactData( filterContactData )
      props.onSelectContact( selectedcontactlist )
    }
  }, [ selectedcontactlist, filterContactData ] )

  const requestContactsPermission = async () => {
    try {
      dispatch( setIsPermissionGiven( true ) )
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: strings.hexaWould,
          message:
          strings.Addressbookdetails,
          buttonPositive: common.allow,
          buttonNegative: common.deny,
        },
      )
      return result
    } catch ( err ) {
      console.warn( err )
    }
  }

  const getContact = () => {
    ExpoContacts.getContactsAsync().then( async ( { data } ) => {
      if ( !data.length ) {
        //Alert.alert('No contacts found!');
        setErrorMessage(
          strings.Nocontacts,
        )
        // ( contactListErrorBottomSheet as any ).current.snapTo( 1 )
        setPermissionsErrModal( true )
      }
      setContactData( data )
      await AsyncStorage.setItem( 'ContactData', JSON.stringify( data ) )
      const contactList = data.sort( function ( a, b ) {
        if ( a.name && b.name ) {
          if ( a.name.toLowerCase() < b.name.toLowerCase() ) return -1
          if ( a.name.toLowerCase() > b.name.toLowerCase() ) return 1
        }
        return 0
      } )
      setFilterContactData( contactList )
    } )
  }

  const getContactPermission = async () => {
    dispatch( setIsPermissionGiven( true ) )
    if ( Platform.OS === 'android' ) {
      const granted = await requestContactsPermission()
      if ( granted !== PermissionsAndroid.RESULTS.GRANTED ) {
        setErrorMessage( strings.cannotSelect )
        // ( contactListErrorBottomSheet as any ).current.snapTo( 1 )
        setPermissionsErrModal( true )
        setContactPermissionAndroid( false )
        return
      } else {
        getContact()
      }
    } else if ( Platform.OS === 'ios' ) {
      const { status } = await Permissions.getAsync( Permissions.CONTACTS )
      if ( status === 'denied' ) {
        setContactPermissionIOS( false )
        setErrorMessage( strings.cannotSelect )
        // ( contactListErrorBottomSheet as any ).current.snapTo( 1 )
        setPermissionsErrModal( true )
        return
      } else {
        getContact()
      }
    }
  }

  const getContactsAsync = async () => {
    dispatch( setIsPermissionGiven( true ) )
    if ( Platform.OS === 'android' ) {
      const chckContactPermission = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_CONTACTS )
      //console.log("chckContactPermission",chckContactPermission)
      if ( !chckContactPermission ) {
        // ( contactPermissionBottomSheet as any ).current.snapTo( 1 )
        setPermissionsModal( true )
      } else {
        getContactPermission()
      }
    } else if ( Platform.OS === 'ios' ) {
      if( ( await Permissions.getAsync( Permissions.CONTACTS ) ).status === 'undetermined' ){
        // ( contactPermissionBottomSheet as any ).current.snapTo( 1 )
        setPermissionsModal( true )
      }
      else {
        getContactPermission()
      }
    }
  }

  useEffect( () => {
    ( async () => {
      await AsyncStorage.getItem( 'ContactData', ( err, value ) => {
        if ( err ) console.log( 'ERROR in COntactData', err )
        else {
          const data = JSON.parse( value )
          if ( data && data.length ) {
            setContactData( data )
            const contactList = data.sort( function ( a, b ) {
              if ( a.name && b.name ) {
                if ( a.name.toLowerCase() < b.name.toLowerCase() ) return -1
                if ( a.name.toLowerCase() > b.name.toLowerCase() ) return 1
              }
              return 0
            } )
            setFilterContactData( contactList )
          }
        }
      } )
    } )()
    getContactsAsync()
  }, [] )

  const filterContacts = ( keyword ) => {
    if ( contactData.length > 0 ) {
      if ( !keyword.length ) {
        setFilterContactData( contactData )
        return
      }
      const isFilter = true
      const filterContactsForDisplay = []
      for ( let i = 0; i < contactData.length; i++ ) {
        if (
          ( contactData[ i ].firstName &&
            contactData[ i ].firstName
              .toLowerCase()
              .startsWith( keyword.toLowerCase() ) ) ||
          ( contactData[ i ].lastName &&
            contactData[ i ].lastName
              .toLowerCase()
              .startsWith( keyword.toLowerCase() ) )
        ) {
          filterContactsForDisplay.push( contactData[ i ] )
        }
      }
      setFilterContactData( filterContactsForDisplay )
    } else {
      return
    }
  }

  async function onContactSelect( index ) {
    if ( selectedContacts.length == 2 && !props.isTrustedContact ) {
      Toast( 'Please remove one or more selected contacts to select a new one.' )
      return
    }
    const contacts = filterContactData
    if ( props.isTrustedContact ) {
      if ( contacts[ index ].checked ) {
        selectedContacts = []
      } else {
        selectedContacts[ 0 ] = contacts[ index ]
      }
    } else {
      if ( contacts[ index ].checked ) {
        selectedContacts.splice(
          selectedContacts.findIndex( ( temp ) => temp.id == contacts[ index ].id ),
          1,
        )
        let selectedContactsTemp = JSON.parse(
          await AsyncStorage.getItem( 'selectedContacts' ),
        )
        if ( !selectedContactsTemp ) {
          selectedContactsTemp = []
        }
        if (
          selectedContactsTemp.findIndex(
            ( item ) => item.id == contacts[ index ].id,
          ) > -1
        ) {
          selectedContactsTemp.splice(
            selectedContactsTemp.findIndex(
              ( temp ) => temp.id == contacts[ index ].id,
            ),
            1,
          )
        }
        await AsyncStorage.setItem(
          'selectedContacts',
          JSON.stringify( selectedContactsTemp ),
        )
      } else {
        if ( selectedContacts.length === 2 ) {
          selectedContacts.pop()
        }
        selectedContacts.push( contacts[ index ] )
      }
    }
    setSelectedContacts( selectedContacts )
    for ( let i = 0; i < contacts.length; i++ ) {
      if (
        selectedContacts.findIndex( ( value ) => value.id == contacts[ i ].id ) > -1
      ) {
        contacts[ i ].checked = true
      } else {
        contacts[ i ].checked = false
      }
    }
    setRadioOnOff( !radioOnOff )
    setFilterContactData( contacts )
    props.onSelectContact( selectedContacts )
  }

  async function onCancel( value ) {
    if ( filterContactData.findIndex( ( tmp ) => tmp.id == value.id ) > -1 ) {
      filterContactData[
        filterContactData.findIndex( ( tmp ) => tmp.id == value.id )
      ].checked = false
    }
    selectedContacts.splice(
      selectedContacts.findIndex( ( temp ) => temp.id == value.id ),
      1,
    )
    if ( !props.isTrustedContact ) {
      let selectedContacts = JSON.parse(
        await AsyncStorage.getItem( 'selectedContacts' ),
      )
      if ( !selectedContacts ) {
        selectedContacts = []
      }
      if ( selectedContacts.findIndex( ( item ) => item.id == value.id ) > -1 ) {
        selectedContacts.splice(
          selectedContacts.findIndex( ( temp ) => temp.id == value.id ),
          1,
        )
      }
      await AsyncStorage.setItem(
        'selectedContacts',
        JSON.stringify( selectedContacts ),
      )
    }
    setSelectedContacts( selectedContacts )
    setRadioOnOff( !radioOnOff )
    props.onSelectContact( selectedContacts )
  }

  const renderContactListErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        // modalRef={contactListErrorBottomSheet}
        title={strings.erroraAccessing}
        info={errorMessage}
        proceedButtonText={'Open Setting'}
        isIgnoreButton={true}
        onPressProceed={() => {
          Linking.openURL( 'app-settings:' )
          // ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
          setPermissionsErrModal( false )
        }}
        onPressIgnore={() => {
          // ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
          setPermissionsErrModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage ] )

  const renderContactListErrorModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          // ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
          setPermissionsErrModal( false )
        }}
      />
    )
  }, [] )

  const renderContactPermissionModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        // modalRef={contactPermissionBottomSheet}
        title={strings.Hexaneedsaddressbook}
        info={strings.Ifyouwantto}
        otherText={strings.Weneither}
        proceedButtonText={common.continue}
        isIgnoreButton={false}
        onPressProceed={() => {
          getContactPermission()
          // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
          setPermissionsModal( false )
        }}
        onPressIgnore={() => {
          // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
          setPermissionsModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../assets/images/icons/contactPermission.png' )}
      />
    )
  }, [] )

  // const renderContactPermissionModalHeader = useCallback( () => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
  //       }}
  //     />
  //   )
  // }, [] )

  return (
    <View style={{
      ...props.style, height: '95%'
    }}>
      <SafeAreaView />
      <View style={styles.selectedContactContainer}>
        {selectedContacts.length > 0
          ? selectedContacts.map( ( value, index ) => {
            return (
              <View key={index} style={styles.selectedContactView}>
                <Text style={styles.selectedContactNameText}>
                  {value.name ? value.name.split( ' ' )[ 0 ] : ''}{' '}
                  <Text style={{
                    fontFamily: Fonts.FiraSansMedium
                  }}>
                    {value.name ? value.name.split( ' ' )[ 1 ] : ''}
                  </Text>
                </Text>
                <AppBottomSheetTouchableWrapper
                  onPress={() => onCancel( value )}
                >
                  <AntDesign name="close" size={17} color={Colors.white} />
                </AppBottomSheetTouchableWrapper>
              </View>
            )
          } )
          : null}
      </View>

      <View style={[ styles.searchBoxContainer ]}>
        <View style={styles.searchBoxIcon}>
          <EvilIcons
            style={{
              alignSelf: 'center'
            }}
            name="search"
            size={20}
            color={Colors.textColorGrey}
          />
        </View>
        <TextInput
          style={styles.searchBoxInput}
          keyboardType={
            Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
          }
          autoCorrect={false}
          autoFocus={false}
          autoCompleteType="off"
          placeholder={common.search}
          placeholderTextColor={Colors.textColorGrey}
          onChangeText={( nameKeyword ) => {
            nameKeyword = nameKeyword.replace( /[^A-Za-z0-9 ]/g, '' )
            setSearchName( nameKeyword )
            filterContacts( nameKeyword )
          }
          }
          value={searchName}
        />
      </View>
      <View style={{
        flexDirection: 'row', position: 'relative'
      }}>
        {filterContactData ? (
          <FlatList
            keyExtractor={( item, index ) => item.id}
            data={filterContactData}
            extraData={radioOnOff}
            showsVerticalScrollIndicator={false}
            renderItem={( { item, index } ) => {
              let selected = false
              if (
                selectedContacts.findIndex( ( temp ) => temp.id == item.id ) > -1
              ) {
                selected = true
              }
              //  if (item.phoneNumbers || item.emails) {
              return (
                <AppBottomSheetTouchableWrapper
                  onPress={() => onContactSelect( index )}
                  style={styles.contactView}
                  key={index}
                >
                  <RadioButton
                    size={15}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={item.checked}
                    onpress={() => onContactSelect( index )}
                  />
                  <Text style={styles.contactText}>
                    {item.name && item.name.split( ' ' )[ 0 ]
                      ? item.name.split( ' ' )[ 0 ]
                      : ''}{' '}
                    <Text style={{
                      fontFamily: Fonts.FiraSansMedium
                    }}>
                      {item.name && item.name.split( ' ' )[ 1 ]
                        ? item.name.split( ' ' )[ 1 ]
                        : ''}
                    </Text>
                  </Text>
                </AppBottomSheetTouchableWrapper>
              )
              // }
              // else {
              //   return null;
              // }
            }}
          />
        ) : null}

      </View>
      {selectedContacts.length >= 1 && (
        <View
          style={{
            position: 'absolute',
            bottom: hp( 18 ),
            // // flex:1,
            width: wp( '50%' ),
            alignSelf: 'center',
          }}
        >
          <AppBottomSheetTouchableWrapper
            disabled={approvingTrustedContact}
            onPress={() => props.onPressContinue()}
            style={{
              ...styles.bottomButtonView,
              backgroundColor: approvingTrustedContact
                ? Colors.lightBlue
                : Colors.blue,
            }}
          >
            {approvingTrustedContact ? (
              <ActivityIndicator color={Colors.white} size={'small'} />
            ) : (
              <Text style={styles.buttonText}>Confirm & Proceed</Text>
            )}
          </AppBottomSheetTouchableWrapper>
        </View>
      )}
      <ModalContainer visible={permissionsErrModal} closeBottomSheet={() => {}} >
        {renderContactListErrorModalContent()}
      </ModalContainer>
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={contactListErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderContactListErrorModalContent}
        renderHeader={renderContactListErrorModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={contactPermissionBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '55%' ) : hp( '60%' ),
        ]}
        renderContent={renderContactPermissionModalContent}
        renderHeader={renderContactPermissionModalHeader}
      /> */}
      <ModalContainer visible={permissionsModal} closeBottomSheet={() => {}} >
        {renderContactPermissionModalContent()}
      </ModalContainer>
    </View>
  )
}

const styles = StyleSheet.create( {
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },
  bottomButtonView: {
    height: 50,
    width: wp( '50%' ),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    marginBottom: 20,
  },
  selectedContactView: {
    width: wp( '42%' ),
    height: wp( '12%' ),
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedContactNameText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  selectedContactContainer: {
    height: wp( '20%' ),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
  },
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexView: {
    flex: 0.5,
    height: '100%',
    justifyContent: 'space-evenly',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 0.5,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
  },
  searchBoxIcon: {
    justifyContent: 'center',
    marginBottom: -10,
  },
  searchBoxInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.blacl,
    borderBottomColor: Colors.borderColor,
    alignSelf: 'center',
    marginBottom: -10,
  },
} )
