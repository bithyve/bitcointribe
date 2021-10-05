import React, { useState, useMemo, useContext, useCallback, useEffect } from 'react'
import { StyleSheet, View, Text, SafeAreaView, Image, TouchableOpacity, Platform, ScrollView, StatusBar } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import useActiveAccountShells from '../../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import AccountShell from '../../../common/data/models/AccountShell'
import { accountShellsOrderUpdated, resetAccountUpdateFlag, updateAccountSettings } from '../../../store/actions/accounts'
import ReorderAccountShellsDraggableList from '../../../components/more-options/account-management/ReorderAccountShellsDraggableList'
import ButtonBlue from '../../../components/ButtonBlue'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import BottomSheet, { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import UnHideArchiveAccountBottomSheet from '../../../components/bottom-sheets/account-management/UnHideArchiveAccountBottomSheet'
import UnHideRestoreAccountSuccessBottomSheet from '../../../components/bottom-sheets/account-management/UnHideRestoreAccountSuccessBottomSheet'
import ModalContainer from '../../../components/home/ModalContainer'
import { resetStackToAccountDetails, resetToHomeAction } from '../../../navigation/actions/NavigationActions'
import { NavigationActions, StackActions } from 'react-navigation'
import { color } from 'react-native-reanimated'
import CommonStyles from '../../../common/Styles/Styles'
import HeaderTitle from '../../../components/HeaderTitle'
import NavHeaderSettingsButton from '../../../components/navigation/NavHeaderSettingsButton'
import { translations } from '../../../common/content/LocContext'

export type Props = {
  navigation: any;
};

const AccountManagementContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const strings = translations[ 'accManagement' ]
  const originalAccountShells = useActiveAccountShells()
  const hasAccountSettingsUpdateSucceeded = useSelector( ( state ) => state.accounts.hasAccountSettingsUpdateSucceeded )
  // const [ tempValue, setTempValue ] = useState( false )
  const showAllAccount = useSelector( ( state ) => state.accounts.showAllAccount )
  const [ orderedAccountShells, setOrderedAccountShells ] = useState( originalAccountShells )
  const [ hiddenAccountShells, setHiddenAccountShells ] = useState( [] )
  const [ archivedAccountShells, setArchivedAccountShells ] = useState( [] )
  const [ accountVisibility, setAccountVisibility ] = useState( null )
  const [ hasChangedOrder, setHasChangedOrder ] = useState( false )
  const [ selectedAccount, setSelectedAccount ] = useState( null )
  const [ unHideArchiveModal, showUnHideArchiveModal ] = useState( false )
  const [ successModel, showSuccessModel ] = useState( false )

  const [ primarySubAccount, showPrimarySubAccount ] = useState( {
  } )

  const getnewDraggableOrderedAccountShell = useMemo( () => {
    const newDraggableOrderedAccountShell = []
    if( originalAccountShells ){
      originalAccountShells.map( ( value, index ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.DEFAULT ){
          newDraggableOrderedAccountShell.push( value )
        }
      } )
      setOrderedAccountShells( newDraggableOrderedAccountShell )
    }
    return newDraggableOrderedAccountShell
  }, [ originalAccountShells ] )

  const getnewOrderedAccountShell = useMemo( () => {
    if( showAllAccount === true ){
      const newOrderedAccountShell = []
      originalAccountShells.map( ( value, index ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.DEFAULT ){
          newOrderedAccountShell.push( value )
        }
      } )
      setOrderedAccountShells( newOrderedAccountShell )
      return newOrderedAccountShell
    }
  }, [ showAllAccount, originalAccountShells ] )

  const getHiddenAccountShell = useMemo( () => {
    const newHiddenAccountShell = []
    if( showAllAccount === true ){
      originalAccountShells.map( ( value, index ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.HIDDEN ){
          newHiddenAccountShell.push( value )
        }
      } )
      setHiddenAccountShells( newHiddenAccountShell )
      return newHiddenAccountShell
    }
  }, [ showAllAccount, originalAccountShells ] )

  const getArchivedAccountShells = useMemo( () => {
    if( showAllAccount === true ){
      const newArchivedAccountShells = []
      originalAccountShells.map( ( value, index ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.ARCHIVED ){
          newArchivedAccountShells.push( value )
        }
      } )
      setArchivedAccountShells( newArchivedAccountShells )
      return newArchivedAccountShells
    }
  }, [ showAllAccount, originalAccountShells ] )

  const canSaveOrder = useMemo( () => {
    return hasChangedOrder
  }, [ hasChangedOrder ] )

  useEffect( () => {
    if( hasAccountSettingsUpdateSucceeded && selectedAccount ){
      dispatch( resetAccountUpdateFlag() )
      setTimeout( () => {
        showSuccessModel( true )
      }, 100 )

    }
  }, [ hasAccountSettingsUpdateSucceeded, selectedAccount ] )

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  useEffect( () => {
    return () => {
      showUnHideArchiveModal( false )
    }
  }, [ navigation ] )

  const showUnHideArchiveAccountBottomSheet = useCallback( () => {

    return(
      <UnHideArchiveAccountBottomSheet
        onProceed={( accounShell )=>{
          if( primarySubAccount && ( primarySubAccount.visibility == AccountVisibility.ARCHIVED || primarySubAccount.visibility == AccountVisibility.HIDDEN ) )
            setAccountVisibility( primarySubAccount.visibility )
          changeVisisbility( accounShell, AccountVisibility.DEFAULT )

          showUnHideArchiveModal( false )
        }
        }
        onBack={() =>{
          showUnHideArchiveModal( false )
        }
        }
        accountInfo={primarySubAccount}
      />
    )
  }, [ primarySubAccount ] )

  const showSuccessAccountBottomSheet = useCallback( ( ) => {
    return(
      <UnHideRestoreAccountSuccessBottomSheet
        onProceed={( accounShell )=>{
          const resetAction = StackActions.reset( {
            index: 0,
            actions: [
              NavigationActions.navigate( {
                routeName: 'Landing'
              } )
            ],
          } )

          navigation.dispatch( resetAction )
          navigation.navigate( 'AccountDetails', {
            accountShellID: primarySubAccount.accountShellID,
          } )
        }
        }
        onClose={() => showSuccessModel( false )}
        accountInfo={primarySubAccount}
        accountVisibility={accountVisibility}
      />
    )
  }, [ accountVisibility, primarySubAccount ] )

  const changeVisisbility = ( accountShell, visibility ) => {

    // selectedAccount.visibility = visibility
    // dispatch( updateSubAccountSettings( selectedAccount ) )

    const settings = {
      visibility: visibility
    }
    dispatch( updateAccountSettings( {
      accountShell, settings
    } ) )
  }

  function hasNewOrder( newlyOrderedAccountShells: AccountShell[] ) {
    return orderedAccountShells.some( ( accountShell, index ) => {
      return accountShell.id !== newlyOrderedAccountShells[ index ].id
    } )
  }

  function handleDragEnd( newlyOrderedAccountShells: AccountShell[] ) {
    if ( hasNewOrder( newlyOrderedAccountShells ) ) {
      setHasChangedOrder( true )
      setOrderedAccountShells( newlyOrderedAccountShells )
    } else {
      setHasChangedOrder( false )
    }
  }

  function handleProceedButtonPress() {
    dispatch( accountShellsOrderUpdated( orderedAccountShells ) )
    setHasChangedOrder( false )
  }

  function renderItem( accountShell ){
    const primarySubAccount = accountShell.primarySubAccount
    return (
      <ListItem
        activeOpacity={1}
        containerStyle={{
          marginLeft: wp( '4%' ),
          marginRight: wp( '4%' ),
          backgroundColor: Colors.backgroundColor
        }}
      >
        <Image
          source={getAvatarForSubAccount( primarySubAccount, false, true )}
          style={ImageStyles.thumbnailImageLarge}
          resizeMode="contain"
        />

        <ListItem.Content>
          <ListItem.Title
            style={[ ListStyles.listItemTitle, {
              fontSize: RFValue( 12 )
            } ]}
            numberOfLines={1}
          >
            {primarySubAccount.customDisplayName || primarySubAccount.defaultTitle}
          </ListItem.Title>

          <ListItem.Subtitle
            style={[ ListStyles.listItemSubtitle, {
              fontSize: RFValue( 10 )
            } ]}
            numberOfLines={2}
          >
            {primarySubAccount.customDescription || primarySubAccount.defaultDescription}
          </ListItem.Subtitle>

        </ListItem.Content>
        {primarySubAccount.visibility === AccountVisibility.HIDDEN || primarySubAccount.visibility === AccountVisibility.ARCHIVED ? <TouchableOpacity
          style={{
            backgroundColor: Colors.lightBlue,
            marginLeft: 'auto',
            borderRadius: 7,
            justifyContent: 'center',
            alignItems: 'center',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 5,
            paddingBottom: 5,
            borderColor: Colors.borderColor,
            borderWidth: 1,
          }}
          onPress={() => {
            setTimeout( () => {
              setSelectedAccount( primarySubAccount )
            }, 2 )
            if( primarySubAccount.visibility === AccountVisibility.HIDDEN || primarySubAccount.visibility === AccountVisibility.ARCHIVED ){
              showPrimarySubAccount( primarySubAccount )
              showUnHideArchiveModal( true )
            }
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: RFValue( 12 ),
              marginLeft: 'auto',
              fontWeight: '700'
            }}
          >
            {primarySubAccount.visibility === AccountVisibility.HIDDEN ? strings.Unhide :strings.Restore}
          </Text>
        </TouchableOpacity> : null}
      </ListItem>
    )
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <ModalContainer visible={unHideArchiveModal} closeBottomSheet={() => { showUnHideArchiveModal( false ) }} >
        {showUnHideArchiveAccountBottomSheet()}
      </ModalContainer>
      <ModalContainer visible={successModel} closeBottomSheet={() => {}} >
        {showSuccessAccountBottomSheet()}
      </ModalContainer>
      <ScrollView>
        <View style={[ CommonStyles.headerContainer, {
          backgroundColor: Colors.backgroundColor
        } ]}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              navigation.pop()
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
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: Colors.backgroundColor,
          marginRight: wp( '3%' ),
          alignItems: 'flex-start'
        }}>
          <HeaderTitle
            firstLineTitle={strings[ 'AccountManagement' ]}
            secondLineTitle={strings.Rearrange}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
          <NavHeaderSettingsButton
            onPress={() => { navigation.navigate( 'PanAccountSettings' ) }}
            accManagement={true}
          />
        </View>

        {getnewDraggableOrderedAccountShell && !showAllAccount && <ReorderAccountShellsDraggableList
          accountShells={orderedAccountShells}
          onDragEnded={handleDragEnd}
        />}

        {getnewOrderedAccountShell && <View>
          <View style={{
            marginBottom: 15, backgroundColor: Colors.backgroundColor
          }}>
            <View style={{
              height: 'auto'
            }}>
              {orderedAccountShells.map( ( accountShell: AccountShell ) => {
                return renderItem( accountShell )
              } )
              }
              {/* <FlatList
              style={{
              }}
              contentContainerStyle={{
                paddingHorizontal: 14
              }}
              extraData={orderedAccountShells}
              data={orderedAccountShells}
              keyExtractor={listItemKeyExtractor}
              renderItem={renderItem}
            /> */}
            </View>
          </View>
        </View>}

        {getHiddenAccountShell && hiddenAccountShells.length > 0 ? <View style={{
          marginTop: wp( '2%' ), backgroundColor: Colors.backgroundColor
        }}>
          <View style={{
            width: '100%',
            backgroundColor: Colors.white
          }}>
            <Text style={styles.pageInfoText}>
              {strings.HiddenAccounts}
            </Text>
          </View>
          <View style={{
            marginBottom: 15
          }}>
            <View style={{
              height: 'auto'
            }}>
              {hiddenAccountShells.map( ( accountShell: AccountShell ) => {
                return renderItem( accountShell )
              } )
              }
            </View>
          </View>
        </View> : null}

        {getArchivedAccountShells && archivedAccountShells.length > 0 ? <View style={{
          marginTop: wp( '2%' ),
        }}>
          <Text style={styles.pageInfoText}>
            {strings.ArchivedAccounts}
          </Text>
          <View style={{
            marginBottom: 15
          }}>
            <View style={{
              height: 'auto'
            }}>
              {archivedAccountShells.map( ( accountShell: AccountShell ) => {
                return renderItem( accountShell )
              } )
              }
            </View>
          </View>
        </View> : null}
      </ScrollView>

      <View style={styles.proceedButtonContainer}>
        {canSaveOrder && (
          <ButtonBlue
            buttonText={strings.Save}
            handleButtonPress={handleProceedButtonPress}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor
  },

  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  pageInfoText: {
    paddingLeft: 30,
    color: Colors.lightTextColor,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    fontWeight: '600',
    marginTop: 3,
    backgroundColor: Colors.white,
    paddingVertical: hp( 0.5 ),
    letterSpacing: 0.55
  },
} )


export default AccountManagementContainerScreen
