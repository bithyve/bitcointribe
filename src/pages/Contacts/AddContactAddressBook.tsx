import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ExpoContacts from 'expo-contacts'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuid } from 'uuid'
import { Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import ErrorModalContents from '../../components/ErrorModalContents'
import CreateFNFInvite from '../../components/friends-and-family/CreateFNFInvite'
import HeaderTitle from '../../components/HeaderTitle'
import ModalContainer from '../../components/home/ModalContainer'
import RadioButton from '../../components/RadioButton'
import { setContactPermissionAsked, setIsPermissionGiven } from '../../store/actions/preferences'
import { editTrustedContact } from '../../store/actions/trustedContacts'
import AlphabeticList from './AlphabeticList'

const viewabilityConfig = {
  itemVisiblePercentThreshold: 50 // Adjust as needed
}

export default function AddContactAddressBook( props ) {
  let [ selectedContacts, setSelectedContacts ] = useState( [] )
  const [ editedContacts, setEditedContacts ] = useState( [ props.route.params?.contactToEdit ] )
  const [ searchName, setSearchName ] = useState( '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ filterContactData, setFilterContactData ] = useState( [] )
  const [ radioOnOff, setRadioOnOff ] = useState( false )
  const [ currentLetter, setCurrentLetter ] = useState( '#' )
  const [ contactPermissionAndroid, setContactPermissionAndroid ] = useState(
    false,
  )
  const isPermissionSet = useSelector( state => state.preferences.contactPermissionAsked )
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const flatListRef =  React.useRef( null )
  const [ permissionModal, setModal ] = useState( false )
  const [ permissionErrModal, setErrModal ] = useState( false )
  const [ createFNFInvite, setCreateFNFInvite ] = useState( false )
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
          'message': strings.Addressbookdetails,
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

  const onViewableItemsChanged = useCallback( ( { viewableItems } ) => {
    if ( viewableItems.length > 0 ) {
      const firstItem = viewableItems[ 0 ].item
      let firstLetter = firstItem.name.trim()[ 0 ]
      if ( firstLetter.match( /[^A-Za-z]/ ) ) {
        firstLetter = '#'
      } else {
        firstLetter = firstLetter.toUpperCase() // Ensure it's uppercase
      }
      if( currentLetter !== firstLetter ){
        setCurrentLetter( firstLetter )
      }
    }
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
      const { status } = await ExpoContacts.requestPermissionsAsync()
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
        if ( !isPermissionSet ) {
          setModal( true )
        }
      } else {
        getContactPermission()
      }
    } else if ( Platform.OS === 'ios' ) {
      if ( ( await ExpoContacts.requestPermissionsAsync() ).status === 'undetermined' ) {
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
        if ( contactData[ i ].name != undefined && contactData[ i ].name != null && contactData[ i ].name != '' ) {
          const contactWords = contactData[ i ].name.split( ' ' ).length
          const middleName = contactData[ i ].name.split( ' ' ).slice( 1, contactWords - 1 ).join( ' ' )
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
          ) {
            filterContactsForDisplay.push( contactData[ i ] )
          }
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

  const findIndexOfLetter = ( letter ) => {
    return filterContactData.findIndex( ( contact ) => {
      let firstCharacter = contact.name.trim()[ 0 ].toUpperCase()
      if ( firstCharacter.match( /[^A-Za-z]/ ) ) {
        firstCharacter = '#'
      }
      return firstCharacter === letter
    } )
  }

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


  const onPressContinue = () => {
    if ( selectedContacts && selectedContacts.length ) {

      if ( props.route.params?.fromScreen === 'Edit' ) {
        selectedContacts[ 0 ].id = props.route.params?.contactToEdit.id
        selectedContacts[ 0 ].channelKey = props.route.params?.contactToEdit.channelKey
        selectedContacts[ 0 ].displayedName = selectedContacts[ 0 ].name
        selectedContacts[ 0 ].avatarImageSource = selectedContacts[ 0 ].image ? selectedContacts[ 0 ].image : props.route.params?.contactToEdit.avatarImageSource
        dispatch( editTrustedContact( {
          channelKey: props.route.params?.contactToEdit.channelKey,
          contactName: selectedContacts[ 0 ].name,
          image: selectedContacts[ 0 ].image
        } ) )
        props.navigation.navigate( 'ContactDetails', {
          contact: selectedContacts[ 0 ],
        } )
      } else if ( props.route.params?.fromScreen === 'Gift' ) {
        props.navigation.replace( 'EnterGiftDetails', {
          fromScreen: 'Gift',
          giftId: props.route.params?.giftId,
          contact: selectedContacts,
          setActiveTab: props.route.params.setActiveTab
        } )
      } else {
        if( props.route.params?.fromScreen === 'Invitation' ){
          setCreateFNFInvite( true )
        }else{
          props.navigation.navigate( 'AddContactSendRequest', {
            SelectedContact: selectedContacts,
            giftId: props.route.params?.giftId,
            headerText: strings.addContact,
            subHeaderText: strings.send,
            contactText: strings.adding,
            senderName: props?.route.params?.senderName,
            showDone: true,
            note: props?.route.params?.note
          } )

        }

      }

    }
  }
  const sendRequestToContact = () => {
    setCreateFNFInvite( false )
    props.navigation.navigate( 'AddContactSendRequest', {
      SelectedContact: selectedContacts,
      giftId: props.route.params?.giftId,
      headerText: strings.addContact,
      subHeaderText: strings.send,
      contactText: strings.adding,
      senderName: props?.route.params?.senderName,
      showDone: true,
      note: props?.route.params?.note
    } )
  }
  const goCreateGifts = () => {
    setCreateFNFInvite( false )
    props.navigation.navigate( 'CreateGift', {
      selectedContact: selectedContacts,
      statusFlag: 'Invitation',
      giftId: props.route.params?.giftId,
    } )
  }
  const onPressBack = () => {
    props.navigation.goBack()
  }

  const scrollToChar=( char:string )=>{
    const index = findIndexOfLetter( char )
    if ( index !== -1 ) {
      flatListRef.current.scrollToIndex( {
        animated: false, index: index
      } )
    } else {
      //No contact starting with this letter
    }
  }

  const onSkipContinue = () => {
    const skippedContact = {
      id: uuid(),
    }
    props.navigation.navigate( 'AddContactSendRequest', {
      SelectedContact: [ skippedContact ],
      giftId: props.route.params?.giftId,
      headerText: strings.addContact,
      subHeaderText: strings.send,
      contactText: strings.adding,
      showDone: true,
      skipClicked: true,
      senderName: props?.route.params?.senderName,
      note: props?.route.params?.note
    } )
  }

  const getItemLayout = ( _data: any, index: number ) => ( {
    length: 45,
    offset: 45 * index,
    index,
  } )


  return (
    <SafeAreaView style={styles.modalContentContainer}>
      <View style={styles.modalContentContainer}>
        <StatusBar barStyle="dark-content" />
        {/* <View style={styles.modalHeaderTitleView}> */}
        <HeaderTitle
          navigation={props.navigation}
          backButton={true}
          // firstLineTitle={props.modalTitle ? props.modalTitle : 'Send Gift'}
          secondLineTitle={strings.Associate}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
        {/* <Text style={styles.addressBook}>from your address book</Text> */}

        {selectedContacts.length !== 0 &&
        <View style={styles.selectedContactContent}>
          <View style={styles.selectedContact}>
            <Text style={styles.selectedContactText}><Text style={styles.firstName}>{selectedContacts[ 0 ].firstName}</Text> {selectedContacts[ 0 ].lastName}</Text>
            <TouchableOpacity onPress={() => {
              setSelectedContacts( [] )
              onContactSelect( filterContactData.findIndex( ( tmp ) => tmp.id == selectedContacts[ 0 ].id ) )
            }}>
              <Icon name='close' color={Colors.backgroundColor1} size={18} />
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
                fontFamily: Fonts.Regular,
              }}
            >
              Skip
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View> */}

        {/* </View> */}

        <View style={{
          flex: 1
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
                        fontFamily: Fonts.Medium
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
              <AlphabeticList selected={currentLetter} onPress={scrollToChar}/>
              {filterContactData ? (
                <FlatList
                  keyExtractor={( item, index ) => item.id}
                  data={filterContactData}
                  extraData={radioOnOff}
                  ref={flatListRef}
                  showsVerticalScrollIndicator={false}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  contentInset={{
                    right: 0, top: 0, left: 0, bottom: hp( 24 )
                  }}
                  // getItemLayout={getItemLayout}
                  ListEmptyComponent={() =>
                    <View style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: wp( '8%' ),
                    }}>
                      <Text
                        style={{
                          fontFamily: Fonts.Regular,
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
                          backgroundColor: selected ? 'rgba(105, 162, 176, 0.4)' : null,
                        }}
                        key={index}
                        activeOpacity={0.1}
                      >
                        <RadioButton
                          size={selected ? 15 : 20}
                          color={selected ? Colors.blue : Colors.gray1}
                          borderColor={selected ? Colors.white :  Colors.backgroundColor}
                          isChecked={item.checked}
                          onpress={() => onContactSelect( index )}
                        />
                        <Text style={styles.contactText}>
                          {/* {item.name && item.name.split( ' ' )[ 0 ]
                          ? item.name.split( ' ' )[ 0 ]
                          : ''}{' '}
                        <Text style={{
                          fontFamily: Fonts.Medium
                        }}>
                          {item.name && item.name.split( ' ' )[ 1 ]
                            ? item.name.split( ' ' )[ 1 ]
                            : ''}
                        </Text> */}

                          {item.name && item.name.split( ' ' ).map( ( x, index ) => {
                            const i = item.name.split( ' ' ).length
                            return (
                              <Text key={`${x}_${index}`} style={{
                                color: selected ? Colors.white : Colors.black
                              }}>
                                {index !== i - 1 ? `${x} ` :
                                  <Text style={{
                                    fontFamily: Fonts.Medium
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
                  ListFooterComponent={()=><View style={{
                    height:100, width:'100%'
                  }}/>}
                />
              ) : null}
            </View>
            {/* {selectedContacts.length >= 1 && ( */}
            <View
              style={{
                position: 'absolute',
                bottom: hp( -4 ),
                // left: hp(1),
                width: wp( '100%' ),
                // alignSelf: 'center',
                flexDirection: 'row-reverse',
                justifyContent: 'flex-start',
                alignItems:'center',
              }}
            >
              <View style={styles.opacityPlaceholder}/>
              {
                selectedContacts.length > 0 && (
                  <AppBottomSheetTouchableWrapper
                    disabled={isTC || selectedContacts.length == 0}
                    onPress={() => onPressContinue()}

                  >
                    <View
                      style={selectedContacts.length ? styles.bottomButtonView : [ styles.bottomButtonView, {
                        backgroundColor: Colors.lightBlue
                      } ]}
                    >
                      <Text style={styles.buttonText}>{common.confirmProceed}</Text>
                    </View>
                  </AppBottomSheetTouchableWrapper>

                )
              }
              {props.route.params?.fromScreen === 'Edit' ?
                null :
                <AppBottomSheetTouchableWrapper
                  onPress={() => onSkipContinue()}
                  style={{
                  // height: wp( '8%' ),
                    marginTop: hp( 1.8 ),
                    width: wp( '28%' ),
                    alignSelf: 'flex-start',
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

              {/* {
              <View style={styles.statusIndicatorView}>

                <View style={styles.statusIndicatorActiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
              </View>

            } */}

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
            <ModalContainer onBackground={() => setModal( false )} visible={permissionModal} closeBottomSheet={() => { }}>
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
            {/* create FNF Invite */}
            <ModalContainer onBackground={() => setCreateFNFInvite( false )} visible={createFNFInvite} closeBottomSheet={() => { }}>
              <CreateFNFInvite
                closeModal={()=> setCreateFNFInvite( false )}
                sendRequestToContact={()=> sendRequestToContact()}
                createGifts={()=> goCreateGifts()}
              />
            </ModalContainer>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 2 )
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
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium,
    marginRight:20,
    marginBottom: 20,
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
    fontFamily: Fonts.Regular,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
  TitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 12 ),
    paddingHorizontal:5
  },
  bottomButtonView: {
    height: hp( '6%' ),
    width: wp( '43%' ),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 10,
    marginBottom: 20,
    marginRight:30
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
    fontFamily: Fonts.Regular
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
    height: hp( 6 ),
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: wp( 5 ),
    marginVertical: hp( 0.7 ),
    width: wp( '90%' ),
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    height: hp( '5.5%' ),
    width: wp( '85%' ),
    alignItems: 'center',
    marginVertical: hp( 2 ),
    borderRadius: 10,
    marginHorizontal: wp( 5 )
  },
  searchBoxInput: {
    fontSize: RFValue( 12 ),
    color: Colors.black,
    fontFamily: Fonts.Italic,
    paddingLeft: wp( 1.5 )
  },
  searchBoxIcon: {
    paddingLeft: wp( 2 )
  },
  addressBook: {
    fontSize: RFValue( 12 ),
    marginTop: hp( -1.5 ),
    marginLeft: wp( 5 ),
    color: Colors.textColorGrey,
  },
  selectedContactContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  selectedContact: {
    padding: 12,
    backgroundColor: Colors.testAccCard,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp( 5 ),
    marginTop: hp( 1.7 ),
  },
  selectedContactText: {
    fontSize: RFValue( 12 ),
    color: Colors.backgroundColor1,
    fontFamily: Fonts.FiraSans,
    paddingRight: wp( 3 ),
    fontWeight: '500'
  },
  firstName: {
    fontWeight: '400'
  },
  opacityPlaceholder:{
    opacity:0.7,
    backgroundColor:Colors.backgroundColor,
    width:'100%',
    height:'100%',
    position:'absolute',
    zIndex:0
  }
} )
