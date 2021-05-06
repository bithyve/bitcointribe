import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'

export default function TextLink({onPress, text}){
    
    return (
        <TouchableOpacity
            onPress={() => onPress()}
            style={{ alignSelf: 'flex-end' }}
        >
            <Text
                style={{
                    fontStyle: 'italic',
                    marginTop: 20,
                    color: Colors.blue,
                    fontSize: RFValue(13),
                    marginBottom: 2,
                    fontFamily: Fonts.FiraSansRegular,
                    textDecorationLine: 'underline'
                }}
            >
                {text}
            </Text>
        </TouchableOpacity>
    )
}
