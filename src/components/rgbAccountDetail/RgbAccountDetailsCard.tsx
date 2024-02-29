import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import { hp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'


export type Props = {
  currency: string | null;
  assetId: string | null;
  name: string | null;
  ammount: string | null;
  image: string | null;
  description: string | null;
  onViewDetailPress: () => void;
  viewDetails: string | null;
  labelBg: string | null;
  containerBg: string | null;
};

const RgbAccountDetailsCard: React.FC<Props> = ( {
  currency,
  assetId,
  name,
  ammount,
  image,
  description,
  onViewDetailPress,
  viewDetails,
  labelBg,
  containerBg
}: Props ) => {
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  return(
    <View style={[ styles.bitcoinContainer, {
      backgroundColor: containerBg
    } ]}>
      <View style={styles.btcTopContainer}>
        <View style={[ styles.labelContainer, {
          backgroundColor:labelBg
        } ]}>
          {
            currency ?
              <Text style={styles.labelText}>{currency}</Text>
              : <Image style={styles.imageContainer} source={{
                uri: image
              }} />
          }
        </View>
        {
          assetId ?
            <View style={styles.assetContainer}>
              <Text style={styles.assetIdTitle}>{'ASSET ID'}</Text>
              <Text style={styles.assetIDText} numberOfLines={1}>{assetId}</Text>
            </View>
            :
            <>
              <View style={{
                flex:1
              }} />
              <TouchableOpacity style={styles.viewDetailContainer} onPress={onViewDetailPress}>
                <Text style={styles.viewDetailText}>{viewDetails}</Text>
              </TouchableOpacity>
            </>
        }
      </View>
      <View style={{
        flex:1
      }}/>
      <Text style={styles.nameText}>{name}</Text>
      {
        description &&
          <Text style={styles.labelOuterText} numberOfLines={1}>{description}</Text>
      }
      <View style={styles.btcBottomContainer}>
        {
          currency &&
          <Text style={styles.currencyText}>{currency}</Text>
        }
        <Text style={styles.amountText}>{ammount}</Text>
      </View>
    </View>
  )
}
const styles = StyleSheet.create( {
  rootContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: hp( 250 ),
    borderRadius: 15,
    elevation: 5,
    shadowOpacity: 0.62,
    shadowRadius: 14,
    shadowOffset: {
      width: 0, height: 10
    },
    position: 'relative',
  },
  labelContainer: {
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 30,
    height: 48,
    width: 48,
    justifyContent:'center',
    alignItems:'center',
  },
  imageContainer:{
    borderRadius: 30,
    height: 48,
    width: 48,
  },
  labelText:{
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.SemiBold,
    color: Colors.backgroundColor1,
  },
  assetContainer:{
    marginStart: 10,
    flex:1
  },
  assetIdTitle:{
    fontSize: RFValue( 7 ),
    fontFamily: Fonts.SemiBold,
    color: Colors.backgroundColor1,
  },
  assetIDText:{
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    color: Colors.backgroundColor1,
    marginTop: 3
  },
  viewDetailContainer:{
    padding:5,
    borderColor: Colors.white,
    borderWidth:1,
    borderRadius: 5
  },
  viewDetailText:{
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    color: Colors.backgroundColor1,
  },
  nameText:{
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.Regular,
    color: Colors.backgroundColor1,
  },
  currencyText:{
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.SemiBold,
    color: Colors.backgroundColor1,
    marginBottom: 3,
    marginEnd: 5
  },
  labelOuterText:{
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    color: Colors.backgroundColor1,
    marginTop: 1
  },
  amountText:{
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
    color: Colors.backgroundColor1,
  },
  btcBottomContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  bitcoinContainer : {
    height: 175,
    marginHorizontal: 15,
    backgroundColor:'#A36363',
    borderRadius: 15,
    paddingHorizontal: 17,
    paddingVertical: 20,
  },
  btcTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 3,
  }
} )

export default RgbAccountDetailsCard

