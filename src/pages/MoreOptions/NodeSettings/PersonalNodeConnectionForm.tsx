import React, { useMemo, useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import { Input } from 'react-native-elements'
import useActivePersonalNode from '../../../utils/hooks/state-selectors/nodeSettings/UseActivePersonalNode'
import Colors from '../../../common/Colors';
import ButtonBlue from '../../../components/ButtonBlue'

export type PersonalNodeFormData = {
  ipAddress: string;
  portNumber: number;
}

export type Props = {
  onSubmit: (formData: PersonalNodeFormData) => void;
};


const PersonalNodeConnectionForm: React.FC<Props> = ({ onSubmit, }: Props) => {
  const activePersonalNode = useActivePersonalNode()

  const [currentIPAddressValue, setCurrentIPAddressValue] = useState(
    activePersonalNode?.ipAddress || ''
  )

  const [currentPortNumberValue, setCurrentPortNumberValue] = useState(
    String(activePersonalNode?.portNumber || '')
  )

  const ipAddressInputRef = useRef<Input>(null)

  const canProceed = useMemo(() => {
    return (
      currentIPAddressValue.length != 0 &&
      Boolean(Number(currentPortNumberValue))
    )
  }, [currentIPAddressValue, currentPortNumberValue])

  function handleProceedButtonPress() {
    onSubmit({
      ipAddress: currentIPAddressValue,
      portNumber: Number(currentPortNumberValue),
    })
  }

  useEffect(() => {
    ipAddressInputRef.current?.focus()
  }, [])

  return (
    <View style={styles.rootContainer}>

      <View style={ListStyles.infoHeaderSection}>
        <Text style={ListStyles.infoHeaderTitleText}>Setup Personal Node</Text>
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

      <View style={styles.footerSection}>
        <ButtonBlue
          buttonText="Proceed"
          handleButtonPress={handleProceedButtonPress}
          buttonDisable={canProceed === false}
        />
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
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

})

export default PersonalNodeConnectionForm
