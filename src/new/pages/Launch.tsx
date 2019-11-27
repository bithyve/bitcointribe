import React, { useEffect } from 'react';
import {
	View,
	StyleSheet,
	StatusBar
} from 'react-native';
import Video from 'react-native-video';
import { RFValue } from "react-native-responsive-fontsize";
import Colors from '../common/Colors';

export default function Launch(props) {
	setTimeout(() => {
		props.navigation.replace('PasscodeConfirm');
	}, 5000);
	return (
		<View style={styles.container}>
			<Video
				source={require('./../assets/video/splash_animation.mp4')}
				style={{
					flex: 1
				}}
				muted={true}
				repeat={false}
				resizeMode={'cover'}
				rate={1.0}
				ignoreSilentSwitch={'obey'}
			/>
			<StatusBar
				backgroundColor={'white'}
				hidden={true}
				barStyle="dark-content"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white
	},
});
