import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSelector, useDispatch } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { FlatList } from 'react-native-gesture-handler'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RadioButton from '../../components/RadioButton'
import * as ExpoContacts from 'expo-contacts'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Contacts from 'react-native-contacts'
import ErrorModalContents from '../../components/ErrorModalContents'
import ModalHeader from '../../components/ModalHeader'
import AntDesign from 'react-native-vector-icons/AntDesign'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import * as Permissions from 'expo-permissions'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import Toast from '../../components/Toast'
import { setIsPermissionGiven } from '../../store/actions/preferences'
import ModalContainer from '../../components/home/ModalContainer'

export default function AddContactAddressBook( props ) {
  let [ selectedContacts, setSelectedContacts ] = useState( [] )
  const [ searchName, setSearchName ] = useState( '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ filterContactData, setFilterContactData ] = useState( [] )
  const [ radioOnOff, setRadioOnOff ] = useState( false )
  const [ contactPermissionAndroid, setContactPermissionAndroid ] = useState(
    false,
  )
  const [ permissionModal, setModal ] = useState( false )
  const [ permissionErrModal, setErrModal ] = useState( false )
  const [
    contactPermissionBottomSheet,
    setContactPermissionBottomSheet,
  ] = useState( React.createRef() )
  const [ contactPermissionIOS, setContactPermissionIOS ] = useState( false )
  const dispatch = useDispatch()

  const [ contactData, setContactData ] = useState( [] )
  // const [ selectedContact, setContact ] = useState( [] )

  const requestContactsPermission = async () => {
    try {
      dispatch( setIsPermissionGiven( true ) )
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          'title': 'Hexa Would Like to Access Your Contacts',
          'message': 'Address book details are only stored locally',
          'buttonPositive': 'Allow',
          'buttonNegative': 'Deny'
        }
      )
      return result
    } catch ( err ) {
      console.warn( err )
    }
  }

  useEffect( () => {
    // if( props.isLoadContacts ){
    getContactsAsync()
    // }
  }, [] )


  const getContact = () => {
    // if ( props.isLoadContacts ) {
    ExpoContacts.getContactsAsync().then( async ( { data } ) => {
      if ( !data.length ) {
        setErrorMessage(
          'No contacts found. Please add contacts to your Address Book and try again',
        )
        setErrModal( true )
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
    // }
  }

  const getContactPermission = async () => {
    dispatch( setIsPermissionGiven( true ) )
    if ( Platform.OS === 'android' ) {
      const granted = await requestContactsPermission()
      //console.log('GRANTED', granted);
      if ( granted !== PermissionsAndroid.RESULTS.GRANTED ) {
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        )
        setErrModal( true )
        setContactPermissionAndroid( false )
        return
      } else {


        // TODO: Migrate it using react-native-contact
        getContact()
      }
    } else if ( Platform.OS === 'ios' ) {
      const { status, expires, permissions } = await Permissions.askAsync(
        Permissions.CONTACTS,
      )
      if ( status === 'denied' ) {
        setContactPermissionIOS( false )
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        )
        setErrModal( true )
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
        setModal( true )
      } else {
        getContactPermission()
      }
    } else if ( Platform.OS === 'ios' ) {
      if( ( await Permissions.getAsync( Permissions.CONTACTS ) ).status === 'undetermined' ){
        // ( contactPermissionBottomSheet as any ).current.snapTo( 1 )
        setModal( true )
      }
      else {
        getContactPermission()
      }
    }
  }

  useEffect( () => {
    ( async () => {
      await AsyncStorage.getItem( 'ContactData', ( err, value ) => {
        if ( err ) console.log( 'ERROR in ContactData', err )
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
  }, [] )

  const filterContacts = ( keyword ) => {
    console.log( 'filterContacts keyword', keyword )
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

  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )
  const [ isTC, setIsTC ] = useState( false )

  const isTrustedContact = useCallback(
    ( selectedContact ) => {
      const contactName = `${selectedContact.firstName} ${selectedContact.lastName ? selectedContact.lastName : ''
      }`
        .toLowerCase()
        .trim()

      const trustedContact = trustedContacts.tc.trustedContacts[ contactName ]
      if ( trustedContact && trustedContact.symmetricKey ) {
        // Trusted channel exists
        return true
      }
      return false
    },
    [ trustedContacts ],
  )

  async function onContactSelect( index ) {
    const contacts = filterContactData
    if ( contacts[ index ].checked ) {
      selectedContacts = []
    } else {
      selectedContacts[ 0 ] = contacts[ index ]
    }
    setSelectedContacts( selectedContacts )
    // onSelectContact( selectedContacts )
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
    const isTrustedC = await isTrustedContact( selectedContacts[ 0 ] )
    setIsTC( isTrustedC )
    if ( isTrustedC ) {
      Toast( 'Contact already exists' )
    }
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
    setSelectedContacts( selectedContacts )
    setRadioOnOff( !radioOnOff )
    // props.onSelectContact( selectedContacts )
  }


  const renderContactPermissionModalContent = useCallback( () => {

    return (
      <ErrorModalContents
        // modalRef={contactPermissionBottomSheet}
        title={'Hexa needs access to your address book.'}
        info={'If you want to associate an address book contact with your Friends & Family in Hexa, you will need to give access to your address book \n\nIt is a good way to remember who the contacts are with their name and image'}
        otherText={'Don’t worry these details don’t leave your phone and are for your eyes or people you share it with'}
        proceedButtonText={'Continue'}
        isIgnoreButton={false}
        onPressProceed={() => {
          getContactPermission()
          // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
          // setModal( false )
        }}
        onPressIgnore={() => {
          // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
          // setModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
      />
    )
  }, [] )


  const onPressContinue= () => {
    if ( selectedContacts && selectedContacts.length ) {
      props.navigation.navigate( 'AddContactSendRequest', {
        SelectedContact: selectedContacts,
        headerText:'Add a contact  ',
        subHeaderText:'Send a Friends and Family request',
        contactText:'Adding to Friends and Family:',
        showDone:true,
      } )
    }
  }


  const onPressBack = () => {
    props.navigation.goBack()
  }

  const onSkipContinue= () => {
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

    props.navigation.navigate( 'AddContactSendRequest', {
      SelectedContact: [ data ],
      headerText:'Add a contact  ',
      subHeaderText:'Send a Friends and Family request',
      contactText:'Adding to Friends and Family:',
      showDone:true,
    } )
  }
  console.log( 'permissionModal >>>>>  value', permissionModal )

  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{
          flexDirection: 'row'
        }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => onPressBack()}
            style={{
              height: 30, width: 30, justifyContent: 'center'
            }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View style={{
            justifyContent: 'center', flex: 1
          }}>
            <Text style={styles.modalHeaderTitleText}>
              {props.modalTitle ? props.modalTitle : 'Associate a contact'}
            </Text>
            <Text style={styles.modalHeaderInfoText}>
              {'Select a contact from your phone\'s address book'}
            </Text>
          </View>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              onSkipContinue()
            }}
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
                color: Colors.white,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Skip
            </Text>
            {/* <FontAwesome
              name="plus"
              color={Colors.white}
              size={10}
              style={{ marginLeft: 5 }}
            /> */}
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>

      <View style={{
        flex : 1
      }}>
        {/* <View
          style={{
            paddingLeft: wp( '5%' ),
            paddingRight: wp( '5%' ),
            paddingTop: wp( '5%' ),
          }}
        >
          <Text style={styles.modalHeaderInfoText}>
            {'Add contacts from your Address Book, or add a new contact'}
          </Text>
        </View> */}
        <View style={{
          height: '95%', ...props.style
        }}>
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
                      <AntDesign
                        name="close"
                        size={17}
                        color={Colors.white}
                      />
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
              placeholder="Search"
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
            height: '95%', flexDirection: 'row', position: 'relative'
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
                    selectedContacts.findIndex( ( temp ) => temp.id == item.id ) >
                    -1
                  ) {
                    selected = true
                  }
                  // if (item.phoneNumbers || item.emails) {
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
                  // } else {
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
                bottom: 0,
                width: wp( '50%' ),
                alignSelf: 'center',
              }}
            >
              <AppBottomSheetTouchableWrapper
                disabled={isTC}
                onPress={() => onPressContinue()}
                style={styles.bottomButtonView}
              >
                <Text style={styles.buttonText}>Confirm & Proceed..</Text>
              </AppBottomSheetTouchableWrapper>
            </View>
          )}
          <ModalContainer visible={permissionErrModal} closeBottomSheet={() => { setErrModal( false ) }}>
            <ErrorModalContents
              title={'Error while accessing your contacts '}
              info={errorMessage}
              proceedButtonText={'Open Setting'}
              isIgnoreButton={true}
              onPressProceed={() => {
                Linking.openURL( 'app-settings:' )
                setErrModal( false )
              }}
              onPressIgnore={() => {
                setErrModal( false )

              }}
              isBottomImage={true}
              bottomImage={require( '../../assets/images/icons/errorImage.png' )}
            />
          </ModalContainer>
          <ModalContainer visible={permissionModal} closeBottomSheet={() => { setModal( false ) }}>
            <ErrorModalContents
              // modalRef={contactPermissionBottomSheet}
              title={'Hexa needs access to your address book.'}
              info={'If you want to associate an address book contact with your Friends & Family in Hexa, you will need to give access to your address book \n\nIt is a good way to remember who the contacts are with their name and image'}
              otherText={'Don’t worry these details don’t leave your phone and are for your eyes or people you share it with'}
              proceedButtonText={'Continue'}
              isIgnoreButton={false}
              onPressProceed={() => {
                getContactPermission()
                // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
                setModal( false )
              }}
              onPressIgnore={() => {
                // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
                setModal( false )
              }}
              isBottomImage={true}
              bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
            />
          </ModalContainer>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor1,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: hp( '2%' ),
    paddingTop: hp( '4%' ),
    marginBottom: wp( '5%' ),
    marginLeft: wp( '4%' ),
    marginRight: wp( '4%' ),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  TitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
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
    alignItems: 'center'
  },
  selectedContactNameText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular
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
  searchBoxContainer: {
    flexDirection: 'row',
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 0.5,
    marginTop: wp( '5%' ),
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
