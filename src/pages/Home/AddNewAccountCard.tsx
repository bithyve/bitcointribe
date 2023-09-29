import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from './../../common/Fonts'

export type Props = {
  onPress: () => void;
  containerStyle?: Record<string, unknown>;
}

const AddNewAccountCard: React.FC<Props> = ( {
  onPress,
  containerStyle = {
  },
}: Props ) => {
  return (
    <TouchableOpacity activeOpacity={0.85}
      onPress={onPress}
      style={containerStyle}
    >
      <View style={styles.cardContainer}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            style={{
              width: 30, height: 30, marginBottom: 10
            }}
            source={require( '../../assets/images/icons/icon_add.png' )}
          />
          <Text
            style={{
              color: Colors.THEAM_INFO_TEXT_COLOR,
              fontSize: RFValue( 11 ),
              fontFamily: Fonts.SemiBold
            }}
          >
          Add Account/Wallet
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}


const styles = StyleSheet.create( {
  cardContainer: {
    backgroundColor: Colors.white,
    width: widthPercentageToDP( 43 ),
    height: heightPercentageToDP( 20 ),
    // borderColor: Colors.borderColor,
    borderRadius: 10,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    elevation: 6
  },
} )

export default AddNewAccountCard
