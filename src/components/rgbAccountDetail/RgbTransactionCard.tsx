import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { withNavigation } from 'react-navigation'
import { translations } from '../../common/content/LocContext'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import ArrowRight from '../../assets/images/svgs/icon_arrow_right.svg'
import IconSent from '../../assets/images/icons/icon_sent.svg'
import IconReceive from '../../assets/images/icons/icon_recieve.svg'


export type Props = {
  title: string | null;
  ammount: string | null;
  image: string | null;
  onItemPress: () => void;
  txType: string | null;
};

const RgbTransactionCard: React.FC<Props> = ( {
  title,
  ammount,
  image,
  onItemPress,
  txType
}: Props ) => {
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  return(
    <TouchableOpacity style={styles.itemContainer} onPress={onItemPress}>
      <View style={styles.textContainer}>
        {txType === 'receive' ? <IconReceive/> : <IconSent/> }
        <Text style={styles.itemDesc}>{title}</Text>
      </View>
      <View style={styles.currencyContainer}>
        <Text
          numberOfLines={1}
          style={[ styles.amountText, {
            color: txType === 'receive' ? 'green' : 'tomato'
          } ]}
        >{ammount}
        </Text>
        <ArrowRight />
      </View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create( {
  itemContainer: {
    marginHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: Colors.gray1
  },
  textContainer: {
    flex: 1,
    marginStart: 10,
    flexDirection: 'row',
    alignItems :'center'
  },
  itemDesc: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 10 ),
    marginTop: 2,
    marginLeft: 10
  },
  amountText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 14.5 ),
    marginHorizontal: wp( 2 ),
    color: Colors.textColorGrey
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
} )

export default withNavigation( RgbTransactionCard )

