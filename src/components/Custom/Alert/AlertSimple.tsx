import { Alert } from 'react-native';

export default class AlertSimple {
  public static simpleOk(title: string, subtile: string) {
    Alert.alert(
      title,
      subtile,
      [
        {
          text: 'Ok',
        },
      ],
      { cancelable: false },
    );
  }

  // TODO: Ok Action
  public static simpleOkAction(
    title: string,
    subtile: string,
    clickOk: Function,
  ) {
    Alert.alert(
      title,
      subtile,
      [
        {
          text: 'Ok',
          onPress: () => {
            clickOk();
          },
        },
      ],
      { cancelable: false },
    );
  }

  public static simpleOkActionWithPara(title: string, subtile: string) {
    Alert.alert(
      title,
      subtile,
      [
        {
          text: 'Ok',
          onPress: () => {},
        },
      ],
      { cancelable: false },
    );
  }
}
