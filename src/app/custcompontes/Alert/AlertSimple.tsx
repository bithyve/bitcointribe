
import { Alert } from 'react-native';

interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}

export default class AlertSimple {
    // componentWillReceiveProps( nextProps: any ) {
    //     let data = nextProps.data[ 0 ];
    //     //console.log( { data } );    
    //     // this.setState( {
    //     //     firstQuestion: data.data.firstQuestion,
    //     //     anwser: data.data.firstAnswer
    //     // } );
    // }   
    public simpleOk( title: string, subtile: string ) {
        Alert.alert(
            title,
            subtile,
            [
                {
                    text: 'Ok', onPress: () => {
                        console.log( 'hi' );
                    }
                },
            ],
            { cancelable: false },
        );
    }
}
