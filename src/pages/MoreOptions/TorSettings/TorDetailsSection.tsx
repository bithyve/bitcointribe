import React  from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Tor from '../../../common/data/models/Tor'
import ListStyles from '../../../common/Styles/ListStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { Button, Input } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import Entypo from 'react-native-vector-icons/Entypo'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Fonts from '../../../common/Fonts'

export type Props = {
  tor: Tor | null;
  onEditButtonPressed: () => void;
};

const TorDetailsSection: React.FC<Props> = ( {
  tor,
  onEditButtonPressed,
}: Props ) => {
  return (
    <View style={styles.rootContainer}>

      <View style={ListStyles.infoHeaderSection}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{
            ...ListStyles.infoHeaderTitleText, flex: 1
          }}>
            Tor Details
          </Text>

          <Button
            raised
            buttonStyle={ButtonStyles.miniNavButton}
            title="Edit"
            titleStyle={ButtonStyles.miniNavButtonText}
            onPress={onEditButtonPressed}
          />
        </View>
      </View>

      <View style={styles.bodySection}>

        <TouchableOpacity
          activeOpacity={10}
          onPress={() => {}}
          style={styles.useFallbackTouchable}
        >
          <Text style={styles.useFallbackText}>
          Fallback to plainnet when Tor unavailable
          </Text>
          <View style={styles.useFallbackCheckView}>
            {tor?.useFallback && (
              <Entypo
                name="check"
                size={RFValue( 17 )}
                color={Colors.green}
              />
            )}
          </View>
        </TouchableOpacity>

      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },

  bodySection: {
    paddingHorizontal: 24,
    flex: 1,
  },

  textInputContainer: {
  },

  footerSection: {
    marginTop: 12,
    paddingHorizontal: 26,
    alignItems: 'flex-start',
  },

  useFallbackTouchable: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: Colors.backgroundColor1,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 10,
    height: wp( '13%' ),
  },
  useFallbackText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  useFallbackCheckView: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    borderRadius: 7,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
} )

export default TorDetailsSection
