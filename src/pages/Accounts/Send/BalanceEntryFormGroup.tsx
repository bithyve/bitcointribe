import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Input } from 'react-native-elements';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../../../components/MaterialCurrencyCodeIcon';
import useCurrencyCode from '../../../utils/hooks/state-selectors/UseCurrencyCode';
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { FormStyles } from "../../../common/Styles/FormStyles";
import { RFValue } from 'react-native-responsive-fontsize'
import { getCurrencyImageByRegion } from '../../../common/CommonFunctions';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind';
import CurrencyKind from '../../../common/data/enums/CurrencyKind';

export type Props = {

};

const BalanceEntryFormGroup: React.FC<Props> = ({ }: Props) => {
  const currencyCode = useCurrencyCode()
  const currencyKind = useCurrencyKind()

  const prefersBitcoin = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [currencyKind])


  const ConvertedAmountInputLeftIcon: React.FC<> = () => {
    return (
      <View style={styles.amountInputImage}>
        {materialIconCurrencyCodes.includes(currencyCode) ? (
          <View style={styles.currencyImageView}>
            <MaterialCurrencyCodeIcon
              currencyCode={currencyCode}
              color={Colors.currencyGray}
              size={widthPercentageToDP(6)}
            />
          </View>
        ) : (
            <Image
              style={{
                ...styles.textBoxImage,
              }}
              source={getCurrencyImageByRegion(
                currencyCode,
                'gray',
              )}
            />
          )}
      </View>
    )
  }

  return (
    <View style={styles.rootContainer}>
      <View>
        <TouchableOpacity>
          <ConvertedAmountInputLeftIcon />
          <View style={styles.textInputImageDivider} />

          <Input
            // style={{
            //   ...styles.textBox,
            //   paddingLeft: 10,
            //   flex: 1,
            //   height: wp('13%'),
            //   width: wp('45%'),
            // }}
            inputContainerStyle={{
              ...FormStyles.textInputContainer,
              width: widthPercentageToDP(45),
            }}
            inputStyle={FormStyles.inputText}
            editable={!prefersBitcoin}
            placeholder={
              prefersBitcoin
              ? 'Converted amount in ' + currencyCode
              : 'Enter amount in ' + currencyCode
            }
            placeholderTextColor={FormStyles.placeholderText.color}
            value={currencyAmount}
            returnKeyLabel="Done"
            returnKeyType="done"
            keyboardType={'numeric'}
            onChangeText={(value) => {
              if (this.state.isSendMax) {
                this.setState({
                  isSendMax: false
                })
              }
              this.convertBitCoinToCurrency(value)
            }}
            placeholderTextColor={Colors.borderColor}
            onFocus={() => {
              this.setState({
                InputStyle1: styles.inputBoxFocused
              })
            }}
            onBlur={() => {
              this.setState({
                InputStyle1: styles.textBoxView
              })
            }}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Backspace') {
                setTimeout(() => {
                  this.setState({
                    isInvalidBalance: false
                  })
                }, 10)
              }
            }}
            autoCorrect={false}
            autoCompleteType="off"
          />
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={{
            ...InputStyle1,
            marginBottom: wp( '1.5%' ),
            marginTop: wp( '1.5%' ),
            flexDirection: 'row',
            width: wp( '70%' ),
            height: wp( '13%' ),
            alignItems: 'center',
            backgroundColor: !prefersBitcoin
              ? Colors.white
              : Colors.backgroundColor,
          }}
          onPress={this.sendMaxHandler}
        > */}
        {/* <View style={styles.amountInputImage}>
            {materialIconCurrencyCodes.includes( CurrencyCode ) ? (
              <View style={styles.currencyImageView}>
                <MaterialCurrencyCodeIcon
                  currencyCode={CurrencyCode}
                  color={Colors.currencyGray}
                  size={wp( '6%' )}
                />
              </View>
            ) : (
              <Image
                style={{
                  ...styles.textBoxImage,
                }}
                source={getCurrencyImageByRegion(
                  CurrencyCode,
                  'gray',
                )}
              />
            )}
          </View> */}
        {/* <View style={styles.textInputImageDivider} /> */}
        {/* <TextInput
          style={{
            ...styles.textBox,
            paddingLeft: 10,
            flex: 1,
            height: wp('13%'),
            width: wp('45%'),
          }}
          editable={!prefersBitcoin}
          placeholder={
            prefersBitcoin
              ? 'Converted amount in ' + CurrencyCode
              : 'Enter amount in ' + CurrencyCode
          }
          value={currencyAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => {
            if (this.state.isSendMax) {
              this.setState({
                isSendMax: false
              })
            }
            this.convertBitCoinToCurrency(value)
          }}
          placeholderTextColor={Colors.borderColor}
          onFocus={() => {
            this.setState({
              InputStyle1: styles.inputBoxFocused
            })
          }}
          onBlur={() => {
            this.setState({
              InputStyle1: styles.textBoxView
            })
          }}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === 'Backspace') {
              setTimeout(() => {
                this.setState({
                  isInvalidBalance: false
                })
              }, 10)
            }
          }}
          autoCorrect={false}
          autoCompleteType="off"
        /> */}
        {!prefersBitcoin && (
          <Text
            style={{
              color: Colors.blue,
              textAlign: 'center',
              paddingHorizontal: 10,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansItalic,
            }}
          >
            Send Max
          </Text>
        )}
        </TouchableOpacity>

      {isInvalidBalance ? (
        <View style={{
          marginLeft: 'auto'
        }}>
          <Text style={styles.errorText}>Insufficient balance</Text>
        </View>
      ) : null}

      {this.getIsMinimumAllowedStatus() ? (
        <View style={{
          marginLeft: 'auto'
        }}>
          <Text style={styles.errorText}>
            Enter more than 550 sats (min allowed)
            </Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={{
          ...InputStyle,
          marginBottom: wp('1.5%'),
          marginTop: wp('1.5%'),
          flexDirection: 'row',
          alignItems: 'center',
          width: wp('70%'),
          height: wp('13%'),
          backgroundColor: prefersBitcoin
            ? Colors.white
            : Colors.backgroundColor,
        }}
        onPress={this.sendMaxHandler}
      >
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require('../../../assets/images/icons/icon_bitcoin_gray.png')}
          />
        </View>
        <View style={styles.enterAmountView} />
        <TextInput
          style={{
            ...styles.textBox,
            flex: 1,
            paddingLeft: 10,
            height: wp('13%'),
            width: wp('45%'),
          }}
          placeholder={
            prefersBitcoin
              ? serviceType == TEST_ACCOUNT
                ? 'Enter amount in t-sats'
                : 'Enter amount in sats'
              : serviceType == TEST_ACCOUNT
                ? 'Converted amount in t-sats'
                : 'Converted amount in sats'
          }
          editable={prefersBitcoin}
          value={bitcoinAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => {
            if (this.state.isSendMax) {
              this.setState({
                isSendMax: false
              })
            }
            this.convertBitCoinToCurrency(value)
          }}
          placeholderTextColor={Colors.borderColor}
          onFocus={() => {
            this.setState({
              InputStyle: styles.inputBoxFocused
            })
          }}
          onBlur={() => {
            this.setState({
              InputStyle: styles.textBoxView
            })
          }}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === 'Backspace') {
              setTimeout(() => {
                this.setState({
                  isInvalidBalance: false
                })
              }, 10)
            }
          }}
          autoCorrect={false}
          autoCompleteType="off"
        />
        {prefersBitcoin && (
          <Text
            style={{
              color: Colors.blue,
              textAlign: 'center',
              paddingHorizontal: 10,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansItalic,
            }}
          >
            Send Max
          </Text>
        )}
      </TouchableOpacity>
    </View>
    </View >
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row'
  },

  textBoxImage: {
    width: widthPercentageToDP(6),
    height: widthPercentageToDP(6),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: widthPercentageToDP(13),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  currencyImageView: {
    width: widthPercentageToDP(6),
    height: widthPercentageToDP(6),
    justifyContent: 'center',
    alignItems: 'center',
  },

  textInputImageDivider: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
})

export default BalanceEntryFormGroup
