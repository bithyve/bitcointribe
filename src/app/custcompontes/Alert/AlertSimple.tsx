
import { Alert } from 'react-native';



export default class AlertSimple {
    public simpleOk( title: string, subtile: string, click_Ok: Function ) {
        Alert.alert(
            title,
            subtile,
            [
                {
                    text: 'Ok', onPress: () => {
                        click_Ok()
                    }
                },
            ],
            { cancelable: false },
        );
    }
}
