import BottomSheet from '@gorhom/bottom-sheet'
import idx from 'idx'
import React, { createRef, PureComponent } from 'react'
import {
  StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP, heightPercentageToDP as hp, widthPercentageToDP, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import {
  AccountType,
  Wallet
} from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import BottomSheetRampInfo from '../../components/bottom-sheets/ramp/BottomSheetRampInfo'
import BottomSheetSwanInfo from '../../components/bottom-sheets/swan/BottomSheetSwanInfo'
import BuyBitcoinHomeBottomSheet, { BuyBitcoinBottomSheetMenuItem, BuyMenuItemKind } from '../../components/home/BuyBitcoinHomeBottomSheet'
import ModalContainer from '../../components/home/ModalContainer'
import NewBuyBitcoinBottomSheet from '../../components/home/NewBuyBitcoinBottomSheet'
import { clearRampCache } from '../../store/actions/RampIntegration'
import { clearSwanCache, createTempSwanAccountInfo, updateSwanStatus } from '../../store/actions/SwanIntegration'
import BottomSheetHeader from '../Accounts/BottomSheetHeader'
import Fonts from './../../common/Fonts'
export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800
export enum BottomSheetState {
    Closed,
    Open,
}

export enum BottomSheetKind {
    SWAN_STATUS_INFO,
    WYRE_STATUS_INFO,
    RAMP_STATUS_INFO,
}

interface HomeStateTypes {
    bottomSheetState: BottomSheetState;
    currentBottomSheetKind: BottomSheetKind | null;
    swanDeepLinkContent: string | null;
    wyreDeepLinkContent: string | null;
    rampDeepLinkContent: string | null;
    rampFromBuyMenu: boolean | null;
    rampFromDeepLink: boolean | null;
    wyreFromBuyMenu: boolean | null;
    wyreFromDeepLink: boolean | null;
}

interface HomePropsTypes {
    navigation: any;
    containerView: StyleProp<ViewStyle>;
    wallet: Wallet;
    // clearWyreCache: any;
    clearRampCache: any;
    clearSwanCache: any;
    updateSwanStatus: any;
    createTempSwanAccountInfo: any;
    swanDeepLinkContent: string | null;
    cardDataProps: any;
    wyreDeepLinkContent: string | null;
    rampDeepLinkContent: string | null;
    rampFromBuyMenu: boolean | null;
    rampFromDeepLink: boolean | null;
    wyreFromBuyMenu: boolean | null;
    wyreFromDeepLink: boolean | null;
}
class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
    bottomSheetRef = createRef<BottomSheet>();
    buttons: any
    static whyDidYouRender = true;

    constructor( props ) {
      super( props )
      this.buttons = [
        {
          title: 'All',
          active: true
        },
        {
          title: 'Apple Pay',
          active: false
        },
        {
          title: 'Bank Card',
          active: false
        },
        {
          title: 'Bank Transfer',
          active: false
        },
        {
          title: 'More',
          active: false
        }
      ]
      this.state = {
        bottomSheetState: BottomSheetState.Closed,
        currentBottomSheetKind: null,
        swanDeepLinkContent: null,
        wyreDeepLinkContent: null,
        rampDeepLinkContent: null,
        rampFromBuyMenu: null,
        rampFromDeepLink: null,
        wyreFromBuyMenu: null,
        wyreFromDeepLink: null,
      }
    }



    handleBuyBitcoinBottomSheetSelection = ( menuItem: BuyBitcoinBottomSheetMenuItem ) => {
      switch ( menuItem.kind ) {
          case BuyMenuItemKind.FAST_BITCOINS:
            this.props.navigation.navigate( 'VoucherScanner' )
            this.onBottomSheetClosed()
            break

          case BuyMenuItemKind.SWAN:
            this.props.clearSwanCache()
            if( !this.props.wallet.accounts[ AccountType.SWAN_ACCOUNT ]?.length ){
              this.props.clearSwanCache()
              const accountDetails = {
                name: 'Swan Account',
                description: 'Sats purchased from Swan',
              }
              this.props.createTempSwanAccountInfo( accountDetails )
              this.props.updateSwanStatus( SwanAccountCreationStatus.BUY_MENU_CLICKED )
            }
            else {
              this.props.updateSwanStatus( SwanAccountCreationStatus.ACCOUNT_CREATED )
            }
            this.setState( {
              swanDeepLinkContent: null
            }, () => {
              this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
            } )
            break

          case BuyMenuItemKind.RAMP:
            this.setState( {
              rampDeepLinkContent: null,
              rampFromDeepLink: false,
              rampFromBuyMenu: true
            }, () => {
              this.openBottomSheet( BottomSheetKind.RAMP_STATUS_INFO )
            } )
            break

          case BuyMenuItemKind.WYRE:
            this.setState( {
              wyreDeepLinkContent: null,
              wyreFromDeepLink: false,
              wyreFromBuyMenu: true
            }, () => {
              this.openBottomSheet( BottomSheetKind.WYRE_STATUS_INFO )
            } )
            break
      }
    };

    openBottomSheet = (
      kind: BottomSheetKind,
      snapIndex: number | null = null
    ) => {

      this.setState(
        {
          bottomSheetState: BottomSheetState.Open,
          currentBottomSheetKind: kind,
        },
        () => {
          if ( snapIndex == null ) {
            this.bottomSheetRef.current?.expand()
          } else {
            this.bottomSheetRef.current?.snapTo( snapIndex )
          }
        }
      )
    };

    onBottomSheetClosed() {
      this.setState( {
        bottomSheetState: BottomSheetState.Closed,
        currentBottomSheetKind: null,
      } )
    }

    closeBottomSheet = () => {
      this.bottomSheetRef.current?.close()
      this.onBottomSheetClosed()
    };

    renderBottomSheetContent() {
      switch ( this.state.currentBottomSheetKind ) {

          case BottomSheetKind.SWAN_STATUS_INFO:
            return (
              <>
                <BottomSheetHeader title="" onPress={this.closeBottomSheet} />
                <BottomSheetSwanInfo
                  swanDeepLinkContent={this.state.swanDeepLinkContent}
                  onClickSetting={() => {
                    this.closeBottomSheet()
                  }}
                  onPress={this.closeBottomSheet}
                />
              </>
            )
          case BottomSheetKind.RAMP_STATUS_INFO:
            return (
              <>
                <BottomSheetHeader title="" onPress={this.closeBottomSheet} />
                <BottomSheetRampInfo
                  rampDeepLinkContent={this.state.rampDeepLinkContent}
                  rampFromBuyMenu={this.state.rampFromBuyMenu}
                  rampFromDeepLink={this.state.rampFromDeepLink}
                  onClickSetting={() => {
                    this.closeBottomSheet()
                  }}
                  onPress={this.closeBottomSheet}
                />
              </>
            )

          default:
            break
      }
    }

    render() {
      const { containerView } = this.props

      return (
        <View style={[ containerView, {
          backgroundColor: Colors.white
        } ]}>
          <ScrollView style={{
            flex: 1
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: hp( 3 ),
              paddingHorizontal: wp( 4 ),
              alignItems: 'center'
            }}>
              <Text style={{
                color: Colors.THEAM_TEXT_COLOR,
                fontSize: RFValue( 16 ),
                marginLeft: 2,
                fontFamily: Fonts.Medium,

              }}>
                            Buy
              </Text>
              <TouchableOpacity style={{
                backgroundColor: Colors.lightBlue, borderRadius: wp( '1%' )
              }}>
                <Text style={{
                  margin: hp( 0.5 ), color: Colors.white, fontSize: RFValue( 12 ),
                }}>
              Sort by : Recently Used
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {
                this.buttons.map( ( item, index ) => {
                  return(
                    <TouchableOpacity
                      key={index}
                      style={{
                        backgroundColor: item.active ? Colors.lightBlue : Colors.borderColor,
                        borderRadius: wp( '2%' ),
                        height: 64,
                        width: 72,
                        marginLeft: wp( 4 ),
                        justifyContent: 'center',
                        shadowOpacity: 0.1,
                        shadowOffset: {
                          width: 3, height: 5
                        },
                        shadowRadius: 5,
                        elevation: 2,
                        marginBottom: hp( '2' )
                      }}>
                      <Text style={{
                        margin: hp( 0.5 ), color: item.active ? Colors.white : Colors.gray2, alignSelf: 'center',
                        fontFamily: Fonts.Medium,
                        textAlign: 'center'
                      }}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  )
                } )
              }
            </ScrollView>


            <Text style={{
              marginHorizontal: wp( '4' ),
              color: Colors.gray2,
              fontSize: RFValue( 11 ),
            }}>
                        Already have an account with
            </Text>
            <BuyBitcoinHomeBottomSheet
              onMenuItemSelected={this.handleBuyBitcoinBottomSheetSelection}
              // onPress={this.closeBottomSheet}
            />
            <Text style={{
              marginHorizontal: wp( '4' ),
              marginVertical: hp( '1' ),
              color: Colors.gray2,
              fontSize: RFValue( 11 ),
            }}>
              New Services
            </Text>
            <NewBuyBitcoinBottomSheet
              onMenuItemSelected={() => {}}
              // onPress={this.closeBottomSheet}
            />
            {/* </View> */}
            {this.state.currentBottomSheetKind != null && (
              <ModalContainer onBackground={()=>this.setState( {
                currentBottomSheetKind: null
              } )} visible={this.state.currentBottomSheetKind != null} closeBottomSheet={this.closeBottomSheet} >

                {/* <View style={styles.containerStyle}> */}
                {this.renderBottomSheetContent()}
                {/* </View> */}
              </ModalContainer>
            )}
          </ScrollView>
        </View>
      )
    }
}

const mapStateToProps = ( state ) => {
  return {
    wallet: idx( state, ( _ ) => _.storage.wallet ),
    cardDataProps: idx( state, ( _ ) => _.preferences.cardData ),
  }
}

export default (
  connect( mapStateToProps, {
    // clearWyreCache,
    clearRampCache,
    clearSwanCache,
    updateSwanStatus,
    createTempSwanAccountInfo,
  } )( Home )
)

const styles = StyleSheet.create( {
  cardContainer: {
    backgroundColor: Colors.white,
    width: widthPercentageToDP( '95%' ),
    height: hp( 9 ),
    borderRadius: widthPercentageToDP( 3 ),
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthPercentageToDP( 5 ),
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: widthPercentageToDP( 2 )
  },

  floatingActionButtonContainer: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: heightPercentageToDP( 1.5 ),
  },

  cloudErrorModalImage: {
    width: wp( '30%' ),
    height: wp( '25%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginBottom: hp( '-3%' ),
  }
} )
