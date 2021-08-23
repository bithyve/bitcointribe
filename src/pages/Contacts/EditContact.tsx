import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, Linking, FlatList, Image, SafeAreaView, ImageSourcePropType, Platform, TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import openLink from '../../utils/OpenLink'
import { TextInput } from 'react-native-gesture-handler'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import ModalHeader from '../../components/ModalHeader'
import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import BottomSheet from 'reanimated-bottom-sheet'
import { editTrustedContact } from '../../store/actions/trustedContacts'
import deviceInfoModule, { getUniqueId } from 'react-native-device-info'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { useDispatch, useSelector } from 'react-redux'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export type Props = {
  navigation: any;
  closeModal: ( name: string ) => void;
  contact: ContactRecipientDescribing
};

interface MenuOption {
	title: string;
	subtitle: string;
	imageSource: ImageSourcePropType;
	onOptionPressed?: () => void;
}

// const menuOptions: MenuOption[] = [
// 	{
// 		title: 'Edit Name',
// 		imageSource: require('../../assets/images/icons/icon_account_management.png'),
// 		subtitle: 'Show all account on the Home Screen',
// 		screenName: 'AccountManagement',
// 	},
// 	{
// 		title: 'Associate a Contact',
// 		imageSource: require('../../assets/images/icons/own-node.png'),
// 		subtitle: 'Connect Hexa wallet to your own Bitcoin node',
// 		screenName: 'NodeSettings',
// 		onOptionPressed: () => {
// 			setIsLoadContacts(true)
// 			addContactAddressBookBottomSheetRef.current.snapTo(1)
// 		},
// 	},
// ]

const listItemKeyExtractor = ( item: MenuOption ) => item.title

const EditContactScreen: React.FC<Props> = ( { navigation, closeModal, contact }: Props ) => {
  const [ name, setName ] = useState( '' )
  const [ isLoadContacts, setIsLoadContacts ] = useState( false )
  const [ selectedContact, setSelectedContact ] = useState( '' )
  const [ addContactAddressBookBottomSheetRef ] = useState( React.createRef() )
  const dispatch = useDispatch()
  const menuOptions: MenuOption[] = [
    {
      title: 'Edit Name',
      imageSource: require( '../../assets/images/icons/icon_phonebook.png' ),
      subtitle: 'Show all account on the Home Screen',
    },
    {
      title: 'Associate a Contact',
      imageSource: require( '../../assets/images/icons/icon_phonebook.png' ),
      subtitle: 'Connect Hexa wallet to your own Bitcoin node',
      onOptionPressed: () => {
        setIsLoadContacts( true )
        navigation.navigate( 'AddContact', {
          fromScreen: 'Edit', contactToEdit: contact
        } )
        closeModal( '' )
      },
    },
  ]

  function handleOptionSelection( menuOption: MenuOption ) {
    if ( menuOption.title === 'Associate a Contact' ) {
      menuOption.onOptionPressed()
    }
  }
  const editContact = useCallback( async () => {
    dispatch( editTrustedContact( {
      channelKey: contact.channelKey,
      contactName: name,
    } ) )
    closeModal( name )
  }, [ contact, name ] )

  const renderAddContactFriendsAndFamily = () => {
    // const { isLoadContacts, selectedContact } = this.state
    if ( !isLoadContacts ) return
    return (
      <AddContactAddressBook
        isLoadContacts={isLoadContacts}
        proceedButtonText={'Confirm & Proceed'}
        onPressContinue={() => {
          if ( selectedContact && selectedContact.length ) {
            navigation.navigate( 'AddContactSendRequest', {
              SelectedContact: selectedContact,
            } )
            addContactAddressBookBottomSheetRef.current?.snapTo( 0 )
          }
        }}
        onSelectContact={( selectedData ) => {
          setSelectedContact( selectedData )
        }}
        onPressBack={() => {
          addContactAddressBookBottomSheetRef.current?.snapTo( 0 )
        }}
        onSkipContinue={() => {
          const contactDummy = {
            id: getUniqueId(),
          }
          navigation.navigate( 'AddContactSendRequest', {
            SelectedContact: [ contactDummy ],
          } )
          addContactAddressBookBottomSheetRef.current?.snapTo( 0 )
        }}
      />
    )
  }

  const renderAddContactAddressBookHeader = () => {
    return <ModalHeader />
  }

  return (
    <View style={{
      // flex: 1
      backgroundColor: Colors.white,
      justifyContent: 'space-between',
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => closeModal( '' )}
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19} style={{
        // marginTop: hp( 0.5 )
        }} />
      </TouchableOpacity>
      <FlatList
        data={menuOptions}
        keyExtractor={listItemKeyExtractor}
        ItemSeparatorComponent={() => (
          <View style={{
            backgroundColor: Colors.white
          }}>
            <View style={styles.separatorView} />
          </View>
        )}
        renderItem={( { item: menuOption }: { item: MenuOption } ) => {
          return <AppBottomSheetTouchableWrapper
            onPress={() => handleOptionSelection( menuOption )}
            style={styles.addModalView}
          >
            <View style={styles.modalElementInfoView}>
              <View style={{
                //   justifyContent: 'center'
              }}>
                <Image
                  source={menuOption.imageSource}
                  style={{
                    width: 25, height: 25, resizeMode: 'contain'
                  }}
                />
              </View>
              <View style={{
                justifyContent: 'center', marginLeft: 10
              }}>
                <Text style={styles.addModalTitleText}>{menuOption.title} </Text>
                <Text style={styles.addModalInfoText}>{menuOption.subtitle}</Text>
              </View>
            </View>
            {menuOption.title === 'Edit Name' &&
								<TextInput
								  style={{
								    // flex: 1,
								    borderRadius: 10,
								    borderWidth: 1,
								    borderColor: Colors.backgroundColor,
								    height: 50,
								    // margin: 20,
								    paddingLeft: 15,
								    paddingRight: 15,
								    fontSize: RFValue( 11 ),
								    fontFamily: Fonts.FiraSansMedium,
								     marginTop: 15, marginBottom: hp( '1%' )
								  }}
								  placeholder={'Enter Name'}
								  placeholderTextColor={Colors.borderColor}
								  value={name}
								  textContentType='none'
								  autoCompleteType='off'
								  autoCorrect={false}
								  autoCapitalize="none"
								  onKeyPress={event => {
								    // setBackspace( event )
								  }}
								  onChangeText={( text ) => {
								    setName( text )
								  }}
								  onSubmitEditing={
								    () => {
								      // contact.displayedName = name
								    }
								  }
								/>
            }
            {menuOption.title === 'Edit Name' &&
            <TouchableOpacity style={{
              alignSelf: 'center'
            }}
            disabled={name.length === 0}
            onPress={() => {
              editContact()
              // navigation.navigate( 'AddContactSendRequest', {
              //   SelectedContact: [ contact ],
              //   headerText:'Add a contact  ',
              //   subHeaderText:'Send a Friends and Family request',
              //   contactText:'Adding to Friends and Family:',
              //   showDone:true,
              //   fromEdit: 'fromEdit'
              // } )
            }}>
              <Text style={styles.addModalTitleText}>Proceed</Text>
            </TouchableOpacity>
            }
            {/* {menuOption.title === 'Edit Name' && errorText ?
								<Text style={{ marginLeft: 'auto', color: Colors.red, fontSize: RFValue(10), fontFamily: Fonts.FiraSansMediumItalic, }}>{errorText}</Text> : null
							} */}
          </AppBottomSheetTouchableWrapper>
        }}
      />
      <View style={{
        backgroundColor: Colors.white
      }}>
        <View style={styles.separatorView} />
      </View>
      <Text style={[ styles.addModalInfoText, {
        margin: hp( 4 ), marginTop: hp( 6 )
      } ]}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</Text>
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={addContactAddressBookBottomSheetRef}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && deviceInfoModule.hasNotch()
            ? hp( '82%' )
            : hp( '82%' ),
        ]}
        renderContent={renderAddContactFriendsAndFamily}
        renderHeader={renderAddContactAddressBookHeader}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    // flex: 1,
    justifyContent: 'space-between',
  },

  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor,
  },

  addModalView: {
    backgroundColor: Colors.white,
    paddingVertical: 4,
    paddingHorizontal: wp( 9 ),
    // flexDirection: 'row',
    // display: 'flex',
    justifyContent: 'space-between',
  },

  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular
  },

  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular
  },

  modalElementInfoView: {
    marginVertical: 10,
    height: heightPercentageToDP( '5%' ),
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
  },

  webLinkBarContainer: {
    flexDirection: 'row',
    elevation: 10,
    shadowColor: '#00000017',
    shadowOpacity: 1,
    shadowRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'space-around',
    height: 40,
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 10,
    marginBottom: heightPercentageToDP( 2 ),
    borderRadius: 10,
  },
} )

export default EditContactScreen
