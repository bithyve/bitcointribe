import React, { useMemo } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { Card } from 'react-native-elements'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import CardStyles from '../../common/Styles/Cards.js'
import LinearGradient from 'react-native-linear-gradient'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'

export interface Props {
  subAccountInfo: SubAccountDescribing;
  isDisabled?: boolean;
  isSelected?: boolean;
  specialTag?: string | null;
  containerStyle?: Record<string, unknown>;
}

const SubAccountOptionCard: React.FC<Props> = ( {
  subAccountInfo,
  isDisabled = false,
  isSelected = false,
  specialTag = null,
  containerStyle = {
  },
}: Props ) => {

  const selectionIndicatorContainerStyle = useMemo( () => {
    return {
      ...styles.selectionIndicatorContainer,
      borderColor: isSelected ? Colors.blue : Colors.borderColor,
      backgroundColor: isSelected ? Colors.blue : 'transparent',
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
    }
  }, [ isSelected ] )

  const subtitleTextStyle = useMemo( () => {
    return {
      ...styles.subtitleText,
      color: isSelected ? Colors.offWhite : Colors.secondaryText,
    }
  }, [ isSelected ] )


  const descriptionTextContainerStyle = useMemo( () => {
    return {
      ...styles.descriptionTextContainer,
      flex: isDisabled ? 0 : 1,
      marginBottom: isDisabled ? -8 : 8,
    }
  }, [ isSelected ] )




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

        <Image
          style={styles.image}
          source={getAvatarForSubAccount( subAccountInfo )}
        />

        <View style={descriptionTextContainerStyle}>
          <Card.Title style={titleTextStyle} numberOfLines={1}>{subAccountInfo.customDisplayName? subAccountInfo.customDisplayName: subAccountInfo.defaultTitle}</Card.Title>
          <Card.Title style={subtitleTextStyle}>{subAccountInfo.customDescription? subAccountInfo.customDescription: subAccountInfo.defaultDescription}</Card.Title>
        </View>

        {isDisabled == false && (
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
    width: 22,
    height: 22,
    marginBottom: 8,
    marginTop: 8
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
  },

  descriptionTextContainer: {
    alignItems: 'center',
  },

  titleText: {
    fontSize: RFValue( 10 ),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },

  subtitleText: {
    fontSize: RFValue( 9 ),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
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
