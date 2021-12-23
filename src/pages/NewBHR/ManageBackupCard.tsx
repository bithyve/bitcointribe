import React, { memo, useContext } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import MBKeeperButton from './MBKeeperButton'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { LocalizationContext } from '../../common/content/LocContext'

function ManageBackupCard( props ) {
  const value = props.value
  const selectedId = props.selectedId
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const strings = translations[ 'bhr' ]
  const keeperButtonText = ( buttonText, number ) =>{
    if( !buttonText ) return 'Share Recovery Key ' + number
    else return buttonText
  }

  const textColor = value.status == 'notSetup' ? Colors.textColorGrey : Colors.textColorGrey
  const manageBackupButtonTextColor = value.status == 'notSetup' ? Colors.blue : Colors.blue

  return (
    <TouchableOpacity onPress={() => props.onPressSelectId( )}>
      <View
        style={{
          borderRadius: 10,
          marginTop: wp( '3%' ),
          // backgroundColor:
          //   value.status == 'good' || value.status == 'bad'
          //     ? Colors.blue
          //     : Colors.backgroundColor,
          shadowRadius: selectedId && selectedId == value.id ? 10 : 0,
          shadowColor: Colors.borderColor,
          shadowOpacity: selectedId && selectedId == value.id ? 10 : 0,
          shadowOffset: {
            width: 5,
            height: 5,
          },
          // elevation: selectedId == value.id || selectedId == 0 ? 10 : 0,
          opacity: selectedId == value.id || selectedId == 0 ? 1 : 0.3,
        }}
      >
        <View style={styles.cardView}>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
              alignItems: 'center', justifyContent: 'flex-start'
            }}
          >
            {value.status == 'good' || value.status == 'bad' ? (
              <View
                style={{
                  ...styles.cardHealthImageView,
                  elevation: selectedId == value.id || selectedId == 0 ? 10 : 0,
                  backgroundColor:
                    value.status == 'good' ? Colors.green : Colors.red,
                }}
              >
                {value.status == 'good' ? (
                  <Image
                    source={require( '../../assets/images/icons/check_white.png' )}
                    style={{
                      ...styles.cardHealthImage,
                      width: wp( '4%' ),
                    }}
                  />
                ) : (
                  <Image
                    source={require( '../../assets/images/icons/icon_error_white.png' )}
                    style={styles.cardHealthImage}
                  />
                )}
              </View>
            ) : (
              <Image
                source={require( '../../assets/images/icons/icon_setup.png' )}
                style={{
                  borderRadius: wp( '7%' ) / 2,
                  width: wp( '6%' ),
                  height: wp( '6%' ),
                }}
              />
            )}
            {/* <TouchableOpacity
              onPress={()=>props.onPressKnowMore()}
              style={{
                ...styles.cardButtonView,
                backgroundColor:
                  value.status == 'notSetup' ? Colors.white : Colors.deepBlue,
              }}
            >
              <Text
                style={{
                  ...styles.cardButtonText,
                  color: textColor,
                  width: 'auto',
                }}
              >
                Know More
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
            }}
          > */}
            <View
              style={{
                justifyContent: 'center',
                paddingLeft: wp ( 2 )
              }}
            >
              <Text
                style={{
                  ...styles.levelText,
                  color: textColor,
                }}
              >
                {strings[ value.levelName ]}
              </Text>
              <Text
                style={{
                  ...styles.levelInfoText,
                  color: textColor,
                  width: wp( '55%' ),
                }}
              >
                {strings[ value.info ]}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={10}
              onPress={() => props.onPressSelectId( )}
              style={styles.manageButton}
            >
              <Text
                style={{
                  ...styles.manageButtonText,
                  color: manageBackupButtonTextColor
                }}
                onPress={() => props.onPressSelectId( )}
              >
                {value.status == 'notSetup' ? common.setup : common.manage}
              </Text>
              <AntDesign
                name={
                  selectedId && selectedId == value.id
                    ? 'arrowup'
                    : 'arrowright'
                }
                color={manageBackupButtonTextColor}
                size={12}
              />
            </TouchableOpacity>
          </View>
        </View>
        {selectedId == value.id ? (
          <View>
            <View
              style={{
                backgroundColor: Colors.white,
                height: 0.5,
              }}
            />
            <View style={[ styles.cardView, {
              height: wp( '27%' ),
              // backgroundColor: 'red'
            } ]}>
              <View
                style={{
                  width: wp( '70%' ),
                }}
              >
                <Text
                  numberOfLines={2}
                  style={{
                    color: textColor,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue( 10 ),
                  }}
                >
                  {strings[ value.note ]}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 'auto',
                  justifyContent: 'space-between',
                }}
              >
                <MBKeeperButton
                  value={value}
                  keeper={value.keeper1}
                  onPressKeeper={() => props.onPressKeeper1()}
                  keeperButtonText={
                    value.id == 1
                      ? value.keeper1ButtonText
                      : keeperButtonText( value.keeper1ButtonText, '1' )
                  }
                  disabled={false}
                />
                <MBKeeperButton
                  value={value}
                  keeper={value.keeper2}
                  onPressKeeper={() => props.onPressKeeper2()}
                  keeperButtonText={
                    value.id == 1
                      ? value.keeper2ButtonText
                      : keeperButtonText( value.keeper2ButtonText, '2' )
                  }
                  disabled={false}
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  cardView: {
    height: wp( '15%' ),
    width: wp( '85%' ),
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.textColorGrey
  },
  cardHealthImageView: {
    backgroundColor: Colors.red,
    // shadowColor: Colors.deepBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowRadius: 10,
    borderRadius: wp( '6%' ) / 2,
    width: wp( '6%' ),
    height: wp( '6%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHealthImage: {
    width: wp( '2%' ),
    height: wp( '4%' ),
    resizeMode: 'contain',
  },
  cardButtonView: {
    width: wp( '21%' ),
    height: wp( '8' ),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    borderRadius: 8,
  },
  cardButtonText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    width: wp( '24%' ),
  },
  levelText: {
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  levelInfoText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
    marginTop: 'auto',
  },
  manageButtonText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    marginRight: 5,
  },
} )
export default memo( ManageBackupCard )
