import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, StatusBar, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, Image } from 'react-native'
import Fonts from '../../common/Fonts'
import BackupStyles from './Styles'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import ContactList from '../../components/ContactList'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'
import { TrustedContactRelationTypes, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import trustedContacts from '../../store/reducers/trustedContacts'
import { useSelector } from 'react-redux'
import ImageStyles from '../../common/Styles/ImageStyles'
import RecipientAvatar from '../../components/RecipientAvatar'
import { RadioButton } from 'react-native-paper/lib/typescript/components/RadioButton/RadioButton'

const FNFToKeeper = ( props ) => {
  const [ contacts, setContacts ] = useState( [] )
  const [ selectedItem, setSelected ] = useState( '' )
  const trustedContacts: Trusted_Contacts = useSelector( ( state ) => state.trustedContacts.contacts )
  useEffect( () => {
    const contacts: Trusted_Contacts = trustedContacts
    // getContact( contacts )
    const c = []
    for ( const channelKey of Object.keys( contacts ) ) {
      const contact = contacts[ channelKey ]
      if ( ( contact.relationType === TrustedContactRelationTypes.CONTACT || contact.relationType === TrustedContactRelationTypes.WARD ) && contact.contactDetails.contactName ) {
        c.push( {
          ...contact, channelKey
        } )
      }
    }
    if ( c.length === 0 ) {
      props.navigation.state.params.selectContact( 'AddContact', {
      } )
      props.navigation.goBack()
    }
    setContacts( c )
  }, [] )

  // const getContact = () => {
  //   ExpoContacts.getContactsAsync().then( async ( { data } ) => {
  //     const filteredData = data.find( item => item.id === contactInfo.id )
  //     // setPhoneumber( filteredData.phoneNumbers )

  //     setContact( filteredData )
  //     // setEmails( filteredData.emails )
  //     // await AsyncStorage.setItem( 'ContactData', JSON.stringify( data ) )
  //   } )
  // }

  const firstNamePieceText = ( contact ) => {
    return contact.contactName?.split( ' ' )[ 0 ] + ' '
  }

  const secondNamePieceText = ( contact ) => {
    return contact.contactName?.split( ' ' ).slice( 1 ).join( ' ' )
  }
  const renderContactListItem = useCallback( ( {
    contactDescription,
    index,
  }: {
    contactDescription: any;
    index: number;
    contactsType: string;
  }
  ) => {
    return <TouchableOpacity style={styles.listItem} onPress={() => {
      const obj = {
        name: contactDescription.contactDetails.contactName,
        imageAvailable: contactDescription.contactDetails.imageAvailable ? true : false,
        image: contactDescription.contactDetails.imageAvailable,
        id: contactDescription.contactDetails.id,
        channelKey: contactDescription.channelKey
      }
      props.navigation.state.params.selectContact( 'ExistingContact', obj )
      props.navigation.goBack()
    }}
    >
      <View style={{
        backgroundColor: contactDescription.contactDetails.id === selectedItem ? Colors.blue : Colors.backgroundColor,
        width: wp( '5.5%' ), height: wp( '5.5%' ), borderRadius: wp( '5.5/2%' ),
        alignItems: 'center', marginRight: wp( 2 ),
        justifyContent: 'center'
      }}>{contactDescription.contactDetails.id === selectedItem &&
        <Image
          source={require( '../../assets/images/icons/check_white.png' )}
          style={{
            width: wp( '3.5%' ), height: wp( '3.5%' ),
          }}
          resizeMode={'contain'}
        />
        }

      </View>

      <RecipientAvatar recipient={contactDescription.contactDetails} contentContainerStyle={styles.avatarImage} />
      <Text style={{
        textAlign: 'center', marginLeft: wp( 2 ),
      }}>{firstNamePieceText( contactDescription.contactDetails )}
        <Text style={styles.secondNamePieceText}>{secondNamePieceText( contactDescription.contactDetails )}</Text>
      </Text>
    </TouchableOpacity>

  }, [] )
  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SafeAreaView />
      <ScrollView>
        <View style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor
        }}>
          <View style={[ CommonStyles.headerContainer, {
            backgroundColor: Colors.backgroundColor
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

          <View>
            <HeaderTitle
              firstLineTitle={'Backup Recovery Key'}
              secondLineTitle={'Select contacts from your address book,\nor add a new contact'}
              infoTextNormal={''}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            <TouchableOpacity
              onPress={() => {
                props.navigation.state.params.selectContact( 'AddContact', {
                } )
                props.navigation.goBack()
              }}
              style={styles.addContactBtn}>
              <Image
                source={require( '../../assets/images/icons/addressbook.png' )}
                style={styles.plusIcon}
              />
              <Text style={{
                marginHorizontal: wp( 2 ),
                color: Colors.gray2,
                fontFamily: Fonts.FiraSansMedium,
                fontSize: RFValue( 14 )
              }}>Choose from Phonebook</Text>
            </TouchableOpacity>
            <Text style={{
              marginHorizontal: wp( 2 ),
              color: Colors.blue,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue( 16 ),
              marginLeft: wp( 4 ),
              marginBottom: wp( 2 ),
              marginTop: wp( 2 )
            }}>Existing Contacts: </Text>
            {( contacts.length && contacts.map( ( item, index ) => {
              // if ( !item.contactDetails.contactName ) {
              //   return
              // }
              return renderContactListItem( {
                contactDescription: item,
                index,
                contactsType: 'Other Contacts',
              } )
            } ) ) ||
            <View style={styles.noContacts} >
              <Text style={{
                color: Colors.gray2,
              }}>
              No contacts</Text>
            </View>
            }
          </View>
        </View>
      </ScrollView>
      {/* </SafeAreaView> */}
    </View>
  )
}

export default FNFToKeeper

const styles = StyleSheet.create( {
  noContacts: {
    height: wp( '22%' ) + 30,
    alignSelf: 'center',
    marginTop: hp( 4 ),
  },
  addContactBtn: {
    marginHorizontal: wp( 4 ),
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp( 1 )
  },
  plusIcon: {
    height: wp( 12 ),
    width: wp( 10 )
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp( 4 ),
    marginVertical: hp( 0.5 ),
    backgroundColor: Colors.backgroundColor1,
    borderRadius: wp( 2 ),
    padding: wp( 3 )
  },
  secondNamePieceText: {
    fontWeight: 'bold',
    fontSize: RFValue( 13 )
  },
  avatarImage: {
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 ) / 2,
    marginHorizontal: wp( 1 )
  },
} )

