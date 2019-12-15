import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../common/Colors';

export default class ToggleSwitch extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            switchOn: true
        };
    }
    render() {
        return (<TouchableOpacity activeOpacity={10} onPress={() => this.props.onpress()} style={{ flexDirection: 'row', backgroundColor: this.props.toggleColor ? this.props.toggleColor : '#1E82C2', height: wp('10%'), width: wp('17%'), borderRadius: wp('10%') / 2, display: 'flex', alignItems: 'center', paddingLeft: 2, paddingRight: 2, }}>
            {this.props.toggle ?
                (<View style={{ flexDirection: 'row' }}>
                    <View style={{ height: wp('8%'), width: wp('8%'), justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={this.props.inactiveOffImage ?this.props.inactiveOffImage:require('../assets/images/icons/icon_dollar_light.png')} style={{ width: wp('3.5%'), height: wp('3.5%'), resizeMode: "contain" }} />
                    </View>
                    <View style={{ backgroundColor: this.props.toggleCircleColor ? this.props.toggleCircleColor : Colors.white, height: wp('8%'), width: wp('8%'), borderRadius: wp('8%') / 2, marginLeft: this.props.toggle ? 'auto' : 0, justifyContent: 'center', alignItems: 'center', marginRight:2 }}>
                        <Image source={this.props.activeOnImage ?this.props.activeOnImage:require('../assets/images/icons/icon_bitcoin_dark.png')} style={{ width: wp('3.5%'), height: wp('3.5%'), resizeMode: "contain" }} />
                    </View>
                </View>) :
                (<View style={{ flexDirection: 'row' }}>
                    <View style={{ backgroundColor: this.props.toggleCircleColor ? this.props.toggleCircleColor : Colors.white, height: wp('8%'), width: wp('8%'), borderRadius: wp('8%') / 2, alignItems: 'center', justifyContent: 'center',marginLeft:2 }}>
                        <Image source={this.props.activeOffImage ?this.props.activeOffImage: require('../assets/images/icons/icon_dollar_dark.png')} style={{ width: wp('3.5%'), height: wp('3.5%'), resizeMode: "contain" }} />
                    </View>
                    <View style={{ height: wp('8%'), width: wp('8%'), justifyContent: 'center', alignItems: 'center', marginLeft: this.props.toggle ? 'auto' : 0, marginRight:-3 }}>
                        <Image source={this.props.inactiveOnImage ?this.props.inactiveOnImage: require('../assets/images/icons/icon_bitcoin_gray.png')} style={{ width: wp('3.5%'), height: wp('3.5%'), resizeMode: "contain" }} />
                    </View>
                </View>)
            }
        </TouchableOpacity>
        )
    }
}