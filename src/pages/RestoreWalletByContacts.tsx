import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    ScrollView
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import CommonStyles from "../common/Styles";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from "react-native-responsive-fontsize";
// import Contacts from 'react-native-contacts';

import HeaderTitle from "../components/HeaderTitle";
import ContactList from '../components/ContactList';

export default function RestoreWalletByContacts(props) {
    const [contacts, setContacts] = useState([]);

    function selectedContactsList(list)
    {
        setContacts(list);
    }

    function continueNProceed() {
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
            <View style={{ flex: 1 }}>
                <View style={CommonStyles.headerContainer}>
                    <TouchableOpacity
                        style={CommonStyles.headerLeftIconContainer}
                        onPress={() => { props.navigation.navigate('RestoreSelectedContactsList'); }}
                    >
                        <View style={CommonStyles.headerLeftIconInnerContainer}>
                            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                        </View>
                    </TouchableOpacity>
                </View>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
                    <Text style={{padding:20}} onPress={()=>{console.log('contacts', contacts)}}>fsfsdf</Text>
                    <HeaderTitle
                        firstLineTitle={'Restore wallet using'}
                        secondLineTitle={'Contacts'}
                        infoTextNormal={"Select contacts to "}
                        infoTextBold={"send recovery request"}
                    />
                    <ContactList style={{}} onPressContinue={()=>continueNProceed()} onSelectContact={(list)=>selectedContactsList(list)} />
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView >
    );

}

const styles = StyleSheet.create({
   
});
