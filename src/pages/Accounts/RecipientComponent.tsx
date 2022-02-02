import React, { memo, useMemo } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import HeadingStyles from '../../common/Styles/HeadingStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { TEST_ACCOUNT, REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import RecipientAvatar from '../../components/RecipientAvatar'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import RecipientKind from '../../common/data/enums/RecipientKind'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'

export type Props = {
  recipient: RecipientDescribing;
  onPressElement?: () => void;
  selectedContactId: string;
  accountKind?: string;
};

function RecipientComponent( {
  recipient,
  onPressElement = () => {},
  selectedContactId,
  accountKind = REGULAR_ACCOUNT,
}: Props ) {
  const unitText = useFormattedUnitText( {
    bitcoinUnit: accountKind == TEST_ACCOUNT ? BitcoinUnit.TSATS : BitcoinUnit.SATS
  } )

  const unitAmount = useFormattedAmountText( recipient.amount )

  const displayedNameText = useMemo( () => {
    if ( recipient.kind === RecipientKind.ADDRESS ) {
      return `${recipient.id}`
    } else {
      return recipient.displayedName
    }
  }, [ recipient ] )

  return (
    <TouchableOpacity
      onPress={() => onPressElement()}
      style={{
        marginRight: wp( '6%' ),
        marginLeft: wp( '6%' ),
        borderRadius: 10,
        marginTop: hp( '1.7%' ),
        height:
          selectedContactId == recipient.id
            ? wp( '50%' )
            : wp( '25%' ),
        backgroundColor: Colors.backgroundColor1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: wp( '25%' ),
          paddingHorizontal: 10,
        }}
      >
        <RecipientAvatar
          recipient={recipient}
          contentContainerStyle={styles.avatarImage}
        />

        <View style={{
          marginLeft: 10, marginRight: 20
        }}>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue( 11 ),
              marginBottom: 3,
            }}
          >
            Sending to:
          </Text>

          <Text style={styles.contactNameText} numberOfLines={1}>
            {displayedNameText}
          </Text>

          <Text
            style={styles.amountText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {unitAmount} {unitText}
          </Text>
        </View>

      </View>

      {selectedContactId == recipient.id && (
        <View
          style={{
            height: wp( '25%' ),
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: wp( '17%' ),
              width: wp( '78%' ),
              padding: wp( '4%' ),
              alignSelf: 'center',
              backgroundColor: Colors.white,
            }}
          >
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue( 12 ),
              }}
            >
              Note
            </Text>
            <Text
              numberOfLines={1}
              style={{
                width: wp( '70%' ),
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue( 12 ),
                marginTop: 5,
              }}
            >
              {recipient.note}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  avatarImage: {
    // ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageXLarge,
    borderRadius: wp( 18 )/2
  },

  circleShapeView: {
    width: wp( '20%' ),
    height: wp( '20%' ),
    borderRadius: wp( '20%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    width: wp( '50%' ),
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },

  amountText: {
    ...HeadingStyles.captionText,
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.blue,
    marginTop: 3,
  }
} )
export default memo( RecipientComponent )
