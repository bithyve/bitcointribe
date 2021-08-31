import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import CardView from 'react-native-cardview'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../../common/Colors'

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
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      <CardView cornerRadius={10} style={styles.cardContainer}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            style={{
              width: 42, height: 42
            }}
            source={require( '../../assets/images/icons/icon_add.png' )}
          />
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 12 ),
              fontWeight: '500',
            }}
          >
            Add New
          </Text>
        </View>
      </CardView>
    </TouchableOpacity>
  )
}


const styles = StyleSheet.create( {
  cardContainer: {
    backgroundColor: Colors.white,
    width: widthPercentageToDP( 43 ),
    height: heightPercentageToDP( 21 ),
    // borderColor: Colors.borderColor,
    // borderWidth: 1,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    elevation: 6
  },
} )

export default AddNewAccountCard
