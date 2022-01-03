import React, { Component } from 'react'
import { Text, View } from 'react-native'

export class AccountDetails extends Component {

  constructor( props ) {
    super( props )
    console.log( props.navigation.getParam( 'node' ) )
    this.state = {
      node: props.navigation.getParam( 'node' )
    }
  }


  render() {
    return (
      <View>
        <Text> textInComponent </Text>
      </View>
    )
  }
}

export default AccountDetails
