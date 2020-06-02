import React, { useState, useEffect, useCallback, Component } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    ImageBackground,
    Platform,
    AsyncStorage,
    Linking,
    NativeModules,
    Alert,
} from 'react-native';
import CardView from 'react-native-cardview';
import Fonts from './../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import DeviceInfo from 'react-native-device-info';
import ToggleSwitch from '../components/ToggleSwitch';
import { RFValue } from 'react-native-responsive-fontsize';
import CommonStyles from '../common/Styles';
import NoInternetModalContents from '../components/NoInternetModalContents';
import TransparentHeaderModal from '../components/TransparentHeaderModal';
import CustodianRequestModalContents from '../components/CustodianRequestModalContents';
import CustodianRequestRejectedModalContents from '../components/CustodianRequestRejectedModalContents';
import MoreHomePageTabContents from '../components/MoreHomePageTabContents';
import SmallHeaderModal from '../components/SmallHeaderModal';
import HomePageShield from '../components/HomePageShield';
import AddModalContents from '../components/AddModalContents';
import QrCodeModalContents from '../components/QrCodeModalContents';
import FastBitcoinCalculationModalContents from '../components/FastBitcoinCalculationModalContents';
import AddContactsModalContents from '../components/AddContactsModalContents';
import SelectedContactFromAddressBook from '../components/SelectedContactFromAddressBook';
import SelectedContactFromAddressBookQrCode from '../components/SelectedContactFromAddressBookQrCode';
import { AppState } from 'react-native';
import {
    TEST_ACCOUNT,
    REGULAR_ACCOUNT,
    SECURE_ACCOUNT,
} from '../common/constants/serviceTypes';
import AllAccountsContents from '../components/AllAccountsContents';
import SettingsContents from '../components/SettingsContents';
import { connect } from 'react-redux';
import {
    downloadMShare,
    initHealthCheck,
    uploadRequestedShare,
    ErrorSending,
    ErrorReceiving,
    UploadSuccessfully,
} from '../store/actions/sss';
import moment from 'moment';
import {
    updateFCMTokens,
    fetchNotifications,
} from '../store/actions/notifications';
import { UsNumberFormat } from '../common/utilities';
import { getCurrencyImageByRegion } from '../common/CommonFunctions/index';
import ErrorModalContents from '../components/ErrorModalContents';
import ModalHeader from '../components/ModalHeader';
import TransactionDetails from './Accounts/TransactionDetails';
import Toast from '../components/Toast';
import firebase from 'react-native-firebase';
import NotificationListContent from '../components/NotificationListContent';
import { timeFormatter } from '../common/CommonFunctions/timeFormatter';
import Config from "react-native-config";
import RelayServices from '../bitcoin/services/RelayService';
import AddContactAddressBook from './Contacts/AddContactAddressBook';
import TrustedContactRequest from './Contacts/TrustedContactRequest';
import config from '../bitcoin/HexaConfig';
import TrustedContactsService from '../bitcoin/services/TrustedContactsService';
import { approveTrustedContact } from '../store/actions/trustedContacts';
import MessageAsPerHealth from '../components/home/messgae-health';
import TransactionsContent from '../components/home/transaction-content';
import SaveBitcoinModalContents from './FastBitcoin/SaveBitcoinModalContents';
import HomeList from '../components/home/home-list';
import HomeHeader from '../components/home/home-header';
import idx from 'idx';
import CustomBottomTabs from '../components/home/custom-bottom-tabs';


const initialCardData = [
    {
        id: 1,
        title: 'Test Account',
        unit: 't-sats',
        amount: '400,000',
        account: `Learn Bitcoin`,
        accountType: 'test',
        bitcoinicon: require('../assets/images/icons/icon_bitcoin_gray.png'),
    },
    {
        id: 2,
        title: 'Savings Account',
        unit: 'sats',
        amount: '60,000',
        account: 'Multi-factor security',
        accountType: 'secure',
        bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
    },
    {
        id: 3,
        title: 'Checking Account',
        unit: 'sats',
        amount: '5,000',
        account: 'Fast and easy',
        accountType: 'regular',
        bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
    },
    {
        id: 4,
        title: 'Add Account',
        unit: '',
        amount: '',
        account: '',
        accountType: 'add',
        bitcoinicon: require('../assets/images/icons/icon_add.png'),
    },
]


const initialTransactionData = [
    {
        title: 'Spending accounts',
        date: '30 November 2019',
        time: '11:00 am',
        price: '0.025',
        transactionStatus: 'send',
    },
    {
        title: 'Spending accounts',
        date: '1 November 2019',
        time: '11:00 am',
        price: '0.015',
        transactionStatus: 'receive',
    },
    {
        title: 'Spending accounts',
        date: '30 Jully 2019',
        time: '10:00 am',
        price: '0.125',
        transactionStatus: 'receive',
    },
    {
        title: 'Saving accounts',
        date: '1 June 2019',
        time: '12:00 am',
        price: '0.5',
        transactionStatus: 'receive',
    },
    {
        title: 'Saving accounts',
        date: '11 May 2019',
        time: '1:00 pm',
        price: '0.1',
        transactionStatus: 'send',
    },
    {
        title: 'Spending accounts',
        date: '30 November 2019',
        time: '11:00 am',
        price: '0.025',
        transactionStatus: 'send',
    },
    {
        title: 'Spending accounts',
        date: '1 November 2019',
        time: '11:00 am',
        price: '0.015',
        transactionStatus: 'receive',
    },
    {
        title: 'Spending accounts',
        date: '30 Jully 2019',
        time: '10:00 am',
        price: '0.125',
        transactionStatus: 'receive',
    },
    {
        title: 'Saving accounts',
        date: '1 June 2019',
        time: '12:00 am',
        price: '0.5',
        transactionStatus: 'receive',
    },
    {
        title: 'Saving accounts',
        date: '12 May 2019',
        time: '1:00 pm',
        price: '0.1',
        transactionStatus: 'send',
    },
]


const getIconByAccountType = (type) => {
    if (type == 'saving') {
        return require('../assets/images/icons/icon_regular.png');
    } else if (type == 'regular') {
        return require('../assets/images/icons/icon_regular.png');
    } else if (type == 'secure') {
        return require('../assets/images/icons/icon_secureaccount.png');
    } else if (type == 'test') {
        return require('../assets/images/icons/icon_test.png');
    } else {
        return require('../assets/images/icons/icon_test.png');
    }
}


const TransactionHeader = ({ openCloseModal }) => {
    return (
        <TouchableOpacity
            activeOpacity={10}
            onPress={() => openCloseModal()}
            style={styles.modalHeaderContainer}
        >
            <View style={styles.modalHeaderHandle} />
            <Text style={styles.modalHeaderTitleText}>{'Transactions'}</Text>
        </TouchableOpacity>
    );
}


const TrustedContactRequestContent = ({ trustedContactRequest, recoveryRequest, onPressAccept, onPressReject, onPhoneNumberChange }) => {
    if (!trustedContactRequest && !recoveryRequest) return;
    let {
        requester,
        hintType,
        hint,
        isGuardian,
        isQR,
        isRecovery,
    } = trustedContactRequest || recoveryRequest;

    return (
        <TrustedContactRequest
            isQR={isQR}
            inputType={
                hintType === 'num' ? 'phone' : hintType === 'ema' ? 'email' : null
            }
            isGuardian={isGuardian}
            isRecovery={isRecovery}
            hint={hint}
            trustedContactName={requester}
            onPressAccept={(key) => onPressAccept(key)}
            onPressReject={() => {
                onPressReject()
            }}
            onPhoneNumberChange={(text) => {
                onPhoneNumberChange(text)
            }}
        />
    );
}





interface HomeStateTypes {
    notificationData?: any[],
    cardData?: any[],
    switchOn: boolean,
    CurrencyCode: string,
    balances: any,
    selectedBottomTab: string,
    transactions: any[],
    modalData: any,
    knowMoreBottomSheetsFlag: boolean,
    qrBottomSheetsFlag: boolean,
    addBottomSheetFlag: boolean,
    tabBarIndex: number,
    addSubBottomSheetsFlag: boolean,
    selectToAdd: string,
    openModal: string,
    atCloseEnd: boolean,
    loading: false,
    secondaryDeviceOtp: any,
    selectedTransactionItem: any,
    deepLinkModalOpen: boolean,
    currencyCode: string,
    errorMessageHeader: string,
    errorMessage: string,
    buttonText: string,
    familyAndFriendsBookBottomSheetsFlag: boolean,
    selectedContact: any[],
    notificationDataChange: boolean

}

interface HomePropsTypes {
    navigation: any,
    notificationList: any[],
    exchangeRates: any[],
    accounts: any[],
    walletName: string,
    UNDER_CUSTODY: any
}

class HomeUpdated extends Component<HomePropsTypes, HomeStateTypes>{
    constructor(props) {
        super(props);
        this.state = {
            notificationData: [],
            cardData: [],
            switchOn: false,
            CurrencyCode: 'USD',
            balances: null,
            qrBottomSheetsFlag: false,
            selectedBottomTab: 'Transactions',
            transactions: [],
            knowMoreBottomSheetsFlag: false,
            modalData: initialTransactionData,
            addBottomSheetFlag: false,
            tabBarIndex: 999,
            addSubBottomSheetsFlag: false,
            selectToAdd: 'buyBitcoins',
            openModal: 'closed',
            atCloseEnd: false,
            loading: false,
            secondaryDeviceOtp: {},
            selectedTransactionItem: null,
            deepLinkModalOpen: false,
            currencyCode: 'USD',
            errorMessageHeader: '',
            errorMessage: '',
            buttonText: '',
            familyAndFriendsBookBottomSheetsFlag: false,
            selectedContact: [],
            notificationDataChange: false
        }
    }


    onPressNotifications = () => {
        null
    }


    getQrCodeData = (qrData) => {
        const { navigation } = this.props
        const scannedData = JSON.parse(qrData);
        switch (scannedData.type) {
            case 'trustedGuardian':
                const trustedGruardianRequest = {
                    isGuardian: scannedData.isGuardian,
                    requester: scannedData.requester,
                    publicKey: scannedData.publicKey,
                    uploadedAt: scannedData.uploadedAt,
                    type: scannedData.type,
                    isQR: true,
                    v: scannedData.v || ""
                };
                this.setState({
                    loading: false,
                    secondaryDeviceOtp: trustedGruardianRequest
                }, () => {
                    navigation.navigate('Home', {
                        trustedContactRequest: trustedGruardianRequest,
                    });
                })
                return

            case 'secondaryDeviceGuardian':
                const secondaryDeviceGuardianRequest = {
                    isGuardian: scannedData.isGuardian,
                    requester: scannedData.requester,
                    publicKey: scannedData.publicKey,
                    uploadedAt: scannedData.uploadedAt,
                    type: scannedData.type,
                    isQR: true,
                    v: scannedData.v || ""
                };

                this.setState({
                    loading: false,
                    secondaryDeviceOtp: secondaryDeviceGuardianRequest
                })
                navigation.navigate('Home', {
                    trustedContactRequest: secondaryDeviceGuardianRequest,
                });
                break;

            case 'recoveryQR':
                const recoveryRequest = {
                    isRecovery: true,
                    requester: scannedData.requester,
                    rk: scannedData.KEY,
                    isQR: true,
                    v: scannedData.v || ""
                };

                this.setState({
                    loading: false
                })
                navigation.navigate('Home', { recoveryRequest });
            default:
                break;
        }
    };

    updateAccountCardData = () => {
        let newArrayFinal = [];
        let tempArray = [];
        for (let a = 0; a < initialCardData.length; a++) {
            tempArray.push(initialCardData[a]);
            if (
                tempArray.length == 2 ||
                initialCardData[initialCardData.length - 1].id == tempArray[0].id
            ) {
                newArrayFinal.push(tempArray);
                tempArray = [];
            }
        }
        if (newArrayFinal) {
            this.setState({
                cardData: newArrayFinal
            })
        }
    };


    componentDidMount = () => {
        this.updateAccountCardData()
        this.getBalances()
    };

    getBalances = () => {
        const { accounts } = this.props
        const testBalance = accounts[TEST_ACCOUNT].service
            ? accounts[TEST_ACCOUNT].service.hdWallet.balances.balance +
            accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
            : 0;
        const regularBalance = accounts[REGULAR_ACCOUNT].service
            ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
            accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
            : 0;
        const secureBalance = accounts[SECURE_ACCOUNT].service
            ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
            accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
                .unconfirmedBalance
            : 0;
        const accumulativeBalance = regularBalance + secureBalance;

        const testTransactions = accounts[TEST_ACCOUNT].service
            ? accounts[TEST_ACCOUNT].service.hdWallet.transactions.transactionDetails
            : [];
        const regularTransactions = accounts[REGULAR_ACCOUNT].service
            ? accounts[REGULAR_ACCOUNT].service.hdWallet.transactions
                .transactionDetails
            : [];

        const secureTransactions = accounts[SECURE_ACCOUNT].service
            ? accounts[SECURE_ACCOUNT].service.secureHDWallet.transactions
                .transactionDetails
            : [];
        const accumulativeTransactions = [
            ...testTransactions,
            ...regularTransactions,
            ...secureTransactions,
        ];
        if (accumulativeTransactions.length) {
            accumulativeTransactions.sort(function (left, right) {
                return moment.utc(right.date).unix() - moment.utc(left.date).unix();
            });
        }


        this.setState({
            balances: {
                testBalance,
                regularBalance,
                secureBalance,
                accumulativeBalance,
            },
            transactions: accumulativeTransactions
        })

    }



    onPressSettingsElements = async (type, currencycode) => {
        const { navigation } = this.props
        if (type == 'ManagePin') {
            return navigation.navigate('SettingManagePin', {
                managePinSuccessProceed: (pin) => this.managePinSuccessProceed(pin),
            });
        } else if (type == 'ChangeCurrency') {
            let currency = await AsyncStorage.getItem('currencyCode');
            navigation.navigate('ChangeCurrency');
            this.setState({
                currencyCode: currency
            })
        } else if (type == 'ChangeWalletName') {
            navigation.navigate('SettingWalletNameChange');
        }
    };

    managePinSuccessProceed = (pin) => {
        this.setState({
            tabBarIndex: 999
        }, () => {
            (this.refs.settingsBottomSheet as any).snapTo(0);
        })

    };


    onNotificationListOpen = async () => {
        let asyncNotificationList = JSON.parse(
            await AsyncStorage.getItem('notificationList'),
        );
        if (asyncNotificationList) {
            for (let i = 0; i < asyncNotificationList.length; i++) {
                if (asyncNotificationList[i]) {
                    asyncNotificationList[i].time = timeFormatter(
                        moment(new Date()),
                        moment(asyncNotificationList[i].date).valueOf(),
                    );
                }
            }
            await AsyncStorage.setItem(
                'notificationList',
                JSON.stringify(asyncNotificationList),
            );
            asyncNotificationList.sort(function (left, right) {
                return moment.utc(right.date).unix() - moment.utc(left.date).unix();
            });

            this.setState({
                notificationData: asyncNotificationList,
                notificationDataChange: !this.state.notificationDataChange
            })

        }
    };

    onTrustedContactRequestAccept = (key) => {
        const { navigation, UNDER_CUSTODY } = this.props
        const recoveryRequest = navigation.getParam('recoveryRequest');
        const custodyRequest = navigation.getParam('custodyRequest');
        const trustedContactRequest = navigation.getParam(
            'trustedContactRequest',
        );
        if (!trustedContactRequest && !recoveryRequest) return;
        let {
            requester,
            hintType,
            hint,
            isGuardian,
            encryptedKey,
            publicKey,
            isQR,
            uploadedAt,
            isRecovery,
        } = trustedContactRequest || recoveryRequest;

        this.setState({
            tabBarIndex: 999,
            deepLinkModalOpen: false
        })

        if (!isRecovery) {
            if (Date.now() - uploadedAt > 600000) {
                Alert.alert(
                    `${isQR ? 'QR' : 'Link'} expired!`,
                    `Please ask the sender to initiate a new ${
                    isQR ? 'QR' : 'Link'
                    }`,
                );

                this.setState({
                    loading: false
                })
            } else {
                if (isGuardian && UNDER_CUSTODY[requester]) {
                    Alert.alert(
                        'Failed to store',
                        'You cannot custody multiple shares of the same user.',
                    );
                    this.setState({
                        loading: false
                    })
                } else {
                    if (!publicKey) {
                        try {
                            publicKey = TrustedContactsService.decryptPub(
                                encryptedKey,
                                key,
                            ).decryptedPub;
                        } catch (err) {
                            console.log({ err });
                            Alert.alert('Decryption Failed', err.message);
                        }
                    }
                    if (publicKey) {
                        // navigation.navigate('ContactsListForAssociateContact', {
                        //     postAssociation: (contact) => {
                        //         const contactName = `${contact.firstName} ${
                        //             contact.lastName ? contact.lastName : ''
                        //             }`.toLowerCase();
                        //         if (isGuardian) {
                        //             dispatch(
                        //                 approveTrustedContact(
                        //                     contactName,
                        //                     publicKey,
                        //                     true,
                        //                     requester,
                        //                 ),
                        //             );
                        //         } else {
                        //             dispatch(
                        //                 approveTrustedContact(contactName, publicKey, true),
                        //             );
                        //         }
                        //     },
                        //     isGuardian,
                        // });
                    }
                }
            }
        } else {
            if (!UNDER_CUSTODY[requester]) {
                Alert.alert(
                    'Failed to send!',
                    'You do not host any secret for this user.',
                );
                this.setState({
                    loading: false
                })
            } else {
                const decryptedKey = TrustedContactsService.decryptPub(
                    encryptedKey,
                    key,
                ).decryptedPub;
                // dispatch(
                //     uploadRequestedShare(recoveryRequest.requester, decryptedKey),
                // );
            }
        }
    }

    onTrustedContactRejct = () => {

    }

    onPhoneNumberChange = () => {

    }

    selectTab = (tabTitle) => {
        if (tabTitle == 'More') {
            this.setState({
                knowMoreBottomSheetsFlag: true,
                selectedBottomTab: tabTitle
            }, () => {
                (this.refs.transactionTabBarBottomSheet as any).snapTo(0);
                (this.refs.addTabBarBottomSheet as any).snapTo(0);
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
                (this.refs.moreTabBarBottomSheet as any).snapTo(2);
            })
            return
        }
        if (tabTitle == 'Transactions') {
            this.setState({
                modalData: initialTransactionData,
                selectedBottomTab: tabTitle
            }, () => {
                (this.refs.transactionTabBarBottomSheet as any).snapTo(2);
                (this.refs.addTabBarBottomSheet as any).snapTo(0);
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
                (this.refs.moreTabBarBottomSheet as any).snapTo(0);
            })
            return
        }
        if (tabTitle == 'Add') {
            this.setState({
                addBottomSheetFlag: true,
                modalData: [],
                selectedBottomTab: tabTitle
            }, () => {
                (this.refs.transactionTabBarBottomSheet as any).snapTo(0);
                (this.refs.addTabBarBottomSheet as any).snapTo(2);
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
                (this.refs.moreTabBarBottomSheet as any).snapTo(0);
            })
            return
        }
        if (tabTitle == 'QR') {

            this.setState({
                modalData: initialTransactionData,
                selectedBottomTab: tabTitle
            }, () => {
                (this.refs.transactionTabBarBottomSheet as any).snapTo(0);
                (this.refs.addTabBarBottomSheet as any).snapTo(0);
                (this.refs.qrTabBarBottomSheet as any).snapTo(2);
                (this.refs.moreTabBarBottomSheet as any).snapTo(0);
            })
            return
        }
    }

    openCloseModal = () => {
        const { openModal } = this.state
        if (openModal === 'closed') {
            this.setState({
                openModal: 'half'
            })
        }
        if (openModal === 'half') {
            this.setState({
                openModal: 'full'
            })
        }
        if (openModal === 'full') {
            this.setState({
                openModal: 'closed'
            })
        }
    }

    onNotificationClicked = async (value) => {
        let asyncNotifications = JSON.parse(
            await AsyncStorage.getItem('notificationList'),
        );
        const { notificationData } = this.state
        const { navigation } = this.props
        let tempNotificationData = notificationData;
        for (let i = 0; i < tempNotificationData.length; i++) {
            const element = tempNotificationData[i];
            if (element.notificationId == value.notificationId) {
                if (
                    asyncNotifications &&
                    asyncNotifications.length &&
                    asyncNotifications.findIndex(
                        (item) => item.notificationId == value.notificationId,
                    ) > -1
                ) {
                    asyncNotifications[
                        asyncNotifications.findIndex(
                            (item) => item.notificationId == value.notificationId,
                        )
                    ].read = true;
                }
                tempNotificationData[i].read = true;
            }
        }
        await AsyncStorage.setItem(
            'notificationList',
            JSON.stringify(asyncNotifications),
        );

        this.setState({
            notificationData: tempNotificationData,
            notificationDataChange: !this.state.notificationDataChange
        })

        if (value.type == 'release') {
            RelayServices.fetchReleases(value.info.split(' ')[1])
                .then(async (res) => {
                    if (res.data.releases.length) {
                        let releaseNotes = res.data.releases.length
                            ? res.data.releases.find((el) => {
                                return el.build === value.info.split(' ')[1];
                            })
                            : '';
                        navigation.navigate('UpdateApp', {
                            releaseData: [releaseNotes],
                            isOpenFromNotificationList: true,
                            releaseNumber: value.info.split(' ')[1],
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };


    onPressElement = (item) => {
        const { navigation } = this.props
        if (item.title == 'Backup Health') {
            navigation.navigate('ManageBackup');
        }
        if (item.title == 'Address Book') {
            navigation.navigate('AddressBookContents');
        } else if (item.title == 'Wallet Settings') {
            this.setState({
                tabBarIndex: 0
            })
            // (settingsBottomSheet as any).current.snapTo(1);
        }
    };


    render() {
        const {
            cardData,
            switchOn,
            CurrencyCode,
            transactions,
            balances,
            selectedBottomTab,
            modalData,
            qrBottomSheetsFlag,
            selectedTransactionItem,
            tabBarIndex,
            deepLinkModalOpen,
            knowMoreBottomSheetsFlag,
            addBottomSheetFlag,
            errorMessageHeader,
            errorMessage,
            buttonText,
            addSubBottomSheetsFlag,
            selectedContact,
            familyAndFriendsBookBottomSheetsFlag,
            notificationData
        } = this.state
        const { navigation, notificationList, exchangeRates, accounts, walletName } = this.props
        const trustedContactRequest = navigation.getParam(
            'trustedContactRequest',
        );
        const recoveryRequest = navigation.getParam('recoveryRequest');
        const custodyRequest = navigation.getParam('custodyRequest');
        return (
            <ImageBackground
                source={require('../assets/images/home-bg.png')}
                style={{ width: '100%', height: '100%', flex: 1 }}
                imageStyle={{ resizeMode: 'stretch' }}
            >
                <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
                <View
                    style={{
                        flex: 3.8,
                        paddingTop:
                            Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp('5%') : 0,
                    }}
                >
                    <HomeHeader
                        onPressNotifications={this.onPressNotifications}
                        notificationData={notificationList}
                        walletName={walletName}
                        switchOn={false}
                        getCurrencyImageByRegion={getCurrencyImageByRegion}
                        balances={null}
                        exchangeRates={null}
                        CurrencyCode={'USD'}
                        navigation={this.props.navigation}
                        overallHealth={null}
                    />
                </View>

                <View style={{ flex: 7 }}>
                    <View style={styles.cardViewContainer}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={cardData}
                            // extraData={{ balances, switchOn, walletName }}
                            renderItem={(Items) =>
                                <HomeList
                                    Items={Items}
                                    navigation={navigation}
                                    getIconByAccountType={getIconByAccountType}
                                    switchOn={switchOn}
                                    accounts={accounts}
                                    CurrencyCode={CurrencyCode}
                                    balances={balances}
                                    exchangeRates={exchangeRates}
                                />
                            }
                        />
                    </View>
                </View>

                <CustomBottomTabs tabBarZIndex={999} selectTab={this.selectTab} selected={'Transactions'} />

                <BottomSheet
                    onOpenEnd={() => {
                        this.setState({
                            atCloseEnd: true
                        })

                    }}
                    onCloseEnd={() => {
                        this.setState({
                            qrBottomSheetsFlag: false
                        }, () => {
                            if (this.state.selectedBottomTab == 'Transactions') { (this.refs.transactionTabBarBottomSheet as any).snapTo(1) };
                        })

                    }}
                    onCloseStart={() => {
                        this.setState({
                            qrBottomSheetsFlag: false,
                            atCloseEnd: false
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"transactionTabBarBottomSheet"}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch()
                            ? hp('18%')
                            : Platform.OS == 'android'
                                ? hp('19%')
                                : hp('18%'),
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('64%'),
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
                    ]}
                    renderContent={() => (
                        <TransactionsContent
                            transactions={transactions}
                            AtCloseEnd={null}
                            setTransactionItem={(item) => this.setState({ selectedTransactionItem: item })}
                            setTabBarZIndex={null}
                            TransactionDetailsBottomSheet={this.refs.transactionTabBarBottomSheet}
                        />
                    )}
                    renderHeader={() => <TransactionHeader openCloseModal={null} />}
                />



                <BottomSheet
                    ref="addTabBarBottomSheet"
                    onCloseEnd={() => {
                        this.setState({
                            qrBottomSheetsFlag: false
                        })

                        if (selectedBottomTab == 'Add') {
                            (this.refs.addTabBarBottomSheet as any).snapTo(1);
                        }
                    }}
                    onCloseStart={() => {
                        this.setState({
                            qrBottomSheetsFlag: false
                        })
                    }}
                    enabledInnerScrolling={true}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch()
                            ? hp('18%')
                            : Platform.OS == 'android'
                                ? hp('19%')
                                : hp('18%'),
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('64%'),
                    ]}
                    renderContent={() => <AddModalContents
                        onPressElements={(type) => {
                            if (type == 'buyBitcoins') {
                                this.setState({
                                    addBottomSheetFlag: true,
                                    tabBarIndex: 0,
                                    selectToAdd: type
                                }, () => {
                                    (this.refs.addBottomSheet as any).snapTo(1);
                                })

                            } else if (type == 'addContact') {
                                this.setState({
                                    addSubBottomSheetsFlag: true,
                                    addBottomSheetFlag: false,
                                    tabBarIndex: 0,
                                    selectToAdd: type
                                }, () => (this.refs.addTabBarBottomSheet as any).snapTo(1))
                            }
                        }}
                        addData={modalData}
                    />}
                    renderHeader={() => <TouchableOpacity
                        activeOpacity={10}
                        onPress={this.openCloseModal}
                        style={styles.modalHeaderContainer}
                    >
                        <View style={styles.modalHeaderHandle} />
                        <Text style={styles.modalHeaderTitleText}>{'Add'}</Text>
                    </TouchableOpacity>}
                />

                <BottomSheet
                    ref="qrTabBarBottomSheet"
                    onOpenEnd={() => {
                        this.setState({
                            qrBottomSheetsFlag: selectedBottomTab === 'QR'
                        })
                    }}
                    onCloseEnd={() => {
                        this.setState({
                            qrBottomSheetsFlag: false
                        }, () => {
                            if (selectedBottomTab === 'QR') {
                                (this.refs.qrTabBarBottomSheet as any).snapTo(1)
                            }
                        })
                    }}
                    onCloseStart={() => {
                        this.setState({
                            qrBottomSheetsFlag: false
                        })
                    }}
                    enabledInnerScrolling={true}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch()
                            ? hp('18%')
                            : Platform.OS == 'android'
                                ? hp('19%')
                                : hp('18%'),
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
                    ]}
                    renderContent={() => <QrCodeModalContents
                        modalRef={this.refs.qrTabBarBottomSheet}
                        isOpenedFlag={qrBottomSheetsFlag}
                        onQrScan={(qrData) => this.getQrCodeData(qrData)}
                        onPressQrScanner={() => {
                            navigation.navigate('QrScanner', {
                                scanedCode: this.getQrCodeData,
                            });
                        }}
                    />}
                    renderHeader={() => <TouchableOpacity
                        activeOpacity={10}
                        onPress={this.openCloseModal}
                        style={styles.modalHeaderContainer}
                    >
                        <View style={styles.modalHeaderHandle} />
                        <Text style={styles.modalHeaderTitleText}>{'QR'}</Text>
                    </TouchableOpacity>}
                />

                <BottomSheet
                    onCloseEnd={() => {
                        this.setState({
                            qrBottomSheetsFlag: false
                        }, () => {
                            if (selectedBottomTab == 'More') { (this.refs.moreTabBarBottomSheet as any).snapTo(1) };
                        })

                    }}
                    onCloseStart={() => {
                        this.setState({
                            qrBottomSheetsFlag: false
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"moreTabBarBottomSheet"}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch()
                            ? hp('18%')
                            : Platform.OS == 'android'
                                ? hp('19%')
                                : hp('18%'),
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('64%'),
                    ]}
                    renderContent={() => <MoreHomePageTabContents
                        onPressElements={(item) => this.onPressElement(item)}
                    />}
                    renderHeader={() => <TouchableOpacity
                        activeOpacity={10}
                        onPress={() => this.openCloseModal()}
                        style={styles.modalHeaderContainer}
                    >
                        <View style={styles.modalHeaderHandle} />
                        <Text style={styles.modalHeaderTitleText}>{'More'}</Text>
                    </TouchableOpacity>}
                />

                <BottomSheet
                    onCloseEnd={() => {
                        this.setState({
                            tabBarIndex: 999
                        })

                    }}
                    enabledInnerScrolling={true}
                    ref={"noInternetBottomSheet"}
                    snapPoints={[-50, hp('60%')]}
                    renderContent={() => <NoInternetModalContents
                        onPressTryAgain={() => { }}
                        onPressIgnore={() => {
                            (this.refs.noInternetBottomSheet as any).snapTo(0)
                        }}
                    />}
                    renderHeader={() => <TransparentHeaderModal
                        onPressheader={() => {
                            this.setState({
                                tabBarIndex: 999
                            }, () => (this.refs.noInternetBottomSheet as any).snapTo(0))
                        }}
                    />}
                />

                {/* // TODO need to integrate custodian modal */}
                {/* <BottomSheet
                    onCloseEnd={() => {
                        if (tabBarIndex === 0 && !deepLinkModalOpen) {
                            this.setState({
                                tabBarIndex: 999
                            })
                        }
                    }}
                    onOpenEnd={() => {
                        if (tabBarIndex == 999) {
                            this.setState({
                                tabBarIndex: 0
                            })
                        }
                        this.setState({
                            deepLinkModalOpen: true
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"custodianRequestBottomSheet"}
                    snapPoints={[-50, hp('60%')]}
                    renderContent={renderCustodianRequestModalContent}
                    renderHeader={renderCustodianRequestModalHeader}
                /> */}
                <BottomSheet
                    onCloseEnd={() => {
                        if (tabBarIndex === 0 && !deepLinkModalOpen) {
                            this.setState({
                                tabBarIndex: 999
                            })
                        }
                    }}
                    onOpenEnd={() => {
                        if (tabBarIndex === 999) {
                            this.setState({
                                tabBarIndex: 0
                            })
                        }
                        this.setState({
                            deepLinkModalOpen: true
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"trustedContactRequestBottomSheet"}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('70%'),
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('95%') : hp('95%'),
                    ]}
                    renderContent={() => {
                        if (!trustedContactRequest && !recoveryRequest) { return };

                        return (<TrustedContactRequestContent
                            trustedContactRequest={trustedContactRequest}
                            recoveryRequest={recoveryRequest}
                            onPressAccept={this.onTrustedContactRequestAccept}
                            onPressReject={this.onTrustedContactRejct}
                            onPhoneNumberChange={this.onPhoneNumberChange}
                        />)
                    }
                    }
                    renderHeader={() => <ModalHeader
                        onPressHeader={() => {
                            this.setState({
                                tabBarIndex: 999,
                                deepLinkModalOpen: false
                            }, () => {
                                (this.refs.trustedContactRequestBottomSheet as any).snapTo(0)
                            })
                        }}
                    />}
                />

                <BottomSheet
                    onCloseStart={() => {
                        this.setState({
                            tabBarIndex: 999
                        })
                    }}
                    onOpenEnd={() => {
                        this.setState({
                            tabBarIndex: 0
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"custodianRequestRejectedBottomSheet"}
                    snapPoints={[-50, hp('60%')]}
                    renderContent={() => {
                        if (!custodyRequest) return null;
                        return (
                            <CustodianRequestRejectedModalContents
                                onPressViewThrustedContacts={() => {
                                    this.setState({
                                        tabBarIndex: 999
                                    }, () => {
                                        (this.refs.custodianRequestRejectedBottomSheet as any).snapTo(0);
                                    })
                                }}
                                userName={custodyRequest.requester}
                            />
                        );
                    }}
                    renderHeader={() => <TransparentHeaderModal
                        onPressheader={() => {
                            this.setState({
                                tabBarIndex: 999
                            }, () => (this.refs.custodianRequestRejectedBottomSheet as any).snapTo(0))
                        }}
                    />}
                />
                {
                    knowMoreBottomSheetsFlag ?
                        <BottomSheet
                            onOpenEnd={() => {
                                if (!deepLinkModalOpen) {
                                    this.setState({
                                        tabBarIndex: 0
                                    })

                                }
                            }}
                            onCloseEnd={() => {
                                if (!deepLinkModalOpen) {
                                    this.setState({
                                        tabBarIndex: 999
                                    })
                                }
                            }}
                            enabledInnerScrolling={true}
                            ref={"allAccountsBottomSheet"}
                            snapPoints={[
                                -50,
                                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                                    ? hp('65%')
                                    : hp('64%'),
                            ]}
                            renderContent={() => <AllAccountsContents
                                onPressBack={() => {

                                    this.setState({
                                        tabBarIndex: 999
                                    }, () => (this.refs.allAccountsBottomSheet as any).snapTo(0))

                                }}
                            />}
                            renderHeader={() => <SmallHeaderModal
                                borderColor={Colors.white}
                                backgroundColor={Colors.white}
                                onPressHeader={() => {
                                    this.setState({
                                        tabBarIndex: 999
                                    }, () => (this.refs.allAccountsBottomSheet as any).snapTo(0))
                                }}
                            />}
                        />
                        : null
                }

                <BottomSheet
                    enabledInnerScrolling={true}
                    onCloseEnd={() => {
                        this.setState({
                            tabBarIndex: 999
                        })
                    }}
                    onCloseStart={() => {
                        this.setState({
                            tabBarIndex: 999
                        })
                    }}
                    onOpenEnd={() => {

                        this.setState({
                            tabBarIndex: 0
                        })
                    }}
                    ref={"transactionDetailsBottomSheet"}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
                    ]}
                    renderContent={() => <TransactionDetails
                        item={selectedTransactionItem}
                        onPressKnowMore={() => {
                            (this.refs.transactionDetailsBottomSheet as any).snapTo(1);
                        }}
                    />}
                    renderHeader={() => <SmallHeaderModal
                        borderColor={Colors.white}
                        backgroundColor={Colors.white}
                        onPressHeader={() => {
                            if (this.refs.transactionDetailsBottomSheet)
                                (this.refs.transactionDetailsBottomSheet as any).snapTo(0);
                        }}
                    />}
                />

                {
                    knowMoreBottomSheetsFlag ? (
                        <BottomSheet
                            onOpenEnd={() => {
                                if (!deepLinkModalOpen) {
                                    this.setState({
                                        tabBarIndex: 0
                                    })
                                }
                            }}
                            onCloseEnd={() => {
                                if (!deepLinkModalOpen) {
                                    this.setState({
                                        tabBarIndex: 999
                                    })
                                }
                            }}
                            enabledInnerScrolling={true}
                            ref={"settingsBottomSheet"}
                            snapPoints={[
                                -50,
                                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                                    ? hp('65%')
                                    : hp('64%'),
                            ]}
                            renderContent={() => <SettingsContents
                                currencyCode={CurrencyCode}
                                onPressManagePin={(type, currencycode) =>
                                    this.onPressSettingsElements(type, currencycode)
                                }
                                onPressBack={() => {

                                    this.setState({
                                        tabBarIndex: 999
                                    }, () => {
                                        (this.refs.settingsBottomSheet as any).snapTo(0);
                                    })
                                }}
                            />}
                            renderHeader={() => <SmallHeaderModal
                                borderColor={Colors.white}
                                backgroundColor={Colors.white}
                                onPressHeader={() => {
                                    this.setState({
                                        tabBarIndex: 999
                                    }, () => (this.refs.settingsBottomSheet as any).snapTo(0))
                                }}
                            />}
                        />
                    ) : null
                }


                {
                    addBottomSheetFlag ? (
                        <BottomSheet
                            onOpenEnd={() => {
                                if (!deepLinkModalOpen) {
                                    this.setState({
                                        tabBarIndex: 0
                                    })
                                }
                            }}
                            onCloseEnd={() => {
                                if (!deepLinkModalOpen) {
                                    this.setState({
                                        tabBarIndex: 999
                                    })
                                }

                                this.setState({
                                    addBottomSheetFlag: false
                                })

                            }}
                            enabledInnerScrolling={true}
                            ref={"addBottomSheet"}
                            snapPoints={[
                                -50,
                                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                                    ? hp('65%')
                                    : hp('64%'),
                            ]}
                            renderContent={() => <AddModalContents
                                onPressElements={(type) => {
                                    if (type == 'buyBitcoins') {
                                        this.setState({
                                            addBottomSheetFlag: true,
                                            tabBarIndex: 0,
                                            selectToAdd: type
                                        }, () => {
                                            (this.refs.addBottomSheet as any).snapTo(1);
                                        })

                                    } else if (type == 'addContact') {
                                        this.setState({
                                            addSubBottomSheetsFlag: true,
                                            addBottomSheetFlag: false,
                                            tabBarIndex: 0,
                                            selectToAdd: type
                                        }, () => (this.refs.addTabBarBottomSheet as any).snapTo(1))
                                    }
                                }}
                                addData={modalData}
                            />}
                            renderHeader={() => <ModalHeader
                                onPressHeader={() => {
                                    this.setState({
                                        addSubBottomSheetsFlag: false,
                                        tabBarIndex: 999
                                    }, () => {
                                        (this.refs.addBottomSheet as any).snapTo(0);
                                    })
                                }}
                            />}
                        />
                    ) : null
                }


                <BottomSheet
                    onOpenEnd={() => {
                        this.setState({
                            tabBarIndex: 0
                        })
                    }}
                    onCloseEnd={() => {
                        this.setState({
                            tabBarIndex: 999
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"errorBottomSheet"}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
                    ]}
                    renderContent={() => <ErrorModalContents
                        modalRef={this.refs.errorBottomSheet}
                        title={errorMessageHeader}
                        info={errorMessage}
                        proceedButtonText={buttonText}
                        onPressProceed={() => {
                            this.setState({
                                tabBarIndex: 999
                            }, () => {
                                (this.refs.errorBottomSheet as any).snapTo(0);
                            })
                        }}
                        isBottomImage={true}
                        bottomImage={require('../assets/images/icons/errorImage.png')}
                    />}
                    renderHeader={() => <ModalHeader
                        onPressHeader={() => {
                            this.setState({
                                tabBarIndex: 999
                            }, () => (this.refs.errorBottomSheet as any).snapTo(0))
                        }}
                    />}
                />

                {
                    addSubBottomSheetsFlag ? (
                        <BottomSheet
                            onOpenEnd={() => {
                                this.setState({
                                    tabBarIndex: 0
                                })
                            }}
                            enabledInnerScrolling={true}
                            ref={"fastBitcoinRedeemCalculationBottomSheet"}
                            snapPoints={[
                                -50,
                                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                                    ? hp('90%')
                                    : hp('90%'),
                                Platform.OS == 'ios' ? hp('90%') : hp('50%'),
                            ]}
                            renderContent={() => <FastBitcoinCalculationModalContents
                                navigation={navigation}
                                modalRef={this.refs.fastBitcoinRedeemCalculationBottomSheet}
                                pageInfo={
                                    'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
                                }
                                pageTitle={'Redeem Voucher'}
                                noteTitle={'Lorem ipsum'}
                                noteInfo={'Lorem ipsum dolor sit amet, consectetur'}
                                proceedButtonText="Calculate"
                                onPressBack={() => {
                                    (this.refs.fastBitcoinRedeemCalculationBottomSheet as any).snapTo(0);
                                }}
                            />}
                            renderHeader={() => <SmallHeaderModal
                                borderColor={Colors.white}
                                backgroundColor={Colors.white}
                                onPressHeader={() => {
                                    (this.refs.fastBitcoinRedeemCalculationBottomSheet as any).snapTo(0);
                                }}
                            />}
                        />
                    ) : null
                }

                {
                    addSubBottomSheetsFlag ? (
                        <BottomSheet
                            onOpenEnd={() => {
                                this.setState({
                                    tabBarIndex: 0
                                })
                            }}
                            enabledInnerScrolling={true}
                            ref={"fastBitcoinSellCalculationBottomSheet"}
                            snapPoints={[
                                -50,
                                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                                    ? hp('90%')
                                    : hp('90%'),
                                Platform.OS == 'ios' ? hp('90%') : hp('50%'),
                            ]}
                            renderContent={() => <FastBitcoinCalculationModalContents
                                navigation={navigation}
                                modalRef={this.refs.fastBitcoinSellCalculationBottomSheet}
                                pageInfo={
                                    'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
                                }
                                pageTitle={'Sell Bitcoins'}
                                noteTitle={'Lorem ipsum'}
                                noteInfo={'Lorem ipsum dolor sit amet, consectetur'}
                                proceedButtonText={'Calculate'}
                                onPressBack={() => {
                                    (this.refs.fastBitcoinSellCalculationBottomSheet as any).snapTo(0);
                                }}
                            />}
                            renderHeader={() => <SmallHeaderModal
                                borderColor={Colors.white}
                                backgroundColor={Colors.white}
                                onPressHeader={() => {
                                    (this.refs.fastBitcoinSellCalculationBottomSheet as any).snapTo(0);
                                }}
                            />}
                        />
                    ) : null
                }

                <BottomSheet
                    onOpenEnd={() => {
                        this.setState({
                            tabBarIndex: 0,
                            familyAndFriendsBookBottomSheetsFlag: true
                        })
                    }}
                    onOpenStart={() => {
                        this.setState({
                            tabBarIndex: 0
                        })
                    }}
                    onCloseStart={() => {
                        this.setState({
                            tabBarIndex: 999,
                            familyAndFriendsBookBottomSheetsFlag: false
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"addContactAddressBookBookBottomSheet"}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
                    ]}
                    renderContent={() => <AddContactAddressBook
                        modalRef={this.refs.addContactAddressBookBookBottomSheet}
                        proceedButtonText={'Confirm & Proceed'}
                        onPressContinue={() => {
                            navigation.navigate('AddContactSendRequest', {
                                SelectedContact: selectedContact,
                            });
                            (this.refs.addContactAddressBookBookBottomSheet as any).snapTo(0);
                        }}
                        onSelectContact={(selectedContact) => {
                            this.setState({
                                selectedContact
                            })
                        }}
                        onPressBack={() => {
                            this.setState({
                                familyAndFriendsBookBottomSheetsFlag: false
                            }, () => (this.refs.addContactAddressBookBookBottomSheet as any).snapTo(0))
                        }}
                    />}
                    renderHeader={() => <SmallHeaderModal
                        borderColor={Colors.white}
                        backgroundColor={Colors.white}
                        onPressHeader={() => {
                            this.setState({
                                familyAndFriendsBookBottomSheetsFlag: false
                            }, () => (this.refs.addContactAddressBookBookBottomSheet as any).snapTo(0))
                        }}
                    />}
                />

                {
                    familyAndFriendsBookBottomSheetsFlag ? (
                        <BottomSheet
                            onOpenEnd={() => { }}
                            enabledInnerScrolling={true}
                            ref={"contactSelectedFromAddressBookBottomSheet"}
                            snapPoints={[
                                -50,
                                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                                    ? hp('90%')
                                    : hp('90%'),
                            ]}
                            renderContent={() => <SelectedContactFromAddressBook
                                onPressQrScanner={() => {
                                    navigation.navigate('QrScanner', { scanedCode: this.getQrCodeData });
                                }}
                                onPressProceed={() => {
                                    (this.refs.contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                                        1,
                                    );
                                }}
                                onPressBack={() => {
                                    (this.refs.contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(0);
                                }}
                            />}
                            renderHeader={() => <SmallHeaderModal
                                borderColor={Colors.white}
                                backgroundColor={Colors.white}
                                onPressHeader={() => {
                                    (this.refs.contactSelectedFromAddressBookBottomSheet as any).snapTo(0);
                                }}
                            />}
                        />
                    ) : null
                }
                {
                    familyAndFriendsBookBottomSheetsFlag ? (
                        <BottomSheet
                            onOpenEnd={() => { }}
                            enabledInnerScrolling={true}
                            ref={"contactSelectedFromAddressBookQrCodeBottomSheet"}
                            snapPoints={[
                                -50,
                                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                                    ? hp('90%')
                                    : hp('90%'),
                            ]}
                            renderContent={() => <SelectedContactFromAddressBookQrCode
                                onPressProceed={() => {
                                    (this.refs.contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                                        0,
                                    );
                                }}
                                onPressBack={() => {
                                    (this.refs.contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                                        0,
                                    );
                                }}
                            />}
                            renderHeader={() => <SmallHeaderModal
                                borderColor={Colors.white}
                                backgroundColor={Colors.white}
                                onPressHeader={() => {
                                    (this.refs.contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                                        0,
                                    );
                                }}
                            />}
                        />
                    ) : null
                }

                <BottomSheet
                    onOpenEnd={() => {
                        this.setState({
                            tabBarIndex: 0
                        }, () => this.onNotificationListOpen())

                    }}
                    onCloseEnd={() => {
                        this.setState({
                            tabBarIndex: 999
                        })
                    }}
                    enabledInnerScrolling={true}
                    ref={"notificationsListBottomSheet"}
                    snapPoints={[
                        -50,
                        Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
                    ]}
                    renderContent={() => <NotificationListContent
                        NotificationData={notificationData}
                        onNotificationClicked={(value) => this.onNotificationClicked(value)}
                        onPressBack={() => {
                            (this.refs.notificationsListBottomSheet as any).snapTo(0);
                        }}
                    />}
                    renderHeader={() => <ModalHeader
                        onPressHeader={() => {
                            (this.refs.notificationsListBottomSheet as any).snapTo(0);
                        }}
                    />}
                />



            </ImageBackground>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        notificationList: state.notifications.notifications,
        exchangeRates: idx(state, _ => _.accounts.exchangeRates),
        accounts: state.accounts || [],
        walletName: idx(state, _ => _.storage.database.WALLET_SETUP.walletName) || '',
        UNDER_CUSTODY: idx(state, _ => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY)
    }
}

export default connect(mapStateToProps, null)(HomeUpdated)

const styles = StyleSheet.create({
    card: {
        margin: 0,
        width: wp('42.6%'),
        height: hp('20.1%'),
        borderColor: Colors.borderColor,
        borderWidth: 1,
        marginRight: wp('2%'),
        marginBottom: wp('2%'),
        padding: wp('3'),
        backgroundColor: Colors.white,
    },
    cardTitle: {
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.blue,
        fontSize: RFValue(10),
    },
    activeTabStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundColor,
        padding: 7,
        borderRadius: 7,
        width: 120,
        height: 40,
        justifyContent: 'center',
    },
    activeTabTextStyle: {
        marginLeft: 8,
        color: Colors.blue,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(12),
    },
    bottomTabBarContainer: {
        backgroundColor: Colors.white,
        justifyContent: 'space-evenly',
        display: 'flex',
        marginTop: 'auto',
        flexDirection: 'row',
        height: hp('12%'),
        alignItems: 'center',
        borderLeftColor: Colors.borderColor,
        borderLeftWidth: 1,
        borderRightColor: Colors.borderColor,
        borderRightWidth: 1,
        borderTopColor: Colors.borderColor,
        borderTopWidth: 1,
        paddingBottom: DeviceInfo.hasNotch() ? hp('4%') : 0,
    },
    cardViewContainer: {
        height: '100%',
        backgroundColor: Colors.backgroundColor,
        marginTop: hp('4%'),
        borderTopLeftRadius: 25,
        shadowColor: 'black',
        shadowOpacity: 0.4,
        shadowOffset: { width: 2, height: -1 },
        paddingTop: hp('1.5%'),
        paddingBottom: hp('5%'),
        width: '100%',
        overflow: 'hidden',
        paddingLeft: wp('3%'),
    },
    modalHeaderContainer: {
        backgroundColor: Colors.white,
        marginTop: 'auto',
        flex: 1,
        height:
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? 50
                : Platform.OS == 'android'
                    ? 43
                    : 40,
        borderTopLeftRadius: 10,
        borderLeftColor: Colors.borderColor,
        borderLeftWidth: 1,
        borderTopRightRadius: 10,
        borderRightColor: Colors.borderColor,
        borderRightWidth: 1,
        borderTopColor: Colors.borderColor,
        borderTopWidth: 1,
        zIndex: 9999,
    },
    modalHeaderHandle: {
        width: 50,
        height: 5,
        backgroundColor: Colors.borderColor,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 7,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansRegular,
        marginLeft: 15,
    },
    headerViewContainer: {
        marginTop: hp('2%'),
        marginLeft: 20,
        marginRight: 20,
    },
    headerTitleViewContainer: {
        flex: 7,
        justifyContent: 'space-between',
    },
    headerTitleText: {
        color: Colors.white,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(25),
        marginBottom: wp('3%'),
    },
    headerToggleSwitchContainer: {
        flex: 3,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    headerInfoText: {
        fontSize: RFValue(12),
        color: Colors.white,
    },
    headerButton: {
        backgroundColor: Colors.homepageButtonColor,
        height: hp('5%'),
        width: wp('35%'),
        borderRadius: 5,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButtonText: {
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(13),
        color: Colors.white,
    },
    cardBitCoinImage: {
        width: wp('3%'),
        height: wp('3%'),
        marginRight: 5,
        resizeMode: 'contain',
        marginBottom: wp('0.7%'),
    },
    cardAmountText: {
        color: Colors.black,
        fontFamily: Fonts.OpenSans,
        fontSize: RFValue(17),
        marginRight: 5,
        marginTop: 'auto',
        lineHeight: RFValue(17),
    },
    cardAmountTextGrey: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.OpenSans,
        fontSize: RFValue(17),
        marginRight: 5,
        marginTop: 'auto',
        lineHeight: RFValue(17),
    },
    cardAmountUnitText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11),
        marginTop: 'auto',
        lineHeight: RFValue(17),
    },
    tabBarImage: {
        width: 21,
        height: 21,
        resizeMode: 'contain',
    },
    tabBarTabView: {
        padding: wp('5%'),
    },
    transactionModalElementView: {
        backgroundColor: Colors.backgroundColor,
        padding: hp('1%'),
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
    },
    modalElementInfoView: {
        padding: hp('1%'),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionModalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(12),
        marginBottom: 3,
        fontFamily: Fonts.FiraSansRegular,
    },
    transactionModalDateText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular,
    },
    transactionModalAmountView: {
        padding: 10,
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center',
    },
    transactionModalAmountText: {
        marginLeft: 5,
        marginRight: 5,
        fontSize: RFValue(20),
        fontFamily: Fonts.OpenSans,
    },
    transactionModalAmountUnitText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(10),
        fontFamily: Fonts.OpenSans,
    },
    separatorView: {
        marginLeft: 15,
        marginRight: 15,
        height: 1,
        backgroundColor: Colors.borderColor,
    },
    modalContentContainer: {
        height: '100%',
        backgroundColor: Colors.white,
    },
});
