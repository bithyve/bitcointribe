import React from 'react';
import {
	View,
	SafeAreaView,
	StatusBar,
	Text,
} from 'react-native';
import Colors from '../common/Colors';

export default function RestoreSelectedContactsList(props) {

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
			<View style={{ flex: 1 }}>
				<Text>IN PROGRESS</Text>
			</View>
		</SafeAreaView>
	);

}