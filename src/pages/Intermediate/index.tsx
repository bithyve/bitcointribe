import idx from 'idx'
import React, { Component } from 'react'
import { ImageBackground, View, StyleSheet, AppState, Platform } from 'react-native'
import { withNavigationFocus } from 'react-navigation'
import Loader from '../../components/loader'
import { connect } from 'react-redux'
import { updateLastSeen } from '../../store/actions/preferences'
var blurredImage = require('../../assets/images/blurred_bg.jpg')



interface IntermediatePropsTypes {
    navigation: any
    isFocused: boolean,
    applicationStatus: any,
    lastSeen: any,
    updateLastSeen: any

}

interface IntermediateStateTypes {
    isLocked: boolean,
    lastKnownTime: any,
    canLock: boolean
}


class Intermediate extends Component<IntermediatePropsTypes, IntermediateStateTypes> {
    constructor(props) {
        super(props)
        this.state = {
            isLocked: false,
            lastKnownTime: new Date(),
            canLock: true
        }
    }

    componentDidMount = () => {
        AppState.addEventListener("change", this.handleAppStateChange);
    };


    handleAppStateChange = async (nextAppState) => {
        if (Platform.OS === 'ios' && nextAppState === 'active') {
            let now: any = new Date()
            let diff = Math.abs(now - this.props.lastSeen)
            const { canLock } = this.state
            if (diff > 3000) {
                if (canLock) {
                    this.setState({
                        canLock: false
                    }, () => this.props.navigation.push('ReLogin'))
                }
            } else {
                this.props.navigation.pop()
                this.props.updateLastSeen(new Date())
            }
        }

    };


    componentWillUnmount() {
        AppState.removeEventListener("change", this.handleAppStateChange);
    }


    render() {
        return (
            <ImageBackground source={blurredImage} style={styles.wrapper}>
                <Loader />
            </ImageBackground>
        )
    }
}




const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: 'white'
    }
})



const mapStateToProps = (state) => {
    return { applicationStatus: state.preferences.applicationStatus, lastSeen: state.preferences.lastSeen }
}

export default connect(mapStateToProps, { updateLastSeen })(withNavigationFocus(Intermediate))