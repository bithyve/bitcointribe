import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  PermissionsAndroid,
  Linking,
  SafeAreaView,
  TouchableOpacity
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
import CommonStyles from '../../common/Styles/Styles'
import RadioButton from '../../components/RadioButton'
import * as ExpoContacts from 'expo-contacts'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import ErrorModalContents from '../../components/ErrorModalContents'
import AntDesign from 'react-native-vector-icons/AntDesign'
import * as Permissions from 'expo-permissions'
import { setIsPermissionGiven } from '../../store/actions/preferences'
import ModalContainer from '../../components/home/ModalContainer'
import { Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import { v4 as uuid } from 'uuid'
import { SKIPPED_CONTACT_NAME } from '../../store/reducers/trustedContacts'
import { editTrustedContact } from '../../store/actions/trustedContacts'
import HeaderTitle from '../../components/HeaderTitle'
import { LocalizationContext } from '../../common/content/LocContext'

export default function AddContactAddressBook( props ) {
  let [ selectedContacts, setSelectedContacts ] = useState( [] )
  const [ editedContacts, setEditedContacts ] = useState( [ props.navigation.state.params?.contactToEdit ] )
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
          'title': strings.hexaWould,
          'message':  strings.Addressbookdetails,
          buttonPositive: common.allow,
          buttonNegative: common.deny,
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
          strings.Nocontacts,
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
        setErrorMessage( strings.cannotSelect )
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
        setErrorMessage( strings.cannotSelect )
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

  const trustedContacts: Trusted_Contacts = useSelector(
    ( state ) => state.trustedContacts.contacts,
  )
  const [ isTC, setIsTC ] = useState( false )

  // const isTrustedContact = useCallback(
  //   ( selectedContact ) => {
  //     const contactName = `${selectedContact.firstName} ${selectedContact.lastName ? selectedContact.lastName : ''
  //     }`
  //       .toLowerCase()
  //       .trim()

  //     const trustedContact = trustedContacts[ contactName ]
  //     if ( trustedContact && trustedContact.symmetricKey ) {
  //       // Trusted channel exists
  //       return true
  //     }
  //     return false
  //   },
  //   [ trustedContacts ],
  // )

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
    // const isTrustedC = await isTrustedContact( selectedContacts[ 0 ] )
    // setIsTC( isTrustedC )
    // if ( isTrustedC ) {
    //   Toast( 'Contact already exists' )
    // }
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


  const onPressContinue= () => {
    if ( selectedContacts && selectedContacts.length ) {
      if ( props.navigation.state.params?.fromScreen === 'Edit' )  {
        selectedContacts[ 0 ].id = props.navigation.state.params?.contactToEdit.id
        selectedContacts[ 0 ].channelKey = props.navigation.state.params?.contactToEdit.channelKey
        selectedContacts[ 0 ].displayedName = selectedContacts[ 0 ].name
        selectedContacts[ 0 ].avatarImageSource = selectedContacts[ 0 ].image ? selectedContacts[ 0 ].image : props.navigation.state.params?.contactToEdit.avatarImageSource
        dispatch( editTrustedContact( {
          channelKey: props.navigation.state.params?.contactToEdit.channelKey,
          contactName: selectedContacts[ 0 ].name,
          image: selectedContacts[ 0 ].image
        } ) )
        props.navigation.navigate( 'ContactDetails', {
          contact: selectedContacts[ 0 ],
        } )

      } else {
        props.navigation.navigate( 'AddContactSendRequest', {
          SelectedContact: selectedContacts,
          headerText: strings.addContact,
          subHeaderText:strings.send,
          contactText:strings.adding,
          showDone:true,
        } )
      }

    }
  }


  const onPressBack = () => {
    props.navigation.goBack()
  }

  const onSkipContinue= () => {
    const skippedContact = {
      id: uuid(),
    }

    props.navigation.navigate( 'AddContactSendRequest', {
      SelectedContact: [ skippedContact ],
      headerText: strings.addContact,
      subHeaderText:strings.send,
      contactText:strings.adding,
      showDone:true,
    } )
  }

  return (
    <View style={styles.modalContentContainer}>
      <SafeAreaView />
      {/* <View style={styles.modalHeaderTitleView}> */}
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.white
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
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
      <HeaderTitle
        firstLineTitle={props.modalTitle ? props.modalTitle : strings.Associate}
        secondLineTitle={strings.Select}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      {/* <View style={{
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
          </AppBottomSheetTouchableWrapper>
        </View> */}

      {/* </View> */}

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
            height: '95%', flexDirection: 'row', position: 'relative'
          }}>
            {filterContactData ? (
              <FlatList
                keyExtractor={( item, index ) => item.id}
                data={filterContactData}
                extraData={radioOnOff}
                showsVerticalScrollIndicator={false}
                contentInset={{
                  right: 0, top: 0, left: 0, bottom: hp( 24 )
                }}
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
          {/* {selectedContacts.length >= 1 && ( */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: hp( 5 ),
              width: wp( '50%' ),
              // alignSelf: 'center',
              flexDirection: 'row',
              // alignItems: 'flex-start',
            }}
          >
            <AppBottomSheetTouchableWrapper
              disabled={isTC || selectedContacts.length == 0}
              onPress={() => onPressContinue()}
              style={ selectedContacts.length ? styles.bottomButtonView : [ styles.bottomButtonView, {
                backgroundColor: Colors.lightBlue
              } ]}
            >
              <Text style={styles.buttonText}>{common.confirmProceed}</Text>
            </AppBottomSheetTouchableWrapper>
            {props.navigation.state.params?.fromScreen === 'Edit' ?
              null :
              <AppBottomSheetTouchableWrapper
                onPress={() => onSkipContinue()}
                style={{
                // height: wp( '8%' ),
                  marginTop: hp( 1.8 ),
                  width: wp( '25%' ),
                  alignSelf: 'flex-start',
                  paddingLeft: wp( '8%' ),
                }}
              >
                <Text
                  style={{
                    ...styles.proceedButtonText,
                  }}
                >
                  {common.skip}
                </Text>
              </AppBottomSheetTouchableWrapper>
            }
          </View>
          {/* )} */}
          <ModalContainer visible={permissionErrModal} closeBottomSheet={() => { setErrModal( false ) }}>
            <ErrorModalContents
              title={strings.erroraAccessing}
              info={errorMessage}
              proceedButtonText={strings.openSetting}
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
          <ModalContainer visible={permissionModal} closeBottomSheet={() => {}}>
            <ErrorModalContents
              // modalRef={contactPermissionBottomSheet}
              title={strings.why}
              info={strings.info}
              otherText={strings.otherText}
              proceedButtonText={common.continue}
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
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: hp( '2%' ),
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
    height: hp( '6%' ),
    width: wp( '45%' ),
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
    marginLeft: wp( 9 ),
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
