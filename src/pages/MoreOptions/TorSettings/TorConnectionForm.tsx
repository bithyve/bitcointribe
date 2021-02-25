import React, { useMemo, useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import { Input } from 'react-native-elements'
import useActiveTor from '../../../utils/hooks/state-selectors/torSettings/UseActiveTor'
import ButtonBlue from '../../../components/ButtonBlue'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Entypo from 'react-native-vector-icons/Entypo'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Fonts from '../../../common/Fonts'

export type torFormData = {
  useFallback: boolean;
}

export type Props = {
  onSubmit: ( formData: TorFormData ) => void;
};


const TorConnectionForm: React.FC<Props> = ( { onSubmit, }: Props ) => {
  const activeTor = useActiveTor()

  const [ useFallback, setUseFallbacck ] = useState( activeTor?.useFallback || false )

  function handleProceedButtonPress() {
    onSubmit( {
      useFallback
    } )
  }


  return (
    <View style={styles.rootContainer}>

      <View style={ListStyles.infoHeaderSection}>
        <Text style={ListStyles.infoHeaderTitleText}>Setup Tor</Text>
      </View>

      <TouchableOpacity
        activeOpacity={10}
        onPress={() => setUseFallbacck( !useFallback )}
        style={styles.useFallbackTouchable}
      >
        <Text style={styles.useFallbackText}>
                    Use plainnet as fallback when Tor network unavailable
        </Text>
        <View style={styles.useFallbackCheckView}>
          {useFallback && (
            <Entypo
              name="check"
              size={RFValue( 17 )}
              color={Colors.green}
            />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.footerSection}>
        <ButtonBlue
          buttonText="Proceed"
          handleButtonPress={handleProceedButtonPress}
        />
      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {

  },

  bodySection: {
    paddingHorizontal: 16,
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
    paddingLeft: 35,
    paddingRight: 35,
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

export default TorConnectionForm
