import React, { useMemo, useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import { Input } from 'react-native-elements'
import useActivePersonalNode from '../../../utils/hooks/state-selectors/nodeSettings/UseActivePersonalNode'
import ButtonBlue from '../../../components/ButtonBlue'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Entypo from 'react-native-vector-icons/Entypo'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Fonts from '../../../common/Fonts'
import { translations } from '../../../common/content/LocContext'

export type PersonalNodeFormData = {
  ipAddress: string;
  portNumber: number;
  useFallback: boolean;
}

export type Props = {
  onSubmit: ( formData: PersonalNodeFormData ) => void;
};


const PersonalNodeConnectionForm: React.FC<Props> = ( { onSubmit, }: Props ) => {
  const activePersonalNode = useActivePersonalNode()
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const [ currentIPAddressValue, setCurrentIPAddressValue ] = useState(
    activePersonalNode?.ipAddress || ''
  )

  const [ currentPortNumberValue, setCurrentPortNumberValue ] = useState(
    String( activePersonalNode?.portNumber || '' )
  )

  const [ useFallback, setUseFallbacck ] = useState( activePersonalNode?.useFallback || false )

  const ipAddressInputRef = useRef<Input>( null )

  const canProceed = useMemo( () => {
    return (
      currentIPAddressValue.length != 0 &&
      Boolean( Number( currentPortNumberValue ) )
    )
  }, [ currentIPAddressValue, currentPortNumberValue ] )

  function handleProceedButtonPress() {
    onSubmit( {
      ipAddress: currentIPAddressValue,
      portNumber: Number( currentPortNumberValue ),
      useFallback
    } )
  }

  useEffect( () => {
    ipAddressInputRef.current?.focus()
  }, [] )

  return (
    <View style={styles.rootContainer}>

      <View style={ListStyles.infoHeaderSection}>
        <Text style={ListStyles.infoHeaderTitleText}>{strings.SetupPersonal}</Text>
      </View>

      <View style={styles.bodySection}>
        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          placeholder={'Your Node Address ex: http://11.22.33.44'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={'transparent'}
          value={currentIPAddressValue}
          onChangeText={setCurrentIPAddressValue}
          keyboardType="numbers-and-punctuation"
          numberOfLines={1}
          ref={ipAddressInputRef}
        />

        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          placeholder={'Port Number ex: 8003'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={'transparent'}
          value={currentPortNumberValue}
          onChangeText={setCurrentPortNumberValue}
          keyboardType="number-pad"
          numberOfLines={1}
        />
      </View>

      <TouchableOpacity
        activeOpacity={10}
        onPress={() => setUseFallbacck( !useFallback )}
        style={styles.useFallbackTouchable}
      >
        <Text style={styles.useFallbackText}>
          {strings.fallback}
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
          buttonText={common.proceed}
          handleButtonPress={handleProceedButtonPress}
          buttonDisable={canProceed === false}
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

export default PersonalNodeConnectionForm
