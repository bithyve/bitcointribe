import React, { useState, useMemo, useCallback, useEffect, useDebugValue } from 'react'
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Button } from 'react-native'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import AccountShell from '../../../common/data/models/AccountShell'
import { Account, AccountType, MultiSigAccount, Wallet } from '../../../bitcoin/utilities/Interface'
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
import {  useBottomSheetModal } from '@gorhom/bottom-sheet'
import UnHideArchiveAccountBottomSheet from '../../../components/bottom-sheets/account-management/UnHideArchiveAccountBottomSheet'
import UnHideRestoreAccountSuccessBottomSheet from '../../../components/bottom-sheets/account-management/UnHideRestoreAccountSuccessBottomSheet'
import ModalContainer from '../../../components/home/ModalContainerScroll'
import { NavigationActions, StackActions } from 'react-navigation'
import CommonStyles from '../../../common/Styles/Styles'
import HeaderTitle from '../../../components/HeaderTitle'
import NavHeaderSettingsButton from '../../../components/navigation/NavHeaderSettingsButton'
import { translations } from '../../../common/content/LocContext'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import { recreateAccounts, syncMissingAccounts, updateSynchedMissingAccount } from '../../../store/actions/upgrades'
import { sweepMissingAccounts } from '../../../store/actions/upgrades'
import { TextInput } from 'react-native-paper'

export type Props = {
  navigation: any;
};

const AccountManagementContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const strings = translations[ 'accManagement' ]
  const hasAccountSettingsUpdateSucceeded = useSelector( ( state: RootStateOrAny ) => state.accounts.hasAccountSettingsUpdateSucceeded )
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const accountShells = useSelector( ( state: RootStateOrAny ) => state.accounts.accountShells )
  const accounts = useSelector( ( state: RootStateOrAny ) => state.accounts.accounts )

  // const [ tempValue, setTempValue ] = useState( false )
  const showAllAccount = useSelector( ( state: RootStateOrAny ) => state.accounts.showAllAccount )
  const [ orderedAccountShells, setOrderedAccountShells ] = useState( accountShells )
  const [ hiddenAccountShells, setHiddenAccountShells ] = useState( [] )
  const [ archivedAccountShells, setArchivedAccountShells ] = useState( [] )
  const [ accountVisibility, setAccountVisibility ] = useState( null )
  const [ hasChangedOrder, setHasChangedOrder ] = useState( false )
  const [ selectedAccount, setSelectedAccount ] = useState( null )
  const [ unHideArchiveModal, showUnHideArchiveModal ] = useState( false )
  const [ successModel, showSuccessModel ] = useState( false )
  const [ numberOfTabs, setNumberOfTabs ] = useState( 0 )
  const [ debugModalVisible, setDebugModalVisible ] = useState( false )

  const synchedDebugMissingAccounts = useSelector( ( state: RootStateOrAny ) => state.upgrades.synchedMissingAccounts )

  const [ primarySubAccount, showPrimarySubAccount ] = useState( {
  } )

  const getnewDraggableOrderedAccountShell = useMemo( () => {
    const newDraggableOrderedAccountShell = []
    if( accountShells ){
      accountShells.map( ( value ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.DEFAULT ){
          newDraggableOrderedAccountShell.push( value )
        }
      } )
      setOrderedAccountShells( newDraggableOrderedAccountShell )
    }
    return newDraggableOrderedAccountShell
  }, [ accountShells ] )

  const getnewOrderedAccountShell = useMemo( () => {
    if( showAllAccount === true ){
      const newOrderedAccountShell = []
      accountShells.map( ( value ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.DEFAULT ){
          newOrderedAccountShell.push( value )
        }
      } )
      setOrderedAccountShells( newOrderedAccountShell )
      return newOrderedAccountShell
    }
  }, [ showAllAccount, accountShells ] )

  const getHiddenAccountShell = useMemo( () => {
    const newHiddenAccountShell = []
    if( showAllAccount === true ){
      accountShells.map( ( value ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.HIDDEN ){
          newHiddenAccountShell.push( value )
        }
      } )
      setHiddenAccountShells( newHiddenAccountShell )
      return newHiddenAccountShell
    }
  }, [ showAllAccount, accountShells ] )

  const getArchivedAccountShells = useMemo( () => {
    if( showAllAccount === true ){
      const newArchivedAccountShells = []
      accountShells.map( ( value ) =>{
        if( value.primarySubAccount.visibility === AccountVisibility.ARCHIVED ){
          newArchivedAccountShells.push( value )
        }
      } )
      setArchivedAccountShells( newArchivedAccountShells )
      return newArchivedAccountShells
    }
  }, [ showAllAccount, accountShells ] )

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
  useEffect( () => {
    if( numberOfTabs!=0 ){
      setTimeout( () => {
        setNumberOfTabs( 0 )
      }, 1000 )
    }
    if( numberOfTabs >= 3 ){
      // clear previous session on mount
      dispatch( updateSynchedMissingAccount( {
      } ) )
      setDebugModalVisible( true )
    }
  }, [ numberOfTabs ] )

  useEffect( () => {
    return () => {
      showUnHideArchiveModal( false )
    }
  }, [ navigation ] )

  const showUnHideArchiveAccountBottomSheet = useCallback( () => {
    return(
      <UnHideArchiveAccountBottomSheet
        onProceed={( accounShell )=>{
          if( primarySubAccount && ( ( primarySubAccount as SubAccountDescribing ).visibility == AccountVisibility.ARCHIVED || ( primarySubAccount as SubAccountDescribing ).visibility == AccountVisibility.HIDDEN ) )
            setAccountVisibility( ( primarySubAccount as SubAccountDescribing ).visibility )
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
          if( ( primarySubAccount as SubAccountDescribing ).type === AccountType.LIGHTNING_ACCOUNT ) {
            navigation.navigate( 'LNAccountDetails', {
              accountShellID: ( primarySubAccount as SubAccountDescribing ).accountShellID,
              node: ( primarySubAccount as SubAccountDescribing ).node
            } )
          } else {
            navigation.navigate( 'AccountDetails', {
              accountShellID: ( primarySubAccount as SubAccountDescribing ).accountShellID,
            } )
          }

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
        onPress={()=>setNumberOfTabs( prev => prev+1 )}
        containerStyle={{
          marginLeft: wp( '4%' ),
          marginRight: wp( '4%' ),
          backgroundColor: Colors.backgroundColor
        }}
      >
        {getAvatarForSubAccount( primarySubAccount, false, true )}

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
  const closeBottomSheet = () => {
    setDebugModalVisible( false )
  }

  const getWalletDebugData = ( wallet: Wallet ) => {
    delete wallet.security
    // delete wallet.primaryMnemonic
    // delete wallet.primarySeed
    // delete wallet.secondaryXpub
    // delete wallet.details2FA
    delete wallet.smShare

    return <View style={styles.lineItem}>
      <Text style={ListStyles.listItemTitleTransaction}>
          Wallet Info
      </Text>

      {Object.keys( wallet ).map( key => {
        return (
          <>
            <Text  style={{
              ...ListStyles.listItemSubtitle,
              marginBottom: 3,
              fontWeight: 'bold',
            }} >{key.toUpperCase()}</Text>
            <Text  style={{
              ...ListStyles.listItemSubtitle,
              marginBottom: 3,
            }} selectable={true}>{JSON.stringify( wallet[ key ], null, 8 )}</Text>
          </>
        )
      } )}


    </View>
  }

  const getAccountDebugData = ( shell: AccountShell, index: number ) => {
    const primarySubAcc = shell.primarySubAccount
    const account: Account = accounts[ primarySubAcc.id ]

    const debugPrimarySub: SubAccountDescribing = {
      ...primarySubAcc,
    }
    // drop unnecessary properties
    delete debugPrimarySub.transactions
    delete debugPrimarySub.utxoCompatibilityGroup
    delete debugPrimarySub.hasNewTxn

    const debugAccount: Account = {
      ...account,
    }
    // drop unnecessary and private properties
    delete debugAccount.transactions
    delete debugAccount.xpriv
    delete ( debugAccount as MultiSigAccount ).xprivs
    delete debugAccount.txIdMap
    delete debugAccount.hasNewTxn
    delete debugAccount.transactionsNote
    delete debugAccount.activeAddresses

    return (
      <View style={styles.lineItem}>
        <Text style={ListStyles.listItemTitleTransaction}>
          Account Shell {index + 1}
        </Text>
        <Text style={{
          fontSize: 10
        }}>{debugPrimarySub.id}</Text>
        <Text  style={{
          ...ListStyles.listItemSubtitle,
          marginBottom: 3,
        }}>{JSON.stringify( debugPrimarySub, null, 8 )}</Text>
        <Text style={ListStyles.listItemTitleTransaction}>
          Account
        </Text>
        <Text style={{
          fontSize: 10
        }}>{debugAccount.id}</Text>
        <Text  style={{
          ...ListStyles.listItemSubtitle,
          marginBottom: 3,
        }}>{JSON.stringify( debugAccount, null, 8 )}</Text>
      </View>
    )
  }

  const RenderDebugModal = () => {
    const [ debugModalTaps, setDebugModalTaps ] = useState( 0 )
    const [ debugSweepAddress, setDebugSweepAddress ] = useState( '' )
    const [ debugSweepToken, setDebugSweepToken ] = useState( '' )

    return (
      <View style={styles.modalContainer}>
        <View style={styles.crossIconContainer}>
          <FontAwesome name="close" color={Colors.blue} size={24} onPress = {closeBottomSheet}/>
        </View>
        <ScrollView>
          <TouchableOpacity style={styles.rootContainer} activeOpacity={1} onPress={()=>setDebugModalTaps( prev => prev+1 )}>
            {getWalletDebugData( {
              ...wallet
            } )}
            {accountShells.map( ( shell: AccountShell, index ) => {
              return getAccountDebugData( shell, index )
            } )}
          </TouchableOpacity>

          { debugModalTaps > 4?
            (
              <>
                {Object.keys( synchedDebugMissingAccounts ).length? (
                  <>
                    <TextInput
                      style={{
                        height: 50,
                        // margin: 20,
                        paddingHorizontal: 15,
                        fontSize: RFValue( 13 ),
                        letterSpacing: 0.26,
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                      placeholder={'Enter Address'}
                      placeholderTextColor={Colors.borderColor}
                      value={debugSweepAddress}
                      textContentType='none'
                      autoCompleteType='off'
                      autoCorrect={false}
                      autoCapitalize="none"
                      onChangeText={( text ) => {
                        setDebugSweepAddress( text )
                      }}
                    />

                    <TextInput
                      style={{
                        height: 50,
                        // margin: 20,
                        paddingHorizontal: 15,
                        fontSize: RFValue( 13 ),
                        letterSpacing: 0.26,
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                      placeholder={'Enter Token'}
                      placeholderTextColor={Colors.borderColor}
                      value={debugSweepToken}
                      textContentType='none'
                      autoCompleteType='off'
                      autoCorrect={false}
                      autoCapitalize="none"
                      onChangeText={( text ) => {
                        setDebugSweepToken( text )
                      }}
                    />
                  </>
                ): null}
                <Button title={Object.keys( synchedDebugMissingAccounts ).length? 'Sweep Missing Accounts': 'Sync Missing Accounts'} onPress={()=> {

                  if( Object.keys( synchedDebugMissingAccounts ).length ){
                    // sweep already synched accounts
                    setDebugModalVisible( false )
                    if( debugSweepAddress )
                      dispatch( sweepMissingAccounts( {
                        address: debugSweepAddress,
                        token: parseInt( debugSweepToken )
                      } ) )
                    // dispatch( recreateAccounts() )
                  } else {
                    setDebugModalVisible( false )
                    dispatch( syncMissingAccounts() )
                  }
                }}></Button>
              </>
            ): null}

        </ScrollView>
      </View>
    )
  }

  return (
    <TouchableOpacity style={styles.rootContainer} activeOpacity={1} onPress={()=>setNumberOfTabs( prev => prev+1 )}>
      <SafeAreaView>
        <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
        <ModalContainer onBackground={()=>showUnHideArchiveModal( false )} visible={unHideArchiveModal} closeBottomSheet={() => { showUnHideArchiveModal( false ) }} >
          {showUnHideArchiveAccountBottomSheet()}
        </ModalContainer>
        <ModalContainer onBackground={()=>showSuccessModel( false )} visible={successModel} closeBottomSheet={() => {}} >
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
            setNumberOfTabs = {setNumberOfTabs}
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
        <ModalContainer onBackground={closeBottomSheet} visible={debugModalVisible} closeBottomSheet = {closeBottomSheet}>
          <View style={styles.modalContainer}>
            <RenderDebugModal/>
          </View>
        </ModalContainer>
      </SafeAreaView>
    </TouchableOpacity>
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
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.FiraSansRegular,
  },
  bodySection: {
    marginTop: 24,
    paddingHorizontal: 10,
  },
  lineItem: {
    marginVertical: hp( 0.9 ),
    backgroundColor:Colors.white,
    padding: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 3,
    },
    shadowOpacity: 0.10,
    shadowRadius: 1.84,
    elevation: 2,
  },
  containerRec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossIconContainer:{
    justifyContent:'flex-end',
    flexDirection:'row',
    marginBottom:hp( 2 ),
  },
  modalContainer:{
    backgroundColor:Colors.backgroundColor,
    padding:5,
    height:hp( '85%' )
  }
} )


export default AccountManagementContainerScreen
