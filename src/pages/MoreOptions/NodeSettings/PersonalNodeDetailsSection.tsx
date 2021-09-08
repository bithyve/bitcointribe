import React  from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PersonalNode from '../../../common/data/models/PersonalNode'
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
import { translations } from '../../../common/content/LocContext'

export type Props = {
  personalNode: PersonalNode | null;
  onEditButtonPressed: () => void;
};

const PersonalNodeDetailsSection: React.FC<Props> = ( {
  personalNode,
  onEditButtonPressed,
}: Props ) => {
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
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
            {strings.PersonalNodeDetails}
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
        <View style={{
          marginBottom: 16
        }}>
          <Text style={{
            ...HeadingStyles.labelText, marginBottom: 4
          }}>
            {strings.NodeAddress}
          </Text>

          <Text numberOfLines={1}>{personalNode?.ipAddress || strings.NoAddressSet}</Text>
        </View>

        <View style={{
          marginBottom: 8,
        }}>
          <Text style={{
            ...HeadingStyles.labelText,
            marginBottom: 4
          }}>
            {strings.PortNumber}
          </Text>

          <Text numberOfLines={1}>{String( personalNode?.portNumber || strings.NoPort )}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={10}
          onPress={() => {}}
          style={styles.useFallbackTouchable}
        >
          <Text style={styles.useFallbackText}>
            {strings.fallback}
          </Text>
          <View style={styles.useFallbackCheckView}>
            {personalNode?.useFallback && (
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

export default PersonalNodeDetailsSection
