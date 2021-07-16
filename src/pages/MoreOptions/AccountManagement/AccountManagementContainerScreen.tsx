import React, { useState, useMemo, createRef, useCallback, useEffect } from 'react'
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Platform, ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import useActiveAccountShells from '../../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import AccountShell from '../../../common/data/models/AccountShell'
import { accountShellsOrderUpdated, resetAccountUpdateFlag, updateSubAccountSettings } from '../../../store/actions/accounts'
import ReorderAccountShellsDraggableList from '../../../components/more-options/account-management/ReorderAccountShellsDraggableList'
import ButtonBlue from '../../../components/ButtonBlue'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
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


export type Props = {
  navigation: any;
};

const AccountManagementContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const originalAccountShells = useActiveAccountShells()
  const hasAccountSettingsUpdateSucceeded = useSelector( ( state ) => state.accounts.hasAccountSettingsUpdateSucceeded )
  const showAllAccount = useSelector( ( state ) => state.accounts.showAllAccount )
  const [ orderedAccountShells, setOrderedAccountShells ] = useState( originalAccountShells )
  const [ hiddenAccountShells, setHiddenAccountShells ] = useState( [] )
  const [ archivedAccountShells, setArchivedAccountShells ] = useState( [] )
  const [ accountVisibility, setAccountVisibility ] = useState( null )
  const [ hasChangedOrder, setHasChangedOrder ] = useState( false )
  const [ selectedAccount, setSelectedAccount ] = useState( null )
  const [ unHideArchiveModal, showUnHideArchiveModal ] = useState( false )
  const [ restorerchiveModal, showRestoreArchiveModal ] = useState( false )

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
    if( hasAccountSettingsUpdateSucceeded === true && selectedAccount ){
      dispatch( resetAccountUpdateFlag() )
      showSuccessAccountBottomSheet( selectedAccount )
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
        onProceed={()=>{
          if( primarySubAccount && ( primarySubAccount.visibility == AccountVisibility.ARCHIVED || primarySubAccount.visibility == AccountVisibility.HIDDEN ) )
            setAccountVisibility( primarySubAccount.visibility )
          changeVisisbility( primarySubAccount, AccountVisibility.DEFAULT )
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

  const showSuccessAccountBottomSheet = useCallback( ( primarySubAccount ) => {
    return(
      <UnHideRestoreAccountSuccessBottomSheet
        onProceed={()=>{
          dismissBottomSheet()}
        }
        accountInfo={primarySubAccount}
        accountVisibility={accountVisibility}
      />
    )
  }, [ accountVisibility ] )

  const changeVisisbility = ( selectedAccount, visibility ) => {
    selectedAccount.visibility = visibility
    dispatch( updateSubAccountSettings( selectedAccount ) )
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
        }}
        bottomDivider
      >
        <Image
          source={getAvatarForSubAccount( primarySubAccount )}
          style={ImageStyles.thumbnailImageMedium}
          resizeMode="contain"
        />

        <ListItem.Content>
          <ListItem.Title
            style={ListStyles.listItemTitle}
            numberOfLines={1}
          >
            {primarySubAccount.customDisplayName || primarySubAccount.defaultTitle}
          </ListItem.Title>

          <ListItem.Subtitle
            style={ListStyles.listItemSubtitle}
            numberOfLines={2}
          >
            {primarySubAccount.customDescription || primarySubAccount.defaultDescription}
          </ListItem.Subtitle>

        </ListItem.Content>
        {primarySubAccount.visibility === AccountVisibility.HIDDEN || primarySubAccount.visibility === AccountVisibility.ARCHIVED ? <TouchableOpacity
          style={{
            backgroundColor: Colors.backgroundColor,
            marginLeft: 'auto',
            borderRadius: 5,
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
              color: Colors.textColorGrey,
              fontSize: RFValue( 12 ),
              marginLeft: 'auto',
            }}
          >
            {primarySubAccount.visibility === AccountVisibility.HIDDEN ? 'Unhide' : 'Restore'}
          </Text>
        </TouchableOpacity> : null}
      </ListItem>
    )
  }

  return (
    <View style={styles.rootContainer}>
      <ModalContainer visible={unHideArchiveModal} closeBottomSheet={() => { showUnHideArchiveModal( false ) }} >
        {showUnHideArchiveAccountBottomSheet()}
      </ModalContainer>
      <ScrollView>
        {getnewDraggableOrderedAccountShell && !showAllAccount && <ReorderAccountShellsDraggableList
          accountShells={orderedAccountShells}
          onDragEnded={handleDragEnd}
        />}

        {getnewOrderedAccountShell && <View>
          <View style={{
            marginBottom: 15
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
          marginTop: wp( '2%' ),
        }}>
          <View style={{
            width: '100%',
            backgroundColor: Colors.white
          }}>
            <Text style={styles.pageInfoText}>
              Hidden Accounts
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
              Archived Accounts
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
            buttonText="Save New Ordering"
            handleButtonPress={handleProceedButtonPress}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 3,
  },
} )


export default AccountManagementContainerScreen
