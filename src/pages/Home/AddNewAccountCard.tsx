import React, { useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import { AccountType } from '../../bitcoin/utilities/Interface'

export type Props = {
  onPress: () => void;
  containerStyle?: Record<string, unknown>;
}

const AddNewAccountCard: React.FC<Props> = ( {
  onPress,
  containerStyle = {
  },
}: Props ) => {
  const { translations } = useContext( LocalizationContext )
  const add_new = translations[ 'home' ].add_new
  const lnAccount = useActiveAccountShells().filter( account => account.primarySubAccount.type === AccountType.LIGHTNING_ACCOUNT )

  return (
    <TouchableOpacity activeOpacity={0.85}
      onPress={onPress}
      style={containerStyle}
      disabled={lnAccount.length !==0}    >
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
              width: 42, height: 42
            }}
            source={require( '../../assets/images/HomePageIcons/add.png' )}
          />
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 12 ),
              marginTop: RFValue( 10 ),
              fontWeight: '500',
            }}
          >
            Add Lightning account
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
