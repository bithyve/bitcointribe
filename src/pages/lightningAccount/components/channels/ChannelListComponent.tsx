import React from 'react'
import { Text, View } from 'react-native'

import { widthPercentageToDP } from 'react-native-responsive-screen'
 
const ChannelList =(props)=> {
    return (
      <View>
        <Text>{props.alias}</Text>
        <View style = {{
          flex: 2,
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: 5
        }}>
          {props.channelParams.active?
            <View style = {{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              margin: 5
            }}>
              <View>
                <Text>Local: {props.channelParams.local_balance}</Text>
              </View>
              <View>
                <Text>Remote: {props.channelParams.remote_balance}</Text>
              </View>
            </View>: <Text>Offline: { parseInt ( props.channelParams.remote_balance ) + parseInt(props.channelParams.local_balance )}</Text>}
        </View>

        <View style={{
          borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
        }} />
      </View>
    )
}

export default ChannelList;
