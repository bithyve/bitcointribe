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
  TouchableOpacity,
  StatusBar
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
import Icon from 'react-native-vector-icons/MaterialIcons'
import ErrorModalContents from '../../components/ErrorModalContents'
import AntDesign from 'react-native-vector-icons/AntDesign'
import * as Permissions from 'expo-permissions'
import { setIsPermissionGiven, setContactPermissionAsked } from '../../store/actions/preferences'
import ModalContainer from '../../components/home/ModalContainer'
import { Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import { v4 as uuid } from 'uuid'
import { SKIPPED_CONTACT_NAME } from '../../store/reducers/trustedContacts'
import { editTrustedContact } from '../../store/actions/trustedContacts'
import HeaderTitle1 from '../../components/HeaderTitle1'
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
  const isPermissionSet = useSelector( state => state.preferences.contactPermissionAsked )
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
    dispatch( setContactPermissionAsked( true ) )

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
    if ( Platform.OS === 'android' ) {
      const chckContactPermission = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_CONTACTS )
      if ( !chckContactPermission ) {
        if( !isPermissionSet ){
          setModal( true )
        }
      } else {
        getContactPermission()
      }
    } else if ( Platform.OS === 'ios' ) {
      if( ( await Permissions.getAsync( Permissions.CONTACTS ) ).status === 'undetermined' ){
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
    if ( contactData.length > 0 ) {
      if ( !keyword.length ) {
        setFilterContactData( contactData )
        return
      }
      const isFilter = true
      const filterContactsForDisplay = []
      for ( let i = 0; i < contactData.length; i++ ) {
        const contactWords = contactData[ i ].name.split( ' ' ).length
        const middleName = contactData[ i ].name.split( ' ' ).slice( 1, contactWords-1 ).join( ' ' )
        if (
          ( contactData[ i ].firstName &&
            contactData[ i ].firstName
              .toLowerCase()
              .startsWith( keyword.toLowerCase() ) ) ||
          ( contactData[ i ].lastName &&
            contactData[ i ].lastName
              .toLowerCase()
              .startsWith( keyword.toLowerCase() ) ) ||
              ( contactData[ i ].name &&
                contactData[ i ].name
                  .toLowerCase()
                  .startsWith( keyword.toLowerCase() ) ) ||
                  ( middleName &&
                    middleName
                      .toLowerCase()
                      .startsWith( keyword.toLowerCase() ) )
        )  {
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
      } else if ( props.navigation.state.params?.fromScreen === 'Gift' )  {
        props.navigation.replace( 'EnterGiftDetails', {
          fromScreen: 'Gift',
          giftId: props.navigation.state.params?.giftId,
          contact: selectedContacts,
          setActiveTab: props.navigation.state.params.setActiveTab
        } )

      } else {
        props.navigation.navigate( 'AddContactSendRequest', {
          SelectedContact: selectedContacts,
          giftId: props.navigation.state.params?.giftId,
          headerText: strings.addContact,
          subHeaderText:strings.send,
          contactText:strings.adding,
          senderName: props?.navigation?.state?.params?.senderName,
          showDone:true,
          note : props?.navigation?.state?.params?.note
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
      giftId: props.navigation.state.params?.giftId,
      headerText: strings.addContact,
      subHeaderText:strings.send,
      contactText:strings.adding,
      showDone:true,
      skipClicked: true,
      senderName: props?.navigation?.state?.params?.senderName,
      note : props?.navigation?.state?.params?.note
    } )
  }

  return (
    <View style={styles.modalContentContainer}>
      <SafeAreaView />
      <StatusBar barStyle="dark-content"/>
      {/* <View style={styles.modalHeaderTitleView}> */}
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.pop( props.navigation.state.params?.fromScreen === 'Gift' ? 2 : 1 )
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
      <HeaderTitle1
        firstLineTitle={props.modalTitle ? props.modalTitle : 'Send Gift'}
        secondLineTitle={strings.Associate}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <Text style={styles.addressBook}>from your address book</Text>

      {selectedContacts.length !==0 &&
      <View style={styles.selectedContactContent}>
        <View style={styles.selectedContact}>
          <Text style={styles.selectedContactText}><Text style={styles.firstName}>{selectedContacts[ 0 ].firstName}</Text> {selectedContacts[ 0 ].lastName}</Text>
          <TouchableOpacity onPress={()=> {
            setSelectedContacts( [] )
            onContactSelect( filterContactData.findIndex( ( tmp ) => tmp.id == selectedContacts[ 0 ].id ) )
          }}>
            <Icon name='close' color={Colors.backgroundColor1} size={18}/>
          </TouchableOpacity>
        </View>
      </View>
      }
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
          {/* <View style={styles.selectedContactContainer}>
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
          </View> */}
          <View style={[ styles.searchBoxContainer ]}>
            <View style={styles.searchBoxIcon}>
              <Icon
                name="search"
                size={20}
                color={Colors.blue}
              />

            </View>
            <TextInput
              style={styles.searchBoxInput}
              keyboardType={
                Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
              }
              autoCorrect={false}
              autoFocus={false}
              placeholder='Search from address book'
              placeholderTextColor={Colors.babyGray}
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
                ListEmptyComponent={()=>
                  <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: wp( '8%' ),
                  }}>
                    <Text
                      style={{
                        fontFamily: Fonts.FiraSansRegular,
                        color: Colors.secondaryText,
                        textAlign: 'center'
                      }}
                    >{strings.cannotSelect}</Text>
                    {/* <AppBottomSheetTouchableWrapper
                      onPress={() => getContactPermission()}
                      style={{
                        // height: wp( '8%' ),
                        marginTop: hp( 1.8 ),
                        paddingLeft: wp( '8%' ),
                      }}
                    >
                      <Text
                        style={{
                          ...styles.proceedButtonText,
                        }}
                      >
                        Grant Permission
                      </Text>
                    </AppBottomSheetTouchableWrapper> */}
                  </View>
                }
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
                      style={{
                        ...styles.contactView,
                        backgroundColor: selected ? 'rgba(119, 185, 235, 0.4)' : null,
                      }}
                      key={index}
                      activeOpacity={0.1}
                    >
                      <RadioButton
                        size={15}
                        color={Colors.lightBlue}
                        borderColor={Colors.white}
                        isChecked={item.checked}
                        onpress={() => onContactSelect( index )}
                      />
                      <Text style={styles.contactText}>
                        {/* {item.name && item.name.split( ' ' )[ 0 ]
                          ? item.name.split( ' ' )[ 0 ]
                          : ''}{' '}
                        <Text style={{
                          fontFamily: Fonts.FiraSansMedium
                        }}>
                          {item.name && item.name.split( ' ' )[ 1 ]
                            ? item.name.split( ' ' )[ 1 ]
                            : ''}
                        </Text> */}

                        {item.name && item.name.split( ' ' ).map( ( x, index )=> {
                          const i = item.name.split( ' ' ).length
                          return (
                            <Text style={{
                              color: selected ? Colors.blue : Colors.black
                            }}>
                              {index !== i-1 ? `${x} ` :
                                <Text style={{
                                  fontFamily: Fonts.FiraSansMedium
                                }}>
                                  {x}
                                </Text>
                              }
                            </Text>
                          )
                        } )}
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
              left: hp( 1 ),
              // width: wp( '50%' ),
              // alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              // backgroundColor: 'red'
            }}
          >
            {
              filterContactData.length > 0 && (
                <AppBottomSheetTouchableWrapper
                  disabled={isTC || selectedContacts.length == 0}
                  onPress={() => onPressContinue()}
                  style={ selectedContacts.length ? styles.bottomButtonView : [ styles.bottomButtonView, {
                    backgroundColor: Colors.lightBlue
                  } ]}
                >
                  <Text style={styles.buttonText}>{common.confirmProceed}</Text>
                </AppBottomSheetTouchableWrapper>
              )
            }
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
                  {filterContactData.length > 0 ? common.skip : common.continue}
                </Text>
              </AppBottomSheetTouchableWrapper>
            }
            {props.navigation.state.params?.fromScreen === 'Gift' &&
<View style={styles.statusIndicatorView}>

  <View style={styles.statusIndicatorActiveView} />
  <View style={styles.statusIndicatorInactiveView} />
  <View style={styles.statusIndicatorInactiveView} />
</View>
            }
          </View>
          {/* )} */}
          {/* <ModalContainer onBackground={()=>setErrModal( false )} visible={permissionErrModal} closeBottomSheet={() => { setErrModal( false ) }}>
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
          </ModalContainer> */}
          <ModalContainer onBackground={()=>setModal( false )} visible={permissionModal} closeBottomSheet={() => {}}>
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
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 3 )
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    height: 5,
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
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
    height:hp( 6 ),
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft:wp( 5 ),
    marginVertical:hp( 0.7 ),
    width:wp( '90%' ),
    borderTopRightRadius:10,
    borderBottomRightRadius:10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    backgroundColor:Colors.white,
    height:hp( '5.5%' ),
    width:wp( '85%' ),
    alignItems:'center',
    marginVertical:hp( 2 ),
    borderRadius:10,
    marginHorizontal:wp( 5 )
  },
  searchBoxInput: {
    fontSize: RFValue( 12 ),
    color: Colors.black,
    fontFamily:Fonts.FiraSansItalic,
    paddingLeft:wp( 1.5 )
  },
  searchBoxIcon:{
    paddingLeft:wp( 2 )
  },
  addressBook:{
    fontSize: RFValue( 12 ),
    marginTop: hp( -1.5 ),
    marginLeft:wp( 5 ),
    color:Colors.textColorGrey,
  },
  selectedContactContent:{
    flexDirection:'row',
    justifyContent:'flex-start',
  },
  selectedContact:{
    padding:12,
    backgroundColor:'#77B9EB',
    borderRadius:10,
    flexDirection:'row',
    alignItems:'center',
    marginHorizontal:wp( 5 ),
    marginTop:hp( 1.7 ),
  },
  selectedContactText:{
    fontSize: RFValue( 12 ),
    color: Colors.backgroundColor1,
    fontFamily:Fonts.FiraSans,
    paddingRight:wp( 3 ),
    fontWeight:'500'
  },
  firstName:{
    fontWeight:'400'
  }
} )
