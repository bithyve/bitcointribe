import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView, StatusBar, TouchableOpacity, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize'
import FormStyles from '../../../../common/Styles/FormStyles'
import Colors from '../../../../common/Colors'
import Fonts from '../../../../common/Fonts'

export type Props = {
    navigation: any;
};

const SetupDonationAccount: React.FC<Props> = ({ navigation }: Props) => {
    const nameInputRef = useRef<Input>(null)
    const urlInputRef = useRef<Input>(null)
    const descInputRef = useRef<Input>(null)
    const [accountName, setAccountName] = useState('')
    const [youtubeUrl, setyoutubeUrl] = useState('')
    const [organisedBy, setOrganisedBy] = useState('')
    const [description, setDescription] = useState('')
    const [enable2FA, setEnable2FA] = useState(true)

    useEffect(() => {
        nameInputRef.current?.focus()
    }, [])
    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: Colors.offWhite
        }}>
            <StatusBar backgroundColor={'white'} barStyle="dark-content" />
            <KeyboardAvoidingView
                style={styles.rootContainer}
                behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity onPress={()=>navigation.pop()}>
                    <Icon name={'arrow-back-outline'} color={'#006DB4'} size={25} />
                </TouchableOpacity>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.titleWrapperView}>
                        <Text style={styles.titleText}>Setup Donation Account</Text>
                    </View>
                    <View style={styles.uploadImgParrentView}>
                        <TouchableOpacity style={styles.uploadImgWrapperView}>
                            <Icon name={'add-outline'} color={'#006DB4'} size={25} />
                            <Text style={styles.uploadImgText}>Upload Image</Text>
                        </TouchableOpacity>
                        <View style={{ width: '67%' }}>
                            <TextInput
                                style={[styles.textInputContainer, styles.descInputContainer]}
                                placeholder={'Enter donation name'}
                                placeholderTextColor={FormStyles.placeholderText.color}
                                underlineColorAndroid={'transparent'}
                                value={accountName}
                                maxLength={24}
                                numberOfLines={1}
                                textContentType="name"
                                onChangeText={setAccountName}
                                ref={nameInputRef}
                            />
                            <TextInput
                                style={[styles.textInputContainer, styles.descInputContainer]}
                                placeholder={'Organised by'}
                                placeholderTextColor={FormStyles.placeholderText.color}
                                underlineColorAndroid={'transparent'}
                                value={organisedBy}
                                numberOfLines={1}
                                textContentType="name"
                                onChangeText={setOrganisedBy}
                                ref={urlInputRef}
                            />
                        </View>
                    </View>
                    <View>
                        <TextInput
                            style={[styles.descInputContainer, { height: 50, marginVertical: 5 }]}
                            placeholder={'Paste youtube url'}
                            placeholderTextColor={FormStyles.placeholderText.color}
                            underlineColorAndroid={'transparent'}
                            value={youtubeUrl}
                            numberOfLines={1}
                            textContentType="URL"
                            onChangeText={setyoutubeUrl}
                            ref={urlInputRef}
                        />
                        <TextInput
                            style={[styles.descInputContainer, { height: 70, marginVertical: 5 }]}
                            placeholder={'Enter a description'}
                            placeholderTextColor={FormStyles.placeholderText.color}
                            underlineColorAndroid={'transparent'}
                            value={description}
                            numberOfLines={4}
                            textContentType="name"
                            onChangeText={setDescription}
                            ref={descInputRef}
                        />
                    </View>
                    <View style={styles.checkTwoFAuthView}>
                        <Icon name={'checkmark-circle'} color={enable2FA ? Colors.darkBlue : Colors.textColorGrey} size={25} onPress={() => setEnable2FA(!enable2FA)} />
                        <Text style={styles.checkTwoFAuthText}>Enable two factor authentication</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                        <Text style={styles.agreeTermsText}>By clicking proceed you agree to our</Text>
                        <TouchableOpacity>
                            <Text style={styles.termsAndConditionText}>&nbsp;Terms and Conditions</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.proceedBtnView}>
                        <Text style={styles.proceedBtnText}>Proceed</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        margin: 25
    },
    scrollContainer: {
        flex: 1
    },
    titleWrapperView: {
        marginVertical: 20
    },
    titleText: {
        fontSize: RFValue(25),
        color: Colors.darkBlue,
    },
    uploadImgParrentView: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 5
    },
    uploadImgWrapperView: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadImgText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11),
        marginTop: 10
    },
    textInputContainer: {
        marginVertical: 5,
        marginLeft: 10,
        height: 50,
    },
    descInputContainer: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.white,
        width: '100%',
        paddingHorizontal: 20,
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(12),
        textAlign: 'left',
    },
    inputText: {
        paddingHorizontal: 20,
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(12),
        textAlign: 'left',
    },
    checkTwoFAuthView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    checkTwoFAuthText: {
        marginLeft: 10,
        color: Colors.gray4,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(12),
    },
    agreeTermsText: {
        color: Colors.gray4,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(11),
    },
    termsAndConditionText: {
        color: Colors.darkBlue,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(11),
    },
    proceedBtnView: {
        backgroundColor: Colors.darkBlue,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
        borderRadius: 10,
        marginTop: 20,
        shadowColor: Colors.skyBlue,
        shadowOpacity: 0.8,
        elevation: 6,
    },
    proceedBtnText: {
        color: Colors.white,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(13),
    }
})

export default SetupDonationAccount
