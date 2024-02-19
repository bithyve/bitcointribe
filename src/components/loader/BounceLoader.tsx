import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import Colors from 'src/common/Colors'

const BounceLoader = () => {
    useEffect(() => {
        onStartAnimation()
    }, [])

    const animations = {
        first: useRef(new Animated.Value(0)).current,
        second: useRef(new Animated.Value(0)).current,
        third: useRef(new Animated.Value(0)).current,
        fourth: useRef(new Animated.Value(0)).current,
    }
    const onAnimate = (animation, nextAnimation) => {
        Animated.sequence([
            Animated.timing(animation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(animation, {
                toValue: 2,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start()
        setTimeout(() => { nextAnimation() }, 300)
    }
    const onSecondAnimation = () => {
        onAnimate(animations.second, onThirdAnimation)
    }
    const onThirdAnimation = () => {
        onAnimate(animations.third, onFourthAnimation)
    }
    const onFourthAnimation = () => {
        onAnimate(animations.fourth, onStartAnimation)
    }
    const onStartAnimation = () => {
        onAnimate(animations.first, onSecondAnimation)
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.ball, {
                transform: [
                    {
                        scale: animations.first,
                    },
                ],
            }]} />
            <Animated.View style={[styles.ball, {
                transform: [
                    {
                        scale: animations.second,
                    },
                ],
            }]} />
            <Animated.View style={[styles.ball, {
                transform: [
                    {
                        scale: animations.third,
                    },
                ],
            }]} />
            <Animated.View style={[styles.ball, {
                transform: [
                    {
                        scale: animations.fourth,
                    },
                ],
            }]} />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    ball: {
        width: 6,
        height: 6,
        borderRadius: 10,
        backgroundColor: Colors.white,
        marginHorizontal: 5
    },
})
export default BounceLoader