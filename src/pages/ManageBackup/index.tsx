import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  FlatList,
  Platform,
  AsyncStorage,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import CommonStyles from '../../common/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import CopyThisText from '../../components/CopyThisText';
import KnowMoreButton from '../../components/KnowMoreButton';
import { useDispatch, useSelector } from 'react-redux';
import { initHealthCheck, checkMSharesHealth } from '../../store/actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import HomePageShield from '../../components/HomePageShield';
import BackupStyles from './Styles';
import ContactList from '../../components/ContactList';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomInfoBox from '../../components/BottomInfoBox';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import WalletBackupAndRecoveryContents from '../../components/Helper/WalletBackupAndRecoveryContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { fetchSSSFromDB } from '../../store/actions/storage';
import { requestSharePdf } from '../../store/actions/manageBackup';
import RegenerateHealper from '../../components/Helper/RegenerateHealper';

export default function ManageBackup( props ) {
  const [
    WalletBackupAndRecoveryBottomSheet,
    setWalletBackupAndRecoveryBottomSheet,
  ] = useState( React.createRef() );
  const [ secondaryDeviceBottomSheet, setSecondaryDeviceBottomSheet ] = useState(
    React.createRef(),
  );
  const [ trustedContactsBottomSheet, setTrustedContactsBottomSheet ] = useState(
    React.createRef(),
  );
  const [
    RegenerateShareHelperBottomSheet,
    setRegenerateShareHelperBottomSheet,
  ] = useState( React.createRef() );
  const [ cloudBottomSheet, setCloudBottomSheet ] = useState( React.createRef() );
  const [ selectedType, setSelectedType ] = useState( '' );
  const [ contactIndex, setContactIndex ] = useState();
  const [ selectedStatus, setSelectedStatus ] = useState( 'error' );
  const [ contacts, setContacts ] = useState( [] );
  const [ isSecretShared1, setIsSecretShared1 ] = useState( false );
  const [ isSecretShared2, setIsSecretShared2 ] = useState( false );
  const [ cloudData, setCloudData ] = useState( [
    {
      title: 'iCloud Drive',
      info: 'Store backup in iCloud Drive',
      imageIcon: require( '../../assets/images/icons/logo_brand_brands_logos_icloud.png' ),
    },
    {
      title: 'Google Drive',
      info: 'Store backup in Google Drive',
      imageIcon: require( '../../assets/images/icons/logo_brand_brands_logos_icloud.png' ),
    },
    {
      title: 'One Drive',
      info: 'Store backup in One Drive',
      imageIcon: require( '../../assets/images/icons/logo_brand_brands_logos_icloud.png' ),
    },
    {
      title: 'DropBox Storage',
      info: 'Store backup in Dropbox Storage',
      imageIcon: require( '../../assets/images/icons/logo_brand_brands_logos_icloud.png' ),
    },
  ] );
  const [ pageData, setPageData ] = useState( [
    {
      title: 'Secondary Device',
      personalInfo: null,
      time: '3 months ago',
      status: 'error',
      type: 'secondaryDevice',
      route: 'SecondaryDevice',
    },
    {
      title: 'Trusted Contact 1',
      personalInfo: null,
      time: '1 month ago',
      status: 'error',
      type: 'contact',
      route: 'TrustedContacts',
    },
    {
      title: 'Trusted Contact 2',
      personalInfo: null,
      time: '12 days ago',
      status: 'error',
      type: 'contact',
      route: 'TrustedContacts',
    },
    {
      title: 'Personal Copy 1',
      personalInfo: null,
      time: '2 days ago',
      status: 'error',
      type: 'copy1',
      route: 'personalCopy',
    },
    {
      title: 'Personal Copy 2',
      personalInfo: null,
      time: '2 days ago',
      status: 'error',
      type: 'copy2',
      route: 'personalCopy',
    },
    {
      title: 'Security Questions',
      personalInfo: null,
      time: '1 day ago',
      status: 'error',
      type: 'security',
      route: 'HealthCheckSecurityAnswer',
    },
  ] );

  function getImageByType( item ) {
    let type = item.type;
    if ( type == 'secondaryDevice' ) {
      return require( '../../assets/images/icons/icon_secondarydevice.png' );
    } else if ( type == 'contact' ) {
      return require( '../../assets/images/icons/icon_user.png' );
    } else if ( type == 'copy1' || type == 'copy2' ) {
      if ( item.personalInfo && item.personalInfo.flagShare && item.personalInfo.shareDetails.type == "GoogleDrive" ) {
        return require( '../../assets/images/icons/icon_cloud.png' );
      }
      else if ( item.personalInfo && item.personalInfo.flagShare && item.personalInfo.shareDetails.type == "Email" ) {
        return require( '../../assets/images/icons/gmail.png' );
      }
      else if ( item.personalInfo && item.personalInfo.flagShare && ( item.personalInfo.shareDetails.type == "Print" ) ) {
        return require( '../../assets/images/icons/print.png' );
      }
      else {
        return require( '../../assets/images/icons/note.png' );
      }
      // return require('../../assets/images/icons/icon_cloud.png');
    }
    if ( type == 'print' ) {
      return require( '../../assets/images/icons/print.png' );
    } else if ( type == 'security' ) {
      return require( '../../assets/images/icons/icon_securityquestion.png' );
    }
  }

  // function selectedContactsList(list) {
  //   setContacts(list);
  // }

  // function continueNProceed() {
  //   bottomSheet.current.snapTo(0);
  // setTimeout(() => {
  //   setSelectedType("cloud");
  //   setSelectedStatus("success");
  // }, 1000);
  //}

  // const [contactIndex, setContactIndex] = useState();
  // function openModal(type, title?) {
  //   // title as dummy identifier for Trusted Contact index
  //   setSelectedType(type);
  //   if (title)
  //     title === "Trusted Contact 1" ? setContactIndex(1) : setContactIndex(2);

  //   bottomSheet.current.snapTo(1);
  // }

  //   function onCloseEnd() {
  //     if (selectedType == "secondaryDevice") {
  //       setSelectedType("contact");
  //       setSelectedStatus("warning");
  //     }
  //   }

  const getIconByStatus = status => {
    if ( status == 'error' ) {
      return require( '../../assets/images/icons/icon_error_red.png' );
    } else if ( status == 'warning' ) {
      return require( '../../assets/images/icons/icon_error_yellow.png' );
    } else if ( status == 'success' ) {
      return require( '../../assets/images/icons/icon_check.png' );
    }
  };

  // function onCloseEnd() {
  //   if (selectedType == 'secondaryDevice') {
  //     setSelectedType('contact');
  //     setSelectedStatus('warning');
  //   }
  // }

  // function renderCloudContent() {
  //   return (
  //     <View style={BackupStyles.modalContainer}>
  //       <View style={BackupStyles.modalHeaderTitleView}>
  //         <View style={{ marginTop: hp('1%') }}>
  //           <Text style={BackupStyles.modalHeaderTitleText}>Cloud</Text>
  //           <Text style={BackupStyles.modalHeaderInfoText}>
  //             Never backed up
  //           </Text>
  //         </View>
  //         <Image
  //           style={styles.cardIconImage}
  //           source={getIconByStatus(selectedStatus)}
  //         />
  //       </View>
  //       <View style={{ flex: 1 }}>
  //         <Text
  //           style={{
  //             marginLeft: 30,
  //             color: Colors.textColorGrey,
  //             fontFamily: Fonts.FiraSansRegular,
  //             fontSize: RFValue(12, 812),
  //             marginTop: 5,
  //             marginBottom: 5,
  //           }}
  //         >
  //           Select cloud drive to{' '}
  //           <Text
  //             style={{
  //               fontFamily: Fonts.FiraSansMediumItalic,
  //               fontWeight: 'bold',
  //               fontStyle: 'italic',
  //             }}
  //           >
  //             store recovery secret
  //           </Text>
  //         </Text>
  //         <View style={{ flex: 1 }}>
  //           <FlatList
  //             data={cloudData}
  //             renderItem={({ item, index }) => (
  //               <View style={styles.listElements}>
  //                 <Image
  //                   style={styles.listElementsIconImage}
  //                   source={item.imageIcon}
  //                 />
  //                 <View style={{ justifyContent: 'space-between', flex: 1 }}>
  //                   <Text style={styles.listElementsTitle}>{item.title}</Text>
  //                   <Text style={styles.listElementsInfo} numberOfLines={1}>
  //                     {item.info}
  //                   </Text>
  //                 </View>
  //                 <View style={styles.listElementIcon}>
  //                   <Ionicons
  //                     name="ios-arrow-forward"
  //                     color={Colors.textColorGrey}
  //                     size={15}
  //                     style={{ alignSelf: 'center' }}
  //                   />
  //                 </View>
  //               </View>
  //             )}
  //           />
  //         </View>
  //       </View>
  //     </View>
  //   );
  // }

  // function renderTrustedContactsContent() {
  //   return (
  //     <View style={BackupStyles.modalContainer}>
  //       <View style={BackupStyles.modalHeaderTitleView}>
  //         <View style={{ marginTop: hp('2%') }}>
  //           <Text style={BackupStyles.modalHeaderTitleText}>
  //             Trusted Contact
  //           </Text>
  //           <Text style={BackupStyles.modalHeaderInfoText}>
  //             Never backed up
  //           </Text>
  //         </View>
  //         <Image
  //           style={styles.cardIconImage}
  //           source={getIconByStatus(selectedStatus)}
  //         />
  //       </View>
  //       <View style={{ flex: 1 }}>
  //         <Text
  //           style={{
  //             marginLeft: 30,
  //             color: Colors.textColorGrey,
  //             fontFamily: Fonts.FiraSansRegular,
  //             fontSize: RFValue(12, 812),
  //             marginTop: 5,
  //           }}
  //         >
  //           Select contact to{' '}
  //           <Text
  //             style={{
  //               fontFamily: Fonts.FiraSansMediumItalic,
  //               fontWeight: 'bold',
  //               fontStyle: 'italic',
  //             }}
  //           >
  //             send recovery secret
  //           </Text>
  //         </Text>
  //         <ContactList
  //           style={{}}
  //           onPressContinue={() => {}}
  //           onSelectContact={list => {}}
  //         />
  //       </View>
  //     </View>
  //   );
  // }

  // const renderSecondaryDeviceContents = () => {
  //   return (
  //     <View style={BackupStyles.modalContainer}>
  //       <View style={BackupStyles.modalHeaderTitleView}>
  //         <View style={{ marginTop: hp('2%') }}>
  //           <Text style={BackupStyles.modalHeaderTitleText}>
  //             {'Secondary Device'}
  //           </Text>
  //           <Text style={BackupStyles.modalHeaderInfoText}>
  //             Last backup{' '}
  //             <Text
  //               style={{
  //                 fontFamily: Fonts.FiraSansMediumItalic,
  //                 fontWeight: 'bold',
  //                 fontStyle: 'italic',
  //               }}
  //             >
  //               {'3 months ago'}
  //             </Text>
  //           </Text>
  //         </View>
  //         <Image
  //           style={styles.cardIconImage}
  //           source={getIconByStatus(selectedStatus)}
  //         />
  //       </View>
  //       <View style={BackupStyles.modalContentView}>
  //         <Image
  //           style={{ width: hp('27%'), height: hp('27%'), alignSelf: 'center' }}
  //           source={require('../../assets/images/qrcode.png')}
  //         />
  //         <CopyThisText text="lk2j3429-85213-5134=50t-934285623877wer78er7" />
  //       </View>
  //       <BottomInfoBox
  //         title={'Note'}
  //         infoText={
  //           'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna'
  //         }
  //       />
  //     </View>
  //   );
  // };

  // function renderSecondaryDeviceHeader() {
  //   return (
  //     <TouchableOpacity
  //       activeOpacity={10}
  //       onPress={() => {
  //         (secondaryDeviceBottomSheet as any).current.snapTo(0);
  //       }}
  //       style={styles.modalHeader}
  //     >
  //       <View style={styles.modalHeaderHandle} />
  //     </TouchableOpacity>
  //   );
  // }

  // function renderTrustedContactsHeader() {
  //   return (
  //     <TouchableOpacity
  //       activeOpacity={10}
  //       onPress={() => {
  //         (trustedContactsBottomSheet as any).current.snapTo(0);
  //       }}
  //       style={styles.modalHeader}
  //     >
  //       <View style={styles.modalHeaderHandle} />
  //     </TouchableOpacity>
  //   );
  // }

  // function renderCloudHeader() {
  //   return (
  //     <TouchableOpacity
  //       activeOpacity={10}
  //       onPress={() => {
  //         (cloudBottomSheet as any).current.snapTo(0);
  //       }}
  //       style={styles.modalHeader}
  //     >
  //       <View style={styles.modalHeaderHandle} />
  //     </TouchableOpacity>
  //   );
  // }

  // function renderContent() {
  //   switch (selectedType) {
  //     case "secondaryDevice":
  //       props.navigation.navigate("SecondaryDevice");
  //       break;
  //     case "contact":
  //       props.navigation.navigate("TrustedContacts", { index: contactIndex });
  //       break;
  //     case "cloud":
  //       props.navigation.navigate("Cloud");
  //       break;
  //   }
  // }

  // function renderHeader() {
  //   return (
  //     <TouchableOpacity
  //       activeOpacity={10}
  //       onPress={() => {
  //         bottomSheet.current.snapTo(0);
  //       }}
  //       style={styles.modalHeader}
  //     >
  //       <View style={styles.modalHeaderHandle} />
  //     </TouchableOpacity>
  //   );
  // }

  const renderWalletBackupAndRecoveryContents = () => {
    return (
      <WalletBackupAndRecoveryContents
        onPressManageBackup={ () => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo( 0 );
        } }
        onSkip={ () => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo( 0 );
        } }
        onStartBackup={ () => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo( 0 );
        } }
      />
    );
  };

  const renderWalletBackupAndRecoveryHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={ Colors.blue }
        headerColor={ Colors.blue }
        onPressHandle={ () => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo( 0 );
        } }
      />
    );
  };

  const dispatch = useDispatch();
  const s3Service: S3Service = useSelector( state => state.sss.service );
  const { databaseSSS } = useSelector( state => state.storage );
  // const {}    
  useEffect( () => {
    dispatch( fetchSSSFromDB() );
    checkNShowHelperModal();
    if ( !s3Service.sss.healthCheckInitialized ) dispatch( initHealthCheck() );
  }, [] );

  useEffect( () => {
    console.log( { databaseSSS } );
    if ( databaseSSS.pdfDetails ) {
      pageData[ 3 ].personalInfo = databaseSSS.pdfDetails.copy1;
      pageData[ 4 ].personalInfo = databaseSSS.pdfDetails.copy2;
      if ( databaseSSS.pdfDetails.copy1.flagShare ) {
        pageData[ 3 ].status = "success";
      }
      if ( databaseSSS.pdfDetails.copy2.flagShare ) {
        pageData[ 4 ].status = "success";
      }
      setPageData( pageData );
    }
  }, [ databaseSSS ] );

  const checkNShowHelperModal = async () => {
    let isManageBackupHelperDone = await AsyncStorage.getItem(
      'isManageBackupHelperDone',
    );
    if ( !isManageBackupHelperDone ) {
      AsyncStorage.setItem( 'isManageBackupHelperDone', 'true' );
      WalletBackupAndRecoveryBottomSheet.current.snapTo( 1 );
    }
  };


  const [ overallHealth, setOverallHealth ] = useState();
  const health = useSelector( state => state.sss.overallHealth );
  useEffect( () => {
    if ( health ) setOverallHealth( health );
  }, [ health ] );

  useEffect( () => {
    ( async () => {
      if ( !overallHealth ) {
        const storedHealth = await AsyncStorage.getItem( 'overallHealth' );
        if ( storedHealth ) {
          setOverallHealth( JSON.parse( storedHealth ) );
        }
      }
    } )();
  }, [] );

  //const { overallHealth } = useSelector( state => state.sss );
  useEffect( () => {
    if ( overallHealth ) {
      const updatedPageData = [ ...pageData ];
      updatedPageData.forEach( data => {
        switch ( data.title ) {
          case 'Secondary Device':
            if ( overallHealth.sharesInfo[ 0 ].shareStage === 'Good' ) {
              data.status = 'success';
            } else if ( overallHealth.sharesInfo[ 0 ].shareStage === 'Bad' ) {
              data.status = 'warning';
            } else if ( overallHealth.sharesInfo[ 0 ].shareStage === 'Ugly' ) {
              data.status = 'error';
            }
            break;

          case 'Trusted Contact 1':
            if ( overallHealth.sharesInfo[ 1 ].shareStage === 'Good' ) {
              data.status = 'success';
            } else if ( overallHealth.sharesInfo[ 1 ].shareStage === 'Bad' ) {
              data.status = 'warning';
            } else if ( overallHealth.sharesInfo[ 1 ].shareStage === 'Ugly' ) {
              data.status = 'error';
            }
            break;

          case 'Trusted Contact 2':
            if ( overallHealth.sharesInfo[ 2 ].shareStage === 'Good' ) {
              data.status = 'success';
            } else if ( overallHealth.sharesInfo[ 2 ].shareStage === 'Bad' ) {
              data.status = 'warning';
            } else if ( overallHealth.sharesInfo[ 2 ].shareStage === 'Ugly' ) {
              data.status = 'error';
            }
            break;

          case 'Security Questions':
            if ( overallHealth.qaStatus === 'Good' ) {
              data.status = 'success';
            } else if ( overallHealth.qaStatus === 'Bad' ) {
              data.status = 'warning';
            } else if ( overallHealth.qaStatus === 'Ugly' ) {
              data.status = 'error';
            }
            break;

          default:
            break;
        }
      } );
      setPageData( updatedPageData );
    }
  }, [ overallHealth ] );

  useEffect( () => {
    // HC down-streaming
    if ( s3Service ) {
      const { healthCheckInitialized } = s3Service.sss;

      if ( healthCheckInitialized ) {
        dispatch( checkMSharesHealth() );
      }
    }
  }, [] );

  const renderBuyHelperContents = () => {
    return (
      <RegenerateHealper
        topButtonText={ 'Regenerate Shares' }
        continueButtonText={ 'Continue' }
        quitButtonText={ 'Quit' }
        onPressRegenerateShare={ () => {
          ( RegenerateShareHelperBottomSheet as any ).current.snapTo( 0 );
          props.navigation.navigate( 'NewWalletNameRegenerateShare' );
        } }
        onPressContinue={ () => {
          ( RegenerateShareHelperBottomSheet as any ).current.snapTo( 0 );
          props.navigation.navigate( 'NewWalletNameRegenerateShare' );
        } }
        onPressQuit={ () => {
          ( RegenerateShareHelperBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };
  const renderBuyHelperHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          ( RegenerateShareHelperBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const getTrustContact = async ( contacts, index ) => {
    setContacts( contacts );
    setContactIndex( index );
    const contactList = await AsyncStorage.getItem( "SelectedContacts" );
    console.log( 'contactList', contactList );
  };

  useEffect( () => {
    if ( contacts ) {
      const updatedPageData = [ ...pageData ];
      // console.log('updatedPageData', updatedPageData, contactIndex);
      // console.log("Contacts", contacts)
      for ( let i = 0; i < updatedPageData.length; i++ ) {
        if ( contactIndex == 1 ) {
          if ( contacts.length == 2 ) {
            updatedPageData[ i ].title == 'Trusted Contact 1'
              ? ( updatedPageData[ i ].personalInfo = contacts[ 0 ] )
              : updatedPageData[ i ].title == 'Trusted Contact 2'
                ? ( updatedPageData[ i ].personalInfo = contacts[ 1 ] )
                : '';
          }
          else if ( !updatedPageData[ 1 ].personalInfo ) {
            updatedPageData[ i ].title == 'Trusted Contact 1'
              ? ( updatedPageData[ i ].personalInfo = contacts[ 0 ] )
              : '';
          }
        }

        if ( contactIndex == 2 ) {
          if ( contacts.length == 2 ) {
            updatedPageData[ i ].title == 'Trusted Contact 1'
              ? ( updatedPageData[ i ].personalInfo = contacts[ 0 ] )
              : updatedPageData[ i ].title == 'Trusted Contact 2'
                ? ( updatedPageData[ i ].personalInfo = contacts[ 1 ] )
                : '';
          } else if ( !updatedPageData[ 2 ].personalInfo ) {
            updatedPageData[ i ].title == 'Trusted Contact 2'
              ? ( updatedPageData[ i ].personalInfo = contacts[ 0 ] )
              : '';
          }
        }
      }
      setPageData( updatedPageData );
      // console.log("updatedPageData[i].personalInfo", pageData)
    }
  }, [ contacts ] );

  const secretSharedTrustedContact1 = isSecretShared1 => {
    // console.log('IsSecretShared1', isSecretShared1);
    setIsSecretShared1( isSecretShared1 );
  };

  const secretSharedTrustedContact2 = isSecretShared2 => {
    // console.log('IsSecretShared2', isSecretShared2);
    setIsSecretShared2( isSecretShared2 );
  };

  return (
    <View style={ { flex: 1 } }>
      <SafeAreaView style={ { flex: 0 } } />
      <StatusBar backgroundColor={ Colors.white } barStyle="dark-content" />
      <View style={ { flex: 1 } }>
        <View style={ CommonStyles.headerContainer }>
          <TouchableOpacity
            style={ CommonStyles.headerLeftIconContainer }
            onPress={ () => {
              props.navigation.goBack();
            } }
          >
            <View style={ CommonStyles.headerLeftIconInnerContainer }>
              <FontAwesome
                name="long-arrow-left"
                color={ Colors.blue }
                size={ 17 }
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={ {
              marginLeft: 'auto',
              marginRight: 10,
            } }
            onPress={ () => {
              RegenerateShareHelperBottomSheet.current.snapTo( 1 );
            } }
          >
            <Image
              source={ require( '../../assets/images/icons/icon_settings1.png' ) }
              style={ {
                width: wp( '5%' ),
                height: wp( '5%' ),
                resizeMode: 'contain',
              } }
            />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={ { flexDirection: 'row', marginTop: 10 } }>
            <View style={ { flex: 2 } }>
              <Text style={ { ...CommonStyles.headerTitles, marginLeft: 25 } }>
                Manage Backup
              </Text>
              <Text
                style={ { ...CommonStyles.headerTitlesInfoText, marginLeft: 25 } }
              >
                The wallet backup is not secured. Please complete the setup to
                safeguard against loss of funds
              </Text>
              <KnowMoreButton
                onpress={ () => {
                  WalletBackupAndRecoveryBottomSheet.current.snapTo( 1 );
                } }
                containerStyle={ { marginTop: 10, marginLeft: 25 } }
                textStyle={ {} }
              />
            </View>
            <View
              style={ {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              } }
            >
              { overallHealth ? (
                <HomePageShield
                  circleShadowColor={ Colors.borderColor }
                  shieldImage={ require( '../../assets/images/icons/protector_gray.png' ) }
                  shieldStatus={ overallHealth.overallStatus }
                />
              ) : (
                  <HomePageShield
                    circleShadowColor={ Colors.borderColor }
                    shieldImage={ require( '../../assets/images/icons/protector_gray.png' ) }
                    shieldStatus={ 0 }
                  />
                ) }
            </View>
          </View>
          <FlatList
            data={ pageData }
            extraData={ this.state }
            renderItem={ ( { item, index } ) => (
              <View
              // style={{
              //   opacity: !selectedType || item.type == selectedType ? 1 : 0.5
              // }}
              >
                <TouchableOpacity
                  disabled={ item.personalInfo && item.personalInfo.flagShare ? true : false }
                  onPress={ () => {
                    console.log( { item } );

                    if ( item.route == 'personalCopy' ) {
                      dispatch( requestSharePdf( item ) );
                    }
                    if ( item.type == 'contact' && !item.personalInfo ) {
                      props.navigation.navigate( item.route, {
                        index:
                          item.title === 'Trusted Contact 1'
                            ? 1
                            : item.title === 'Trusted Contact 2'
                              ? 2
                              : undefined,
                        getTrustContact: getTrustContact,
                        contacts: contacts ? contacts : [],
                      } );
                    } else {
                      if ( item.type == 'contact' ) {
                        if ( isSecretShared1 || isSecretShared2 ) {
                          props.navigation.navigate(
                            'TrustedContactHealthCheck',
                          );
                        } else {
                          props.navigation.navigate( 'CommunicationMode', {
                            contact: item.personalInfo,
                            index:
                              item.title === 'Trusted Contact 1'
                                ? 1
                                : item.title === 'Trusted Contact 2'
                                  ? 2
                                  : undefined,
                            secretSharedTrustedContact1:
                              item.title === 'Trusted Contact 1'
                                ? secretSharedTrustedContact1
                                : null,
                            secretSharedTrustedContact2:
                              item.title === 'Trusted Contact 2'
                                ? secretSharedTrustedContact2
                                : null,
                          } );
                        }
                      } else {
                        props.navigation.navigate( item.route );
                      }
                    }
                  } }
                  style={ {
                    ...styles.manageBackupCard,
                    borderColor:
                      item.status == 'error'
                        ? Colors.red
                        : item.status == 'warning'
                          ? Colors.yellow
                          : item.status == 'success'
                            ? Colors.green
                            : Colors.blue,
                    elevation:
                      selectedType && item.type == selectedType ? 10 : 0,
                    shadowColor:
                      selectedType && item.type == selectedType
                        ? Colors.borderColor
                        : Colors.white,
                    shadowOpacity:
                      selectedType && item.type == selectedType ? 10 : 0,
                    shadowOffset:
                      selectedType && item.type == selectedType
                        ? { width: 0, height: 10 }
                        : { width: 0, height: 0 },
                    shadowRadius:
                      selectedType && item.type == selectedType ? 10 : 0,
                  } }
                >
                  <Image
                    style={ styles.cardImage }
                    source={ getImageByType( item ) }
                  />
                  <View style={ { marginLeft: 15 } }>
                    <Text style={ styles.cardTitleText }>
                      { item.personalInfo && item.type == "contact" ? item.personalInfo.name : item.title }
                    </Text>
                    <Text style={ styles.cardTimeText }>
                      Last backup{ ' ' }
                      <Text
                        style={ {
                          fontFamily: Fonts.FiraSansMediumItalic,
                          fontWeight: 'bold',
                          fontStyle: 'italic',
                        } }
                      >
                        { item.time }
                      </Text>
                    </Text>
                  </View>
                  <Image
                    style={ styles.cardIconImage }
                    source={ getIconByStatus( item.status ) }
                  />
                </TouchableOpacity>
              </View>
            ) }
          />
        </ScrollView>
        {/* <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={secondaryDeviceBottomSheet}
          snapPoints={[-30, hp("90%")]}
          renderContent={renderSecondaryDeviceContents}
          renderHeader={renderSecondaryDeviceHeader}
        />
        <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={trustedContactsBottomSheet}
          snapPoints={[-30, hp("90%")]}
          renderContent={renderTrustedContactsContent}
          renderHeader={renderTrustedContactsHeader}
        />
        <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={cloudBottomSheet}
          snapPoints={[-30, hp("90%")]}
          renderContent={renderCloudContent}
          renderHeader={renderCloudHeader}
        /> */}
        <BottomSheet
          enabledInnerScrolling={ true }
          ref={ WalletBackupAndRecoveryBottomSheet }
          snapPoints={ [
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '90%' )
              : hp( '90%' ),
          ] }
          renderContent={ renderWalletBackupAndRecoveryContents }
          renderHeader={ renderWalletBackupAndRecoveryHeader }
        />
        <BottomSheet
          enabledInnerScrolling={ true }
          ref={ RegenerateShareHelperBottomSheet }
          snapPoints={ [ -50, hp( '95%' ) ] }
          renderContent={ renderBuyHelperContents }
          renderHeader={ renderBuyHelperHeader }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create( {
  knowMoreButton: {
    marginTop: 10,
    height: wp( '6%' ),
    width: wp( '18%' ),
    marginLeft: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  knowMoreButtonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12, 812 ),
  },
  shieldImage: {
    width: wp( '16%' ),
    height: wp( '25%' ),
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 20,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 15,
  },
  modalHeader: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    height: 25,
    width: '80%',
    alignSelf: 'center',
    borderColor: Colors.borderColor,
  },
  addressView: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: RFValue( 13, 812 ),
    color: Colors.lightBlue,
  },
  copyIconView: {
    width: 48,
    height: 50,
    backgroundColor: Colors.borderColor,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageBackupCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  cardTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13, 812 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  cardTimeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10, 812 ),
  },
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 'auto',
  },
  listElements: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 10,
    alignItems: 'center',
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13, 812 ),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11, 812 ),
    marginLeft: 13,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listElementsIconImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
} );
