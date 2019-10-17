import { Alert } from 'react-native';

export default class AlertSimple {
  public simpleOk(title: string, subtile: string) {
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

  //TODO: Ok Action
  public simpleOkAction(title: string, subtile: string, click_Ok: Function) {
    Alert.alert(
      title,
      subtile,
      [
        {
          text: 'Ok',
          onPress: () => {
            click_Ok();
          },
        },
      ],
      { cancelable: false },
    );
  }

  public simpleOkActionWithPara(
    title: string,
    subtile: string,
    click_Ok: Function,
  ) {
    {
      Alert.alert(
        title,
        subtile,
        [
          {
            text: 'Ok',
            onPress: () => {
              function click_Ok(value: any) {}
            },
          },
        ],
        { cancelable: false },
      );
    }
  }
}
