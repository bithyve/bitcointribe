import { CommonActions } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import { AccountType, Wallet } from '../../../bitcoin/utilities/Interface'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import AccountShell from '../../../common/data/models/AccountShell'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import CommonStyles from '../../../common/Styles/Styles'
import UnHideArchiveAccountBottomSheet from '../../../components/bottom-sheets/account-management/UnHideArchiveAccountBottomSheet'
import UnHideRestoreAccountSuccessBottomSheet from '../../../components/bottom-sheets/account-management/UnHideRestoreAccountSuccessBottomSheet'
import ButtonBlue from '../../../components/ButtonBlue'
import HeaderTitle from '../../../components/HeaderTitle'
import ModalContainer from '../../../components/home/ModalContainerScroll'
import ReorderAccountShellsDraggableList from '../../../components/more-options/account-management/ReorderAccountShellsDraggableList'
import NavHeaderSettingsButton from '../../../components/navigation/NavHeaderSettingsButton'
import { accountShellsOrderUpdated, resetAccountUpdateFlag, updateAccountSettings } from '../../../store/actions/accounts'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'

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
  // const [ debugModalVisible, setDebugModalVisible ] = useState( false )

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
    orderedAccountShells.map( ( item, index )=>{
      if ( item.primarySubAccount.customDisplayName == 'Savings Account' ) {
        orderedAccountShells.pop( index )
      }
    } )
    setOrderedAccountShells( orderedAccountShells )
  }, [] )
  useEffect( () => {
    if( hasAccountSettingsUpdateSucceeded && selectedAccount ){
      dispatch( resetAccountUpdateFlag() )
      setTimeout( () => {
        showSuccessModel( true )
      }, 100 )

    }
  }, [ hasAccountSettingsUpdateSucceeded, selectedAccount ] )
  // useEffect( () => {
  //   if( numberOfTabs!=0 ){
  //     setTimeout( () => {
  //       setNumberOfTabs( 0 )
  //     }, 1000 )
  //   }
  //   if( numberOfTabs >= 3 ){
  //     // clear previous session on mount
  //     dispatch( updateSynchedMissingAccount( {
  //     } ) )
  //     setDebugModalVisible( true )
  //   }
  // }, [ numberOfTabs ] )



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
          showSuccessModel( false )
         if(Platform.OS!=='android'){
          setTimeout(()=>{
            if( ( primarySubAccount as SubAccountDescribing ).type === AccountType.LIGHTNING_ACCOUNT ) {
              const resetAction = CommonActions.reset( {
                index: 1,
                routes: [
                  {
                    name: 'Home'
                  },
                  {
                    name: 'LNAccountDetails', params: {
                      accountShellID: ( primarySubAccount as SubAccountDescribing ).accountShellID,
                      node: ( primarySubAccount as SubAccountDescribing ).node
                    }
                  },
                ],
              } )
              navigation.dispatch( resetAction )
            } else {
              const resetAction = CommonActions.reset( {
                index: 1,
                routes: [
                  {
                    name: 'Home'
                  },
                  {
                    name: 'AccountDetailsRoot', params: {
                      accountShellID: ( primarySubAccount as SubAccountDescribing ).accountShellID,
                    }
                  },
                ],
              } )
              navigation.dispatch( resetAction )
            }
          },1000)
         }else{
          if( ( primarySubAccount as SubAccountDescribing ).type === AccountType.LIGHTNING_ACCOUNT ) {
            const resetAction = CommonActions.reset( {
              index: 1,
              routes: [
                {
                  name: 'Home'
                },
                {
                  name: 'LNAccountDetails', params: {
                    accountShellID: ( primarySubAccount as SubAccountDescribing ).accountShellID,
                    node: ( primarySubAccount as SubAccountDescribing ).node
                  }
                },
              ],
            } )
            navigation.dispatch( resetAction )
          } else {
            const resetAction = CommonActions.reset( {
              index: 1,
              routes: [
                {
                  name: 'Home'
                },
                {
                  name: 'AccountDetailsRoot', params: {
                    accountShellID: ( primarySubAccount as SubAccountDescribing ).accountShellID,
                  }
                },
              ],
            } )
            navigation.dispatch( resetAction )
          }
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

  function renderItem( accountShell, index ){
    const primarySubAccount = accountShell.primarySubAccount
    const isBorderWallet = primarySubAccount.type === AccountType.BORDER_WALLET
    return (
      <ListItem
        key={`${JSON.stringify( accountShell )}_${index}`}
        activeOpacity={1}
        // onPress={()=>setNumberOfTabs( prev => prev+1 )}
        containerStyle={{
          marginHorizontal: wp( '4%' ),
          backgroundColor: Colors.backgroundColor
        }}
      >
        <View style={{
          width: '15%',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getAvatarForSubAccount( primarySubAccount, false, true, true, isBorderWallet )}
        </View>
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
        { ( primarySubAccount.type ) != 'SAVINGS_ACCOUNT' ? primarySubAccount.visibility === AccountVisibility.HIDDEN || primarySubAccount.visibility === AccountVisibility.ARCHIVED ? <TouchableOpacity
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
          <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            locations={[ 0.2, 1 ]}
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
          </LinearGradient>
        </TouchableOpacity> : null : null}
      </ListItem>
    )
  }
  // const closeBottomSheet = () => {
  //   setDebugModalVisible( false )
  // }

  // const getWalletDebugData = ( wallet: Wallet ) => {
  //   delete wallet.security
  //   // delete wallet.primaryMnemonic
  //   // delete wallet.primarySeed
  //   // delete wallet.secondaryXpub
  //   // delete wallet.details2FA
  //   delete wallet.smShare

  //   return <View style={styles.lineItem}>
  //     <Text style={ListStyles.listItemTitleTransaction}>
  //         Wallet Info
  //     </Text>

  //     {Object.keys( wallet ).map( key => {
  //       return (
  //         <>
  //           <Text  style={{
  //             ...ListStyles.listItemSubtitle,
  //             marginBottom: 3,
  //             fontWeight: 'bold',
  //           }} >{key.toUpperCase()}</Text>
  //           <Text  style={{
  //             ...ListStyles.listItemSubtitle,
  //             marginBottom: 3,
  //           }} selectable={true}>{JSON.stringify( wallet[ key ], null, 8 )}</Text>
  //         </>
  //       )
  //     } )}


  //   </View>
  // }

  // const getAccountDebugData = ( shell: AccountShell, index: number ) => {
  //   const primarySubAcc = shell.primarySubAccount
  //   const account: Account = accounts[ primarySubAcc.id ]

  //   const debugPrimarySub: SubAccountDescribing = {
  //     ...primarySubAcc,
  //   }
  //   // drop unnecessary properties
  //   delete debugPrimarySub.transactions
  //   delete debugPrimarySub.utxoCompatibilityGroup
  //   delete debugPrimarySub.hasNewTxn

  //   const debugAccount: Account = {
  //     ...account,
  //   }
  //   // drop unnecessary and private properties
  //   delete debugAccount.transactions
  //   delete debugAccount.xpriv
  //   delete ( debugAccount as MultiSigAccount ).xprivs
  //   delete debugAccount.txIdMap
  //   delete debugAccount.hasNewTxn
  //   delete debugAccount.transactionsNote
  //   delete debugAccount.activeAddresses

  //   return (
  //     <View style={styles.lineItem}>
  //       <Text style={ListStyles.listItemTitleTransaction}>
  //         Account Shell {index + 1}
  //       </Text>
  //       <Text style={{
  //         fontSize: 10
  //       }}>{debugPrimarySub.id}</Text>
  //       <Text  style={{
  //         ...ListStyles.listItemSubtitle,
  //         marginBottom: 3,
  //       }}>{JSON.stringify( debugPrimarySub, null, 8 )}</Text>
  //       <Text style={ListStyles.listItemTitleTransaction}>
  //         Account
  //       </Text>
  //       <Text style={{
  //         fontSize: 10
  //       }}>{debugAccount.id}</Text>
  //       <Text  style={{
  //         ...ListStyles.listItemSubtitle,
  //         marginBottom: 3,
  //       }}>{JSON.stringify( debugAccount, null, 8 )}</Text>
  //     </View>
  //   )
  // }

  // const RenderDebugModal = () => {
  //   const [ debugModalTaps, setDebugModalTaps ] = useState( 0 )
  //   const [ debugSweepAddress, setDebugSweepAddress ] = useState( '' )
  //   const [ debugSweepToken, setDebugSweepToken ] = useState( '' )

  //   return (
  //     <View style={styles.modalContainer}>
  //       <View style={styles.crossIconContainer}>
  //         <FontAwesome name="close" color={Colors.blue} size={24} onPress = {closeBottomSheet}/>
  //       </View>
  //       <ScrollView>
  //         <TouchableOpacity style={styles.rootContainer} activeOpacity={1} onPress={()=>setDebugModalTaps( prev => prev+1 )}>
  //           {getWalletDebugData( {
  //             ...wallet
  //           } )}
  //           {accountShells.map( ( shell: AccountShell, index ) => {
  //             return getAccountDebugData( shell, index )
  //           } )}
  //         </TouchableOpacity>

  //         { debugModalTaps > 4?
  //           (
  //             <>
  //               {Object.keys( synchedDebugMissingAccounts ).length? (
  //                 <>
  //                   <TextInput
  //                     style={{
  //                       height: 50,
  //                       // margin: 20,
  //                       paddingHorizontal: 15,
  //                       fontSize: RFValue( 13 ),
  //                       letterSpacing: 0.26,
  //                       fontFamily: Fonts.Regular,
  //                     }}
  //                     placeholder={'Enter Address'}
  //                     placeholderTextColor={Colors.borderColor}
  //                     value={debugSweepAddress}
  //                     textContentType='none'
  //                     autoCompleteType='off'
  //                     autoCorrect={false}
  //                     autoCapitalize="none"
  //                     onChangeText={( text ) => {
  //                       setDebugSweepAddress( text )
  //                     }}
  //                   />

  //                   <TextInput
  //                     style={{
  //                       height: 50,
  //                       // margin: 20,
  //                       paddingHorizontal: 15,
  //                       fontSize: RFValue( 13 ),
  //                       letterSpacing: 0.26,
  //                       fontFamily: Fonts.Regular,
  //                     }}
  //                     placeholder={'Enter Token'}
  //                     placeholderTextColor={Colors.borderColor}
  //                     value={debugSweepToken}
  //                     textContentType='none'
  //                     autoCompleteType='off'
  //                     autoCorrect={false}
  //                     autoCapitalize="none"
  //                     onChangeText={( text ) => {
  //                       setDebugSweepToken( text )
  //                     }}
  //                   />
  //                 </>
  //               ): null}
  //               <Button title={Object.keys( synchedDebugMissingAccounts ).length? 'Sweep Missing Accounts': 'Sync Missing Accounts'} onPress={()=> {

  //                 if( Object.keys( synchedDebugMissingAccounts ).length ){
  //                   // sweep already synched accounts
  //                   setDebugModalVisible( false )
  //                   if( debugSweepAddress )
  //                     dispatch( sweepMissingAccounts( {
  //                       address: debugSweepAddress,
  //                       token: parseInt( debugSweepToken )
  //                     } ) )
  //                   // dispatch( recreateAccounts() )
  //                 } else {
  //                   setDebugModalVisible( false )
  //                   dispatch( syncMissingAccounts() )
  //                 }
  //               }}></Button>
  //             </>
  //           ): null}

  //       </ScrollView>
  //     </View>
  //   )
  // }

  return (
    //TouchableOpacity style={styles.rootContainer} activeOpacity={1} onPress={()=>setNumberOfTabs( prev => prev+1 )}>
    <TouchableOpacity style={styles.rootContainer} activeOpacity={1}>
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
                  color={Colors.homepageButtonColor}
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
              firstLineTitlse={strings[ 'AccountManagement' ]}
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
                {orderedAccountShells.map( ( accountShell: AccountShell, index: number ) => {
                  return renderItem( accountShell, index )
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
                {hiddenAccountShells.map( ( accountShell: AccountShell, index: number ) => {
                  return renderItem( accountShell, index )
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
                {archivedAccountShells.map( ( accountShell: AccountShell, index: number ) => {
                  return renderItem( accountShell, index )
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
        {/* <ModalContainer onBackground={closeBottomSheet} visible={debugModalVisible} closeBottomSheet = {closeBottomSheet}>
          <View style={styles.modalContainer}>
            <RenderDebugModal/>
          </View>
        </ModalContainer> */}
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
    fontFamily: Fonts.Regular,
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
    fontFamily: Fonts.Regular,
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
