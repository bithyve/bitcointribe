import React from 'react'
import { View } from 'react-native'
import Colors from '../common/Colors'

export default function Indicator({ data, curentIndex }) {
    return (
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', margin: 27 }}>
            {data.map((item, index) => {
                return (
                    <View style={{ margin: 2, borderRadius: 5, alignSelf: 'flex-end', height: 5, width: index === curentIndex ? 27 : 7, backgroundColor: index !== curentIndex ? Colors.lightBlue : Colors.deepBlue }}></View>
                )
            })}
        </View>
    );
}