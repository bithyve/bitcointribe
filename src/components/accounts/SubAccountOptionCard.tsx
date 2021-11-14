import React, { useMemo } from 'react'
import { View, StyleSheet, Image, Text } from 'react-native'
import { Card } from 'react-native-elements'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import CardStyles from '../../common/Styles/Cards.js'
import LinearGradient from 'react-native-linear-gradient'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'
import Fonts from '../../common/Fonts'

export interface Props {
  subAccountInfo: SubAccountDescribing;
  isDisabled?: boolean;
  isSelected?: boolean;
  specialTag?: string | null;
  showsBalance?: boolean;
  containerStyle?: Record<string, unknown>;
}

const SubAccountOptionCard: React.FC<Props> = ( {
  subAccountInfo,
  isDisabled = false,
  isSelected = false,
  specialTag = null,
  showsBalance = false,
  containerStyle = {
  },
}: Props ) => {
  const AllowSecureAccount = useSelector(
    ( state ) => state.bhr.AllowSecureAccount,
  )

  const selectionIndicatorContainerStyle = useMemo( () => {
    return {
      ...styles.selectionIndicatorContainer,
      borderColor: isSelected ? Colors.blue : Colors.borderColor,
      backgroundColor: isSelected ? Colors.blue : 'transparent',
      margin: 1
    }
  }, [ isSelected ] )

  const cardContainerStyle = useMemo( () => {
    return {
      ...styles.cardContainer,
      backgroundColor: isSelected ? 'transparent' : Colors.white,
      opacity: isDisabled ? 0.35 : 1.0,
    }
  }, [ isSelected ] )

  const titleTextStyle = useMemo( () => {
    return {
      ...styles.titleText,
      color: isSelected ? Colors.white : Colors.primaryText,
      fontFamily: Fonts.FiraSansMedium
    }
  }, [ isSelected ] )

  const subtitleTextStyle = useMemo( () => {
    return {
      ...styles.subtitleText,
      color: isSelected ? Colors.offWhite : Colors.secondaryText,
      fontFamily: Fonts.FiraSansRegular
    }
  }, [ isSelected ] )


  const descriptionTextContainerStyle = useMemo( () => {
    return {
      ...styles.descriptionTextContainer,
      flex: isDisabled ? 0 : 1,
      marginBottom: isDisabled ? -8 : 5,
      // backgroundColor: 'red',
    }
  }, [ isSelected ] )

  const unitText = useFormattedUnitText( {
    bitcoinUnit: subAccountInfo.kind == SubAccountKind.TEST_ACCOUNT ? BitcoinUnit.TSATS : BitcoinUnit.SATS
  } )

  const subtitleText = useMemo( () => {
    if ( showsBalance ) {
      return `${subAccountInfo.balances.confirmed} ${unitText}`
    } else {
      return subAccountInfo.defaultSubTitle ? subAccountInfo.defaultSubTitle : subAccountInfo.defaultDescription
    }
  }, [ showsBalance, subAccountInfo ] )


  return (
    <View style={{
      ...styles.rootContainer, ...containerStyle
    }}>
      {isSelected &&  (
        <LinearGradient
          colors={[
            Colors.primaryAccentLighter2,
            Colors.primaryAccentLighter2,
            Colors.primaryAccent,
          ]}
          start={{
            x: 0.0, y: 0.0
          }}
          end={{
            x: 1.0, y: 1.0
          }}
          style={styles.backgroundGradient}
        />
      )}

      <Card
        containerStyle={cardContainerStyle}
        wrapperStyle={styles.cardContentWrapper}
      >
        {specialTag && (
          <Card.Title
            style={styles.specialTagText}
            numberOfLines={2}
          >
            {specialTag}
          </Card.Title>
        )}
        <View style={styles.image} >
          {getAvatarForSubAccount( subAccountInfo, isSelected )}
        </View>


        <View style={descriptionTextContainerStyle}>
          <Card.Title style={titleTextStyle} numberOfLines={1}>
            {subAccountInfo.customDisplayName? subAccountInfo.customDisplayName: subAccountInfo.defaultTitle}
          </Card.Title>
          <Card.Title style={subtitleTextStyle}>
            {subtitleText}
          </Card.Title>
        </View>

        {!AllowSecureAccount && subAccountInfo.type == 'SAVINGS_ACCOUNT' ? <Text style={{
          color: Colors.blue, fontSize: RFValue( 10 ), fontFamily: Fonts.FiraSansRegular
        }}>Level up to use</Text> :
          isDisabled == false && (
            <View style={selectionIndicatorContainerStyle}>
              {isSelected && (
                <Image
                  style={styles.selectionIndicatorImage}
                  source={require( '../../assets/images/icons/checkmark.png' )}
                />
              )}
            </View>
          )}
      </Card>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CardStyles.horizontalScrollViewCardContainer.borderRadius,
    overflow: 'hidden',
    elevation: 1,
  },

  image: {
    width: 30,
    height: 30,
    marginBottom: 10,
    marginTop: 5,
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center'
  },

  cardContainer: {
    margin: 0,
    flex: 1,
    borderRadius: CardStyles.horizontalScrollViewCardContainer.borderRadius,
  },

  cardContentWrapper: {
    ...CardStyles.horizontalScrollViewCardContent,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    elevation: 2,
    marginVertical: -6
  },

  descriptionTextContainer: {
    alignItems: 'center',
  },

  titleText: {
    fontSize: RFValue( 10 ),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },

  subtitleText: {
    fontSize: RFValue( 9 ),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
    flex: 1,
    alignSelf: 'center'
  },

  selectionIndicatorContainer: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectionIndicatorImage: {
    width: '100%',
    height: '100%',
  },

  specialTagText: {
    position: 'absolute',
    right: -RFValue( 2 ),
    top: -RFValue( 2 ),
    fontSize: RFValue( 9 ),
    color: Colors.blue,
    textAlign: 'right',
    width: '50%',
  }
} )

export default SubAccountOptionCard
