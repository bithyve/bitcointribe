import { AsyncStorage } from "react-native";


const getAsyncStorageValue = async ( type: any ) => {
    return await AsyncStorage.getItem( type )
}

const setAsyncStorageValue = async ( type: any, value: any ) => {
    await AsyncStorage.setItem(
        type,
        value
    );
}

export {
    getAsyncStorageValue,
    setAsyncStorageValue
}