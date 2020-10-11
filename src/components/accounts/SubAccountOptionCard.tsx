import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from 'react-native-elements';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import CardStyles from '../../common/Styles/Cards.js';
import LinearGradient from 'react-native-linear-gradient';
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces';

export interface Props {
  subAccountInfo: SubAccountDescribing;
  isSelected: boolean;
  containerStyle?: Record<string, unknown>;
}

const SubAccountOptionCard: React.FC<Props> = ({
  subAccountInfo,
  isSelected,
  containerStyle = {},
}: Props) => {

  const selectionIndicatorContainerStyle = useMemo(() => {
    return {
      ...styles.selectionIndicatorContainer,
      borderColor: isSelected ? Colors.blue : Colors.borderColor,
      backgroundColor: isSelected ? Colors.blue : 'transparent',
    };
  }, [isSelected]);

  const cardContainerStyle = useMemo(() => {
    return {
      ...styles.cardContainer,
      backgroundColor: isSelected ? 'transparent' : Colors.white,
    };
  }, [isSelected]);

  const titleTextStyle = useMemo(() => {
    return {
      ...styles.titleText,
      color: isSelected ? Colors.white : Colors.primaryText,
    };
  }, [isSelected]);

  const subtitleTextStyle = useMemo(() => {
    return {
      ...styles.subtitleText,
      color: isSelected ? Colors.offWhite : Colors.secondaryText,
    };
  }, [isSelected]);


  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>
      {isSelected &&  (
        <LinearGradient
          colors={[
            Colors.primaryAccentLighter2,
            Colors.primaryAccentLighter2,
            Colors.primaryAccent,
          ]}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 1.0, y: 1.0 }}
          style={styles.backgroundGradient}
        />
      )}

      <Card
        containerStyle={cardContainerStyle}
        wrapperStyle={styles.cardContentWrapper}
      >
        <Card.Image style={styles.image} source={subAccountInfo.avatarImageSource} />

        <View style={styles.descriptionTextContainer}>
          <Card.Title style={titleTextStyle} numberOfLines={1}>{subAccountInfo.defaultTitle}</Card.Title>
          <Card.Title style={subtitleTextStyle}>{subAccountInfo.defaultDescription}</Card.Title>
        </View>

        <View style={selectionIndicatorContainerStyle}>
          {isSelected && (
            <Image
              style={styles.selectionIndicatorImage}
              source={require('../../assets/images/icons/checkmark.png')}
            />
          )}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },

  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CardStyles.horizontalScrollViewCardContainer.borderRadius,
    overflow: 'hidden',
  },

  image: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },

  cardContainer: {
    margin: 0,
    flex: 1,
    borderRadius: CardStyles.horizontalScrollViewCardContainer.borderRadius,
  },

  cardContentWrapper: {
    ...CardStyles.horizontalScrollViewCardContent,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },

  descriptionTextContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },

  titleText: {
    fontSize: RFValue(10),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },

  subtitleText: {
    fontSize: RFValue(9),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },

  selectionIndicatorContainer: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectionIndicatorImage: {
    width: '100%',
    height: '100%',
  },
});

export default SubAccountOptionCard;
