import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from "react-native-responsive-fontsize";
import RadioButton from '../components/RadioButton';
import AntDesign from "react-native-vector-icons/AntDesign";

export default function ContactList(props) {
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [scrollViewRef, setScrollViewRef] = useState(React.createRef());
    const [radioOnOff, setRadioOnOff] = useState(false)
    const [contactData, setContactData] = useState([
        {
            name: 'Shivani Altekar', checked: false, id: 1,
        },
        {
            name: 'Uma AmravatiKr', checked: false, id: 2,
        },
        {
            name: 'Adison Alter', checked: false, id: 3,
        },
        {
            name: 'Add Add', checked: false, id: 4,
        },
        {
            name: 'Raj Boke', checked: false, id: 5,
        },
        {
            name: 'Samantha Bhujange', checked: false, id: 6,
        },
        {
            name: 'Kaweri Balwihari', checked: false, id: 7,
        },
        {
            name: 'Radhesham Bichkule', checked: false, id: 8,
        },
        {
            name: 'Rameswar Bihari', checked: false, id: 9,
        },
        {
            name: 'Shahaji Buchade', checked: false, id: 10,
        },
        {
            name: 'Shabnam Chitale', checked: false, id: 11,
        }
    ]);
    const [alphabetsList] = useState(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);


    useEffect(function () {
    }, [selectedContacts])

    function onContactSelect(index) {
        let contacts = contactData;
        if (selectedContacts.findIndex((value) => value.id == contacts[index].id) == 0) {
            selectedContacts.shift();
        }
        else {
            if (selectedContacts.length == 2) {
                selectedContacts.pop();
            }
            selectedContacts.push(contacts[index]);
        }
        setSelectedContacts(selectedContacts);
        for (let i = 0; i < contacts.length; i++) {
            if (selectedContacts.findIndex((value) => value.id == contacts[i].id) > -1) {
                contacts[i].checked = true;
            }
            else {
                contacts[i].checked = false;
            }
        }
        setContactData(contacts);
        
        console.log('select', selectedContacts)
        setRadioOnOff(!radioOnOff)
        props.onSelectContact(selectedContacts);
    }

    function onCancel(value) {
        if (contactData.findIndex((tmp) => tmp.id == value.id) > -1) {
            contactData[contactData.findIndex((tmp) => tmp.id == value.id)].checked = false;
        }
        if (selectedContacts.findIndex((value) => value.id == value.id) == 0) {
            selectedContacts.shift()
        }
        else if (selectedContacts.findIndex((value) => value.id == value.id) == 1) {
            selectedContacts.pop()
        }
        setSelectedContacts(selectedContacts);
        console.log('cancel', selectedContacts)
        setRadioOnOff(!radioOnOff)
        props.onSelectContact(selectedContacts);
    }

    return (
        <View style={{ flex: 1, ...props.style}}>
            <View style={styles.selectedContactContainer}>
                {selectedContacts.map((value) =>
                    <View style={styles.selectedContactView}>
                        <Text style={styles.selectedContactNameText}>{value.name.split(' ')[0]} <Text style={{ fontFamily: Fonts.FiraSansMedium }}>{value.name.split(' ')[1]}</Text></Text>
                        <TouchableOpacity onPress={() => onCancel(value)}>
                            <AntDesign name="close" size={17} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 11 }}>
                    <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef}>
                        {contactData.map((value, index) =>
                            <TouchableOpacity onPress={() => onContactSelect(index)} style={styles.contactView} >
                                <RadioButton size={15} color={Colors.lightBlue} borderColor={Colors.borderColor} isChecked={value.checked} onpress={() => onContactSelect(index)} />
                                <Text style={styles.contactText}>
                                    {value.name.split(' ')[0]} <Text style={{ fontFamily: Fonts.FiraSansMedium }}>{value.name.split(' ')[1]}</Text>
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
                <View style={styles.contactIndexView}>
                    <TouchableOpacity onPress={() => { scrollViewRef.current.scrollTo({ x: 60, y: 60, animated: true }) }}>
                        <Text style={styles.contactIndexText}>#</Text>
                    </TouchableOpacity>
                    {alphabetsList.map((value) =>
                        <TouchableOpacity onPress={() => { scrollViewRef.current.scrollTo({ x: 60, y: 60, animated: true }) }}>
                            <Text style={styles.contactIndexText}>{value}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {selectedContacts.length >= 1 &&
                <TouchableOpacity onPress={()=>props.onPressContinue()} style={styles.bottomButtonView}>
                    <Text style={styles.buttonText}>Confirm & Proceed</Text>
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    buttonText: {
        color: Colors.white,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(13, 812)
    },
    bottomButtonView: {
        height: 50,
        width: wp('50%'),
        position: 'absolute',
        backgroundColor: Colors.blue,
        bottom: 0,
        left: wp('25%'),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: Colors.shadowBlue,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 10 },
        marginBottom: 20
    },
    selectedContactView: {
        width: wp('42%'),
        height: wp('12%'),
        backgroundColor: Colors.lightBlue,
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectedContactNameText: {
        color: Colors.white,
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansRegular
    },
    selectedContactContainer: {
        height: wp('20%'),
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        marginLeft: 20,
        marginRight: 20
    },
    contactView:{ 
        height: 50, 
        alignItems: 'center', 
        flexDirection: 'row', 
        marginLeft: 20, 
    },
    contactText:{ 
        marginLeft: 10, 
        fontSize: RFValue(13, 812), 
        fontFamily: Fonts.FiraSansRegular 
    },
    contactIndexText:{ 
        fontSize: RFValue(10, 812), 
        fontFamily: Fonts.FiraSansRegular 
    },
    contactIndexView:{ 
        flex: 0.5, 
        height: '100%', 
        justifyContent: 'space-evenly' 
    }
});