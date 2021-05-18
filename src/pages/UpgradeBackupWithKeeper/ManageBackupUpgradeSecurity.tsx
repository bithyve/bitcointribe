import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { withNavigationFocus } from 'react-navigation'
import { connect } from 'react-redux'
import idx from 'idx'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import moment from 'moment'
import { nameToInitials } from '../../common/CommonFunctions'
import Icons from '../../common/Icons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { walletCheckIn } from '../../store/actions/trustedContacts'
import { initHealthCheck } from '../../store/actions/sss'
import S3Service from '../../bitcoin/services/sss/S3Service'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import ErrorModalContents from '../../components/ErrorModalContents'
import ModalHeader from '../../components/ModalHeader'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import CloudHealthCheck from '../HealthCheck/CloudHealthCheck'
import Loader from '../../components/loader'
import SecondaryDeviceHealthCheck from '../HealthCheck/SecondaryDeviceHealthCheck'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import RegenerateHealper from '../../components/Helper/RegenerateHealper'
import ManageBackupHelpContents from '../../components/Helper/ManageBackupHelpContents'

interface ManageBackupStateTypes {
  selectedId: any;
  securityAtLevel: any;
  pageData: any;
  selectedType: any;
  SelectTypeToReshare: any;
  contacts: any[];
  isReshare: boolean;
  selectedTime: string;
  selectedStatus: string;
  secondaryDeviceHistory: any[];
  isNextStepDisable: boolean;
  LoadCamera: boolean;
  showLoader: boolean;
  autoHighlightFlags: {
    secondaryDevice: boolean;
    trustedContact1: boolean;
    trustedContact2: boolean;
    personalCopy1: boolean;
    personalCopy2: boolean;
    securityAns: boolean;
  };
  overallHealth: {
    overallStatus: string;
    qaStatus: any;
    sharesInfo: { shareId: string; shareStage: string; updatedAt?: string }[];
  };
}

interface ManageBackupPropsTypes {
  navigation: any;
  healthLoading: boolean;
  walletCheckIn: any;
  initHealthCheck: any;
  s3Service: S3Service;
  trustedContactsInfo: any;
  trustedContactsService: TrustedContactsService;
  health: {
    overallStatus: string;
    qaStatus: any;
    sharesInfo: { shareId: string; shareStage: string; updatedAt?: string }[];
  };
}

class ManageBackupUpgradeSecurity extends Component<
  ManageBackupPropsTypes,
  ManageBackupStateTypes
> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;

  constructor( props ) {
    super( props )
    this.focusListener = null
    this.appStateListener = null
    this.NoInternetBottomSheet = React.createRef()
    this.unsubscribe = null
    this.state = {
      securityAtLevel: 0,
      selectedId: 0,
      pageData: [
        {
          title: 'Secondary Device',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'secondaryDevice',
          route: 'SecondaryDevice',
        },
        {
          title: 'Trusted Contact 1',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'contact1',
          route: 'TrustedContacts',
          isOTPShared: false,
        },
        {
          title: 'Trusted Contact 2',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'contact2',
          route: 'TrustedContacts',
          isOTPShared: false,
        },
        {
          title: 'Personal Copy 1',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'copy1',
          route: 'PersonalCopy',
        },
        {
          title: 'Personal Copy 2',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'copy2',
          route: 'PersonalCopy',
        },
        {
          title: 'Security Questions',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'security',
          route: 'HealthCheckSecurityAnswer',
        },
      ],
      selectedType: '',
      autoHighlightFlags: {
        secondaryDevice: false,
        trustedContact1: false,
        trustedContact2: false,
        personalCopy1: false,
        personalCopy2: false,
        securityAns: true,
      },
      SelectTypeToReshare: {
      },
      contacts: [],
      isReshare: false,
      selectedTime: '',
      selectedStatus: 'Ugly',
      isNextStepDisable: false,
      LoadCamera: false,
      showLoader: false,
      overallHealth: null,
      secondaryDeviceHistory: [
        {
          id: 1,
          title: 'Recovery Key Not Accessible',
          date: '19 May ‘19, 11:00am',
          info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
          id: 2,
          title: 'Recovery Key Received',
          date: '1 June ‘19, 9:00am',
          info:
            'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
        },
        {
          id: 3,
          title: 'Recovery Key In-Transit',
          date: '30 May ‘19, 11:00am',
          info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
          id: 4,
          title: 'Recovery Key Accessible',
          date: '24 May ‘19, 5:00pm',
          info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
        },
        {
          id: 5,
          title: 'Recovery Key In-Transit',
          date: '20 May ‘19, 11:00am',
          info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
          id: 6,
          title: 'Recovery Key Not Accessible',
          date: '19 May ‘19, 11:00am',
          info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
      ],
    }
  }

  componentDidMount = () => {
    this.checkNShowHelperModal()
    this.setAutoHighlightFlagsFromAsync()
  };

  setAutoHighlightFlagsFromAsync = async () => {
    const highlightFlags = await AsyncStorage.getItem( 'AutoHighlightFlags' )
    if ( highlightFlags ) {
      this.setState( {
        autoHighlightFlags: JSON.parse( highlightFlags )
      } )
    }
  };

  checkNShowHelperModal = async () => {
    const isManageBackupHelperDone = await AsyncStorage.getItem(
      'isManageBackupHelperDone'
    )
    if ( !isManageBackupHelperDone ) {
      await AsyncStorage.setItem( 'isManageBackupHelperDone', 'true' )
      setTimeout( () => {
        ( this.refs.WalletBackupAndRecoveryBottomSheet as any ).snapTo( 1 )
      }, 1000 )
    }
  };

  componentDidUpdate = ( prevProps, prevState ) => {
    const { s3Service, initHealthCheck } = this.props
    // HC init and down-streaming
    if ( prevProps.s3Service != s3Service ) {
      const { healthCheckInitialized } = s3Service.sss
      if ( healthCheckInitialized ) {
        // dispatch(checkMSharesHealth());
      } else {
        initHealthCheck()
      }
    }
    if ( prevState.overallHealth != this.state.overallHealth ) {
      this.onChangeOverAllHealth()
    }
    if (
      prevState.overallHealth != this.state.overallHealth &&
      this.state.overallHealth
    ) {
      this.onOverAllHealth()
    }
    if (
      prevState.autoHighlightFlags != this.state.autoHighlightFlags ||
      prevState.overallHealth != this.state.overallHealth
    ) {
      if ( this.state.autoHighlightFlags ) {
        this.autoHighlight()
        AsyncStorage.setItem(
          'AutoHighlightFlags',
          JSON.stringify( this.state.autoHighlightFlags )
        )
      }
    }
    if ( prevProps.trustedContactsInfo != this.props.trustedContactsInfo ) {
      this.setContactsFromAsync()
    }
    if ( prevProps.healthLoading != this.props.healthLoading ) {
      if ( this.props.healthLoading ) this.setState( {
        showLoader: true
      } )
      else this.setState( {
        showLoader: false
      } )
    }
    if ( prevProps.health != this.props.health ) {
      if ( this.props.health )
        this.setState( {
          overallHealth: this.props.health
        } )
      else {
        ( async () => {
          const storedHealth = await AsyncStorage.getItem( 'overallHealth' )
          if ( storedHealth ) {
            this.setState( {
              overallHealth: JSON.parse( storedHealth )
            } )
          }
        } )()
      }
    }
  };

  setContactsFromAsync = () => {
    const { trustedContactsInfo, trustedContactsService } = this.props
    const { pageData } = this.state
    if ( trustedContactsInfo ) {
      const selectedContacts = trustedContactsInfo.slice( 1, 3 )
      this.setState( {
        contacts: selectedContacts
      } )

      if ( selectedContacts[ 0 ] ) {
        const contactSelected = selectedContacts[ 0 ]
        const contactName = `${contactSelected.firstName} ${
          contactSelected.lastName ? contactSelected.lastName : ''
        }`
          .toLowerCase()
          .trim()

        const tcInstance =
          trustedContactsService.tc.trustedContacts[ contactName ]
        if ( tcInstance )
          contactSelected.contactsWalletName = tcInstance.contactsWalletName
        pageData[ 1 ].personalInfo = contactSelected
      }
      if ( selectedContacts[ 1 ] ) {
        const contactSelected = selectedContacts[ 1 ]
        const contactName = `${contactSelected.firstName} ${
          contactSelected.lastName ? contactSelected.lastName : ''
        }`
          .toLowerCase()
          .trim()
        const tcInstance =
          trustedContactsService.tc.trustedContacts[ contactName ]
        if ( tcInstance )
          contactSelected.contactsWalletName = tcInstance.contactsWalletName
        pageData[ 2 ].personalInfo = contactSelected
      }
      this.setState( {
        pageData: [ ...pageData ]
      } )
    }
  };

  onOverAllHealth = () => {
    const { autoHighlightFlags, overallHealth } = this.state
    // update acc to overall health (aids post wallet recovery)
    const updatedAutoHighlightFlags = {
      ...autoHighlightFlags,
    }
    if ( overallHealth.sharesInfo[ 0 ] && overallHealth.sharesInfo[ 0 ].updatedAt ) {
      updatedAutoHighlightFlags.secondaryDevice = true
    }

    if ( overallHealth.sharesInfo[ 1 ] && overallHealth.sharesInfo[ 1 ].updatedAt ) {
      updatedAutoHighlightFlags.trustedContact1 = true
    }

    if ( overallHealth.sharesInfo[ 2 ] && overallHealth.sharesInfo[ 2 ].updatedAt ) {
      updatedAutoHighlightFlags.trustedContact2 = true
    }

    if ( overallHealth.sharesInfo[ 3 ] && overallHealth.sharesInfo[ 3 ].updatedAt ) {
      updatedAutoHighlightFlags.personalCopy1 = true
    }

    if ( overallHealth.sharesInfo[ 4 ] && overallHealth.sharesInfo[ 4 ].updatedAt ) {
      updatedAutoHighlightFlags.personalCopy2 = true
    }

    if ( overallHealth.qaStatus.updatedAt ) {
      updatedAutoHighlightFlags.securityAns = true
    }

    if (
      JSON.stringify( updatedAutoHighlightFlags ) !==
      JSON.stringify( autoHighlightFlags )
    ) {
      this.setState( {
        autoHighlightFlags: updatedAutoHighlightFlags
      } )
      // TODO -- replace this
      AsyncStorage.setItem(
        'AutoHighlightFlags',
        JSON.stringify( updatedAutoHighlightFlags )
      )
    }
  };

  onChangeOverAllHealth = () => {
    const { overallHealth, pageData } = this.state
    if ( overallHealth ) {
      this.setState( {
        isNextStepDisable: false
      } )
      const updatedPageData = [ ...pageData ]
      updatedPageData.forEach( ( data ) => {
        switch ( data.title ) {
            case 'Secondary Device':
              if ( overallHealth.sharesInfo[ 0 ] ) {
                data.status = overallHealth.sharesInfo[ 0 ].shareStage
                data.time = overallHealth.sharesInfo[ 0 ].updatedAt
              }
              break

            case 'Trusted Contact 1':
              if ( overallHealth.sharesInfo[ 1 ] ) {
                data.status = overallHealth.sharesInfo[ 1 ].shareStage
                data.time = overallHealth.sharesInfo[ 1 ].updatedAt
              }
              break

            case 'Trusted Contact 2':
              if ( overallHealth.sharesInfo[ 2 ] ) {
                data.status = overallHealth.sharesInfo[ 2 ].shareStage
                data.time = overallHealth.sharesInfo[ 2 ].updatedAt
              }
              break

            case 'Personal Copy 1':
              if ( overallHealth.sharesInfo[ 3 ] ) {
                data.status = overallHealth.sharesInfo[ 3 ].shareStage
                data.time = overallHealth.sharesInfo[ 3 ].updatedAt
              }
              break

            case 'Personal Copy 2':
              if ( overallHealth.sharesInfo[ 4 ] ) {
                data.status = overallHealth.sharesInfo[ 4 ].shareStage
                data.time = overallHealth.sharesInfo[ 4 ].updatedAt
              }
              break

            case 'Security Questions':
              data.status = overallHealth.qaStatus.stage
              data.time = overallHealth.qaStatus.updatedAt
              break

            default:
              break
        }
      } )
      this.setState( {
        pageData: updatedPageData
      } )
    }
  };

  getIconByStatus = ( status ) => {
    if ( status == 'Ugly' ) {
      return require( '../../assets/images/icons/icon_error_red.png' )
    } else if ( status == 'Bad' ) {
      return require( '../../assets/images/icons/icon_error_yellow.png' )
    } else if ( status == 'Good' ) {
      return require( '../../assets/images/icons/icon_check.png' )
    }
  };

  getStatusIcon = ( item ) => {
    const { autoHighlightFlags } = this.state
    if ( item.type == 'secondaryDevice' && autoHighlightFlags.secondaryDevice ) {
      return {
        icon: this.getIconByStatus( item.status ),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      }
    }
    if ( item.type == 'contact1' && autoHighlightFlags.trustedContact1 ) {
      return {
        icon: this.getIconByStatus( item.status ),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      }
    }
    if ( item.type == 'contact2' && autoHighlightFlags.trustedContact2 ) {
      return {
        icon: this.getIconByStatus( item.status ),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      }
    }
    if ( item.type == 'copy1' && autoHighlightFlags.personalCopy1 ) {
      return {
        icon: this.getIconByStatus( item.status ),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      }
    }
    if ( item.type == 'copy2' && autoHighlightFlags.personalCopy2 ) {
      return {
        icon: this.getIconByStatus( item.status ),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      }
    }
    if ( item.type == 'security' && autoHighlightFlags.securityAns ) {
      return {
        icon: this.getIconByStatus( item.status ),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      }
    }
    return {
      icon: require( '../../assets/images/icons/icon_error_gray.png' ),
      color: Colors.lightTextColor,
    }
  };

  getTime = ( item ) => {
    return ( item.toString() && item.toString() == '0' ) ||
      item.toString() == 'never'
      ? 'never'
      : timeFormatter( moment( new Date() ), item )
  };

  getImageIcon = ( item ) => {
    if ( item.type == 'contact1' || item.type == 'contact2' ) {
      if ( item.personalInfo ) {
        if ( item.personalInfo.imageAvailable ) {
          return (
            <Image
              source={item.personalInfo.image}
              style={{
                width: 35,
                height: 35,
                borderRadius: 35 / 2,
                resizeMode: 'contain',
              }}
            />
          )
        } else {
          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.shadowBlue,
                width: 35,
                height: 35,
                borderRadius: 30,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  lineHeight: 13, //... One for top and one for bottom alignment
                }}
              >
                {item.personalInfo
                  ? nameToInitials(
                    item.personalInfo.firstName && item.personalInfo.lastName
                      ? item.personalInfo.firstName +
                            ' ' +
                            item.personalInfo.lastName
                      : item.personalInfo.firstName &&
                          !item.personalInfo.lastName
                        ? item.personalInfo.firstName
                        : !item.personalInfo.firstName &&
                          item.personalInfo.lastName
                          ? item.personalInfo.lastName
                          : ''
                  )
                  : ''}
              </Text>
            </View>
          )
        }
      }
    }
    return (
      <Image style={styles.cardImage} source={this.getImageByType( item )} />
    )
  };

  getImageByType = ( item ) => {
    const type = item.type
    if ( type == 'secondaryDevice' ) {
      return require( '../../assets/images/icons/icon_secondarydevice.png' )
    } else if ( type == 'contact1' || type == 'contact2' ) {
      return require( '../../assets/images/icons/icon_user.png' )
    } else if ( type == 'copy1' || type == 'copy2' ) {
      if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'GoogleDrive'
      ) {
        return Icons.manageBackup.PersonalCopy.icloud
      } else if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'Email'
      ) {
        return Icons.manageBackup.PersonalCopy.email
      } else if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'Print'
      ) {
        return Icons.manageBackup.PersonalCopy.print
      } else {
        return require( '../../assets/images/icons/note.png' )
      }
    }
    if ( type == 'print' ) {
      return require( '../../assets/images/icons/print.png' )
    } else if ( type == 'security' ) {
      return require( '../../assets/images/icons/icon_securityquestion.png' )
    }
  };

  getCardTitle = ( item ) => {
    if ( item.type === 'contact1' || item.type === 'contact2' ) {
      if ( item.personalInfo ) {
        if ( item.personalInfo.firstName && item.personalInfo.lastName ) {
          return item.personalInfo.firstName + ' ' + item.personalInfo.lastName
        }
        if ( !item.personalInfo.firstName && item.personalInfo.lastName ) {
          return item.personalInfo.lastName
        }
        if ( item.personalInfo.firstName && !item.personalInfo.lastName ) {
          return item.personalInfo.firstName
        }

        return ''
      } else {
        return 'Friends and Family'
      }
    }

    if ( item.type === 'copy1' || item.type === 'copy2' ) {
      return 'Personal Copy'
    }

    if ( item.type === 'secondaryDevice' ) {
      return 'Keeper Device'
    }

    if ( item.type === 'security' ) {
      return 'Security Question'
    }

    return item.title
  };

  getCardSubText = ( item ) => {
    const { autoHighlightFlags } = this.state
    if ( item.type == 'secondaryDevice' ) {
      if ( autoHighlightFlags.secondaryDevice ) {
        return item.status == 'Ugly'
          ? 'Confirm by logging on the Keeper Device'
          : item.status == 'Bad'
            ? 'Confirm by logging on the Keeper Device'
            : item.status == 'Good'
              ? 'The Recovery Key is accessible'
              : 'Use one of your other device with Hexa'
      } else {
        return 'Use one of your other device with Hexa'
      }
    }
    if ( item.type == 'contact1' ) {
      if ( autoHighlightFlags.trustedContact1 ) {
        return item.status == 'Ugly'
          ? 'Confirm by asking the contact to go online'
          : item.status == 'Bad'
            ? 'Confirm by asking the contact to go online'
            : item.status == 'Good'
              ? 'The Recovery Key is accessible'
              : 'Select a contact as a Keeper'
      } else {
        return 'Select a contact as a Keeper'
      }
    }
    if ( item.type == 'contact2' ) {
      if ( autoHighlightFlags.trustedContact2 ) {
        return item.status == 'Ugly'
          ? 'Confirm by asking the contact to go online'
          : item.status == 'Bad'
            ? 'Confirm by asking the contact to go online'
            : item.status == 'Good'
              ? 'The Recovery Key is accessible'
              : 'Select a contact as a Keeper'
      } else {
        return 'Select a contact as a Keeper'
      }
    }
    if ( item.type == 'copy1' ) {
      if ( autoHighlightFlags.personalCopy1 ) {
        return item.status == 'Ugly'
          ? 'Confirm by scanning pdf’s first QR'
          : item.status == 'Bad'
            ? 'Confirm by scanning pdf’s first QR'
            : item.status == 'Good'
              ? 'The Recovery Key is accessible'
              : 'Secure your Recovery Key as a file (pdf)'
      } else {
        return 'Secure your Recovery Key as a file (pdf)'
      }
    }
    if ( item.type == 'copy2' ) {
      if ( autoHighlightFlags.personalCopy2 ) {
        return item.status == 'Ugly'
          ? 'Confirm by scanning pdf’s first QR'
          : item.status == 'Bad'
            ? 'Confirm by scanning pdf’s first QR'
            : item.status == 'Good'
              ? 'The Recovery Key is accessible'
              : 'Secure your Recovery Key as a file (pdf)'
      } else {
        return 'Secure your Recovery Key as a file (pdf)'
      }
    }
    if ( item.type == 'security' ) {
      if ( autoHighlightFlags.securityAns ) {
        return item.status == 'Ugly'
          ? 'Confirm the Security Question and Answer'
          : item.status == 'Bad'
            ? 'Confirm the Security Question and Answer'
            : item.status == 'Good'
              ? 'Security Question and Answer are confirmed'
              : 'Last Backup'
      } else {
        return 'Last Backup'
      }
    }
  };

  renderWalletBackupAndRecoveryContents = () => {
    return (
      <ManageBackupHelpContents
        titleClicked={() => {
          if ( ( this.refs.WalletBackupAndRecoveryBottomSheet as any ).current )
            ( this.refs
              .WalletBackupAndRecoveryBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderWalletBackupAndRecoveryHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if ( ( this.refs.WalletBackupAndRecoveryBottomSheet as any ).current )
            ( this.refs
              .WalletBackupAndRecoveryBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderRegenerateShareHelperContents = () => {
    return (
      <RegenerateHealper
        topButtonText={'Regenerate Shares'}
        continueButtonText={'Continue'}
        quitButtonText={'Quit'}
        onPressRegenerateShare={() => {
          ( this.refs.RegenerateShareHelperBottomSheet as any ).snapTo( 0 )
          this.props.navigation.navigate( 'NewWalletNameRegenerateShare' )
        }}
        onPressContinue={() => {
          ( this.refs.RegenerateShareHelperBottomSheet as any ).snapTo( 0 )
          this.props.navigation.navigate( 'NewWalletNameRegenerateShare' )
        }}
        onPressQuit={() => {
          ( this.refs.RegenerateShareHelperBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderRegenerateShareHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHandle={() => {
          ( this.refs.RegenerateShareHelperBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderSecondaryDeviceHistoryContent = () => {
    return (
      <SecondaryDeviceHealthCheck
        data={this.state.secondaryDeviceHistory}
        title={'Keeper Device'}
        time={this.state.selectedTime}
        status={this.state.selectedStatus}
        reshareInfo={
          'Want to send the Recovery Key again to the same destination? '
        }
        onPressConfirm={() => {
          ( this.refs.ConfirmBottomSheet as any ).snapTo( 1 )
        }}
        onPressReshare={() => {
          ( this.refs.ReshareBottomSheet as any ).snapTo( 1 )
        }}
        modalRef={this.refs.SecondaryDeviceHistoryBottomSheet}
        onPressBack={() => {
          ( this.refs.SecondaryDeviceHistoryBottomSheet as any ).snapTo(
            0
          )
        }}
      />
    )
  };

  renderSecondaryDeviceHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          ( this.refs.SecondaryDeviceHistoryBottomSheet as any ).snapTo(
            0
          )
        }}
      />
    )
  };

  renderPersonalCopyHistoryContent = () => {
    return (
      <SecondaryDeviceHealthCheck
        data={this.state.secondaryDeviceHistory}
        title={'Personal Copy'}
        time={this.state.selectedTime}
        status={this.state.selectedStatus}
        reshareInfo={
          'Want to send the Recovery Key again to the same destination? '
        }
        onPressConfirm={() => {
          ( this.refs.ConfirmBottomSheet as any ).snapTo( 1 )
        }}
        onPressReshare={() => {
          ( this.refs.ReshareBottomSheet as any ).snapTo( 1 )
        }}
        modalRef={this.refs.PersonalCopyHistoryBottomSheet}
        onPressBack={() => {
          ( this.refs.PersonalCopyHistoryBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderPersonalCopyHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          ( this.refs.PersonalCopyHistoryBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderSecurityQuestionHistoryContent = () => {
    return (
      <SecondaryDeviceHealthCheck
        data={this.state.secondaryDeviceHistory}
        title={'Security Question'}
        time={this.state.selectedTime}
        status={this.state.selectedStatus}
        onPressConfirm={() => {
          ( this.refs.ConfirmBottomSheet as any ).snapTo( 1 )
        }}
        modalRef={this.refs.SecurityQuestionHistoryBottomSheet}
        onPressBack={() => {
          ( this.refs.SecurityQuestionHistoryBottomSheet as any ).snapTo(
            0
          )
        }}
      />
    )
  };

  renderSecurityQuestionHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          ( this.refs.SecurityQuestionHistoryBottomSheet as any ).snapTo(
            0
          )
        }}
      />
    )
  };

  renderChangeContent = () => {
    return (
      <ErrorModalContents
        modalRef={this.refs.ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper?'}
        note={
          'You can change the Keeper you selected to sebd your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          this.setState( {
            isReshare: false
          } );
          ( this.refs.ChangeBottomSheet as any ).snapTo( 0 )
        }}
        onPressIgnore={() => {
          ( this.refs.ChangeBottomSheet as any ).snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  };

  renderChangeHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( this.refs.ChangeBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderReshareContent = () => {
    const { SelectTypeToReshare } = this.state
    let title = ''
    let info = ''
    let note = ''
    if ( SelectTypeToReshare == 'secondaryDevice' ) {
      title = 'Reshare Recovery Key\nwith Keeper Device'
      info = 'Did your Keeper device not receive the Recovery Key?'
      note = 'You can reshare the Recovery Key with your \nKeeper Device'
    } else if (
      SelectTypeToReshare == 'contact1' ||
      SelectTypeToReshare == 'contact2'
    ) {
      title = 'Reshare Recovery Key\nwith Keeper'
      info = 'Did your Keeper not receive the Recovery Key?'
      note = 'You can reshare the Recovery Key with your Keeper'
    } else if (
      SelectTypeToReshare == 'copy1' ||
      SelectTypeToReshare == 'copy2'
    ) {
      title = 'Reshare Recovery Key\nwith Personal Copy'
      info = 'Did your personal Copies not receive the Recovery Key?'
      note = 'You can reshare the Recovery Key with your \nPersonal Copy'
    }
    return (
      <ErrorModalContents
        modalRef={this.refs.ReshareBottomSheet}
        title={title}
        info={info}
        note={note}
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          this.onPressReshare()
        }}
        onPressIgnore={() => {
          ( this.refs.ReshareBottomSheet as any ).snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  };

  onPressReshare = () => {
    const { SelectTypeToReshare } = this.state
    this.setState( {
      isReshare: true
    } )
    if ( SelectTypeToReshare == 'secondaryDevice' ) {
      ( this.refs.SecondaryDeviceHistoryBottomSheet as any ).snapTo( 0 )
    } else if ( SelectTypeToReshare == 'contact1' ) {
      ( this.refs.CommunicationModeBottomSheet as any ).snapTo( 1 )
    } else if ( SelectTypeToReshare == 'contact2' ) {
      ( this.refs.CommunicationModeBottomSheet as any ).snapTo( 1 )
    } else if ( SelectTypeToReshare == 'copy1' ) {
      ( this.refs.PersonalCopyHistoryBottomSheet as any ).snapTo( 0 )
    } else if ( SelectTypeToReshare == 'copy2' ) {
      ( this.refs.PersonalCopyHistoryBottomSheet as any ).snapTo( 0 )
    } else if ( SelectTypeToReshare == 'security' ) {
      ( this.refs.SecurityQuestionHistoryBottomSheet as any ).snapTo( 0 )
    }
    ( this.refs.ReshareBottomSheet as any ).snapTo( 0 )
  };

  renderReshareHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( this.refs.ReshareBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  renderPersonalCopyConfirmModalContent = () => {
    return (
      <CloudHealthCheck
        LoadCamera={this.state.LoadCamera}
        modalRef={this.refs.PersonalCopyQRScannerBottomSheet}
        scannedCode={this.getScannerData}
        goPressBack={() => this.closePersonalCopyQRScanner()}
        onPressProceed={() => {}}
        onPressIgnore={() => this.closePersonalCopyQRScanner()}
      />
    )
  };

  closePersonalCopyQRScanner = () => {
    this.setState( {
      LoadCamera: false, selectedType: ''
    } );
    ( this.refs.PersonalCopyQRScannerBottomSheet as any ).snapTo( 0 )
  };

  renderPersonalCopyConfirmModalHeader = () => {
    return (
      <ModalHeader onPressHeader={() => this.closePersonalCopyQRScanner()} />
    )
  };

  getScannerData = ( data ) => {
    console.log( 'data', data )
  };

  renderConfirmContent = () => {
    const { SelectTypeToReshare } = this.state
    let title = ''
    let info = ''
    let note = ''
    let proceedButtonText = ''
    if ( SelectTypeToReshare == 'secondaryDevice' ) {
      title = 'Confirm Recovery Key\nwith Keeper Device'
      info = 'Your Keeper Device seems away from their Hexa App'
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key'
      proceedButtonText = 'Send a message'
    } else if (
      SelectTypeToReshare == 'contact1' ||
      SelectTypeToReshare == 'contact2'
    ) {
      title = 'Confirm Recovery Key\nwith Keeper'
      info = 'Your Keeper seems away from their Hexa App'
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key'
      proceedButtonText = 'Confirm'
    } else if (
      SelectTypeToReshare == 'copy1' ||
      SelectTypeToReshare == 'copy2'
    ) {
      title = 'Confirm Recovery Key\nwith Personal Copy'
      info = 'Your Keeper seems away from their Hexa App'
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key'
      proceedButtonText = 'Confirm'
    } else if ( SelectTypeToReshare == 'security' ) {
      title = 'Confirm Recovery Key\nwith Security Question'
      info = 'Your Security Question seems away from their Hexa App'
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key'
      proceedButtonText = 'Confirm'
    }
    return (
      <ErrorModalContents
        modalRef={this.refs.ConfirmBottomSheet}
        title={title}
        info={info}
        note={note}
        proceedButtonText={proceedButtonText}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          this.onPressConfirm()
        }}
        onPressIgnore={() => {
          ( this.refs.ConfirmBottomSheet as any ).snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  };

  onPressConfirm = () => {
    const { SelectTypeToReshare } = this.state
    if (
      SelectTypeToReshare == 'secondaryDevice' ||
      SelectTypeToReshare == 'contact1' ||
      SelectTypeToReshare == 'contact2'
    ) {
      this.setState( {
        selectedType: ''
      } )
    }
    if ( SelectTypeToReshare == 'copy1' || SelectTypeToReshare == 'copy2' ) {
      this.setState( {
        LoadCamera: true
      } )
    }
    if ( SelectTypeToReshare == 'secondaryDevice' ) {
      ( this.refs.SecondaryDeviceHistoryBottomSheet as any ).snapTo( 0 )
    } else if ( SelectTypeToReshare == 'copy1' ) {
      ( this.refs.PersonalCopyHistoryBottomSheet as any ).snapTo( 0 );
      ( this.refs.PersonalCopyQRScannerBottomSheet as any ).snapTo( 1 )
    } else if ( SelectTypeToReshare == 'copy2' ) {
      ( this.refs.PersonalCopyHistoryBottomSheet as any ).snapTo( 0 );
      ( this.refs.PersonalCopyQRScannerBottomSheet as any ).snapTo( 1 )
    } else if ( SelectTypeToReshare == 'security' ) {
      ( this.refs.SecurityQuestionHistoryBottomSheet as any ).snapTo( 0 )
    }
    ( this.refs.ConfirmBottomSheet as any ).snapTo( 0 )
  };

  renderConfirmHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( this.refs.ConfirmBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  };

  autoHighlight = async () => {
    const { overallHealth, autoHighlightFlags } = this.state
    const {
      secondaryDevice,
      trustedContact1,
      trustedContact2,
      personalCopy1,
      personalCopy2,
      securityAns,
    } = autoHighlightFlags
    let selectedType = ''
    if ( !overallHealth ) {
      if ( !secondaryDevice ) selectedType = 'secondaryDevice'
      else if ( !trustedContact1 ) selectedType = 'contact1'
      else if ( !trustedContact2 ) selectedType = 'contact2'
      else if ( !personalCopy1 ) selectedType = 'copy1'
      else if ( !personalCopy2 ) selectedType = 'copy2'
      else if ( !securityAns ) selectedType = 'security'
      this.setState( {
        selectedType
      } )
      return
    }
    if (
      !secondaryDevice &&
      !( overallHealth.sharesInfo[ 0 ] && overallHealth.sharesInfo[ 0 ].updatedAt )
    ) {
      selectedType = 'secondaryDevice'
    } else if (
      !trustedContact1 &&
      !( overallHealth.sharesInfo[ 1 ] && overallHealth.sharesInfo[ 1 ].updatedAt )
    ) {
      selectedType = 'contact1'
    } else if (
      !trustedContact2 &&
      !( overallHealth.sharesInfo[ 2 ] && overallHealth.sharesInfo[ 2 ].updatedAt )
    ) {
      selectedType = 'contact2'
    } else if (
      !personalCopy1 &&
      !( overallHealth.sharesInfo[ 3 ] && overallHealth.sharesInfo[ 3 ].updatedAt )
    ) {
      selectedType = 'copy1'
    } else if (
      !personalCopy2 &&
      !( overallHealth.sharesInfo[ 4 ] && overallHealth.sharesInfo[ 4 ].updatedAt )
    ) {
      selectedType = 'copy2'
    } else if ( !securityAns && !overallHealth.qaStatus.updatedAt ) {
      selectedType = 'security'
    } else {
      if ( overallHealth ) {
        if (
          overallHealth.sharesInfo[ 0 ] &&
          overallHealth.sharesInfo[ 0 ].shareStage === 'Ugly'
        ) {
          selectedType = 'secondaryDevice'
        } else if (
          overallHealth.sharesInfo[ 1 ] &&
          overallHealth.sharesInfo[ 1 ].shareStage === 'Ugly'
        ) {
          selectedType = 'contact1'
        } else if (
          overallHealth.sharesInfo[ 2 ] &&
          overallHealth.sharesInfo[ 2 ].shareStage === 'Ugly'
        ) {
          selectedType = 'contact2'
        } else if (
          overallHealth.sharesInfo[ 3 ] &&
          overallHealth.sharesInfo[ 3 ].shareStage === 'Ugly'
        ) {
          selectedType = 'copy1'
        } else if (
          overallHealth.sharesInfo[ 4 ] &&
          overallHealth.sharesInfo[ 4 ].shareStage === 'Ugly'
        ) {
          selectedType = 'copy2'
        } else if ( overallHealth.qaStatus.stage === 'Ugly' ) {
          selectedType = 'security'
        } else if (
          overallHealth.sharesInfo[ 0 ] &&
          overallHealth.sharesInfo[ 0 ].shareStage === 'Bad'
        ) {
          selectedType = 'secondaryDevice'
        } else if (
          overallHealth.sharesInfo[ 1 ] &&
          overallHealth.sharesInfo[ 1 ].shareStage === 'Bad'
        ) {
          selectedType = 'contact1'
        } else if (
          overallHealth.sharesInfo[ 2 ] &&
          overallHealth.sharesInfo[ 2 ].shareStage === 'Bad'
        ) {
          selectedType = 'contact2'
        } else if (
          overallHealth.sharesInfo[ 3 ] &&
          overallHealth.sharesInfo[ 3 ].shareStage === 'Bad'
        ) {
          selectedType = 'copy1'
        } else if (
          overallHealth.sharesInfo[ 4 ] &&
          overallHealth.sharesInfo[ 4 ].shareStage === 'Bad'
        ) {
          selectedType = 'copy2'
        } else if ( overallHealth.qaStatus.stage === 'Bad' ) {
          selectedType = 'security'
        }
      }
    }
    this.setState( {
      selectedType
    } )
  };

  render() {
    const { selectedType, pageData, showLoader } = this.state
    const { navigation, healthLoading, walletCheckIn } = this.props
    return (
      <View style={{
        flex: 1, backgroundColor: 'white'
      }}>
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackArrowView}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate( 'UpgradeBackup' )
            }}
            style={styles.rightButton}
          >
            <AntDesign
              name="reload1"
              color={Colors.blue}
              size={15}
              style={{
                marginLeft: wp( '1%' ),
                marginRight: wp( '1%' ),
                alignSelf: 'center',
              }}
            />
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular,
                textAlign: 'center',
              }}
            >
              Upgrade
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerSettingImageView}
          >
            <Image
              source={require('../../assets/images/icons/setting.png')}
              style={styles.headerSettingImage}
            />
          </TouchableOpacity>*/}
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={healthLoading}
              onRefresh={() => {
                const synchingContacts = true
                walletCheckIn( synchingContacts )
              }}
            />
          }
          style={{
            flex: 1
          }}
        >
          <View style={styles.topHealthView}>
            <ImageBackground
              source={require( '../../assets/images/icons/keeper_sheild.png' )}
              style={{
                ...styles.healthShieldImage, position: 'relative'
              }}
              resizeMode={'contain'}
            >
              <View
                style={{
                  backgroundColor: Colors.red,
                  height: wp( '3%' ),
                  width: wp( '3%' ),
                  borderRadius: wp( '3%' ) / 2,
                  position: 'absolute',
                  top: wp( '5%' ),
                  right: 0,
                  borderWidth: 2,
                  borderColor: Colors.white,
                }}
              />
            </ImageBackground>
            <View style={styles.headerSeparator} />
            <View>
              <Text style={styles.backupText}>Backup</Text>
              <Text style={styles.backupInfoText}>Security is</Text>
              <Text style={styles.backupInfoText}>Not Upgraded</Text>
            </View>
          </View>
          <View style={{
            marginBottom: 10, marginTop: 25
          }}>
            {pageData.map( ( item, index ) => {
              return (
                <View style={{
                }}>
                  <TouchableOpacity
                    onPress={() => {
                      if ( item.type == 'secondaryDevice' ) {
                        this.props.navigation.navigate(
                          'SecondaryDeviceHistory',
                          {
                            selectedStatus: item.status,
                            selectedTime: this.getTime( item.time ),
                            selectedTitle: this.getCardTitle( item ),
                            updateAutoHighlightFlags: () =>
                              this.setState( {
                                autoHighlightFlags: {
                                  ...this.state.autoHighlightFlags,
                                  secondaryDevice: true,
                                },
                              } ),
                          }
                        )
                      } else if ( item.type == 'contact1' ) {
                        this.props.navigation.navigate(
                          'TrustedContactHistory',
                          {
                            selectedStatus: item.status,
                            selectedTime: this.getTime( item.time ),
                            selectedTitle: item.title,
                            updateAutoHighlightFlags: () =>
                              this.setState( {
                                autoHighlightFlags: {
                                  ...this.state.autoHighlightFlags,
                                  trustedContact1: true,
                                },
                              } ),
                            activateReshare: this.state.autoHighlightFlags
                              .trustedContact1,
                          }
                        )
                      } else if ( item.type == 'contact2' ) {
                        this.props.navigation.navigate(
                          'TrustedContactHistory',
                          {
                            selectedStatus: item.status,
                            selectedTime: this.getTime( item.time ),
                            selectedTitle: item.title,
                            updateAutoHighlightFlags: () =>
                              this.setState( {
                                autoHighlightFlags: {
                                  ...this.state.autoHighlightFlags,
                                  trustedContact2: true,
                                },
                              } ),
                            activateReshare: this.state.autoHighlightFlags
                              .trustedContact2,
                          }
                        )
                      } else if ( item.type === 'copy1' ) {
                        this.props.navigation.navigate( 'PersonalCopyHistory', {
                          selectedStatus: item.status,
                          selectedTime: this.getTime( item.time ),
                          selectedTitle: item.title,
                          selectedPersonalCopy: item,
                          updateAutoHighlightFlags: () =>
                            this.setState( {
                              autoHighlightFlags: {
                                ...this.state.autoHighlightFlags,
                                personalCopy1: true,
                              },
                            } ),
                        } )
                      } else if ( item.type == 'copy2' ) {
                        this.props.navigation.navigate( 'PersonalCopyHistory', {
                          selectedStatus: item.status,
                          selectedTime: this.getTime( item.time ),
                          selectedTitle: item.title,
                          selectedPersonalCopy: item,
                          updateAutoHighlightFlags: () =>
                            this.setState( {
                              autoHighlightFlags: {
                                ...this.state.autoHighlightFlags,
                                personalCopy2: true,
                              },
                            } ),
                        } )
                      } else if ( item.type == 'security' ) {
                        this.props.navigation.navigate(
                          'SecurityQuestionHistory',
                          {
                            selectedStatus: item.status,
                            selectedTime: this.getTime( item.time ),
                            selectedTitle: this.getCardTitle( item ),
                            updateAutoHighlightFlags: () =>
                              this.setState( {
                                autoHighlightFlags: {
                                  ...this.state.autoHighlightFlags,
                                  securityAns: true,
                                },
                              } ),
                          }
                        )
                      }
                    }}
                    style={{
                      ...styles.manageBackupCard,
                      borderColor: this.getStatusIcon( item ).color,
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
                          ? {
                            width: 0, height: 10
                          }
                          : {
                            width: 0, height: 0
                          },
                      shadowRadius:
                        selectedType && item.type == selectedType ? 10 : 0,
                    }}
                  >
                    {this.getImageIcon( item )}
                    <View style={{
                      flex: 1, marginHorizontal: 15
                    }}>
                      <Text style={styles.cardTitleText}>
                        {this.getCardTitle( item )}
                      </Text>
                      <View style={{
                        flex: 1, flexDirection: 'row'
                      }}>
                        <Text style={styles.cardTimeText}>
                          {this.getCardSubText( item )}
                          {( item.type === 'security' ||
                            ( item.type === 'secondaryDevice' &&
                              item.status !== 'Ugly' ) ) && (
                            <Text
                              style={{
                                color: Colors.textColorGrey,
                                fontSize: RFValue( 10 ),
                                fontFamily: Fonts.FiraSansMediumItalic,
                                fontWeight: 'bold',
                                fontStyle: 'italic',
                              }}
                            >
                              {' '}
                              {this.getTime( item.time )}
                            </Text>
                          )}
                        </Text>
                      </View>
                    </View>
                    <Image
                      style={styles.cardIconImage}
                      source={this.getStatusIcon( item ).icon}
                    />
                  </TouchableOpacity>
                </View>
              )
            } )}
          </View>
        </ScrollView>
        {showLoader ? <Loader /> : null}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'WalletBackupAndRecoveryBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '89%' )
              : hp( '89%' ),
          ]}
          renderContent={this.renderWalletBackupAndRecoveryContents}
          renderHeader={this.renderWalletBackupAndRecoveryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'RegenerateShareHelperBottomSheet'}
          snapPoints={[ -50, hp( '95%' ) ]}
          renderContent={this.renderRegenerateShareHelperContents}
          renderHeader={this.renderRegenerateShareHelperHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'PersonalCopyQRScannerBottomSheet'}
          snapPoints={[ -30, hp( '90%' ) ]}
          renderContent={this.renderPersonalCopyConfirmModalContent}
          renderHeader={this.renderPersonalCopyConfirmModalHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'SecondaryDeviceHistoryBottomSheet'}
          snapPoints={[ -30, hp( '90%' ) ]}
          renderContent={this.renderSecondaryDeviceHistoryContent}
          renderHeader={this.renderSecondaryDeviceHistoryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'PersonalCopyHistoryBottomSheet'}
          snapPoints={[ -30, hp( '90%' ) ]}
          renderContent={this.renderPersonalCopyHistoryContent}
          renderHeader={this.renderPersonalCopyHistoryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'SecurityQuestionHistoryBottomSheet'}
          snapPoints={[ -30, hp( '90%' ) ]}
          renderContent={this.renderSecurityQuestionHistoryContent}
          renderHeader={this.renderSecurityQuestionHistoryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'ChangeBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '37%' )
              : hp( '45%' ),
          ]}
          renderContent={this.renderChangeContent}
          renderHeader={this.renderChangeHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'ReshareBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '37%' )
              : hp( '45%' ),
          ]}
          renderContent={this.renderReshareContent}
          renderHeader={this.renderReshareHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'ConfirmBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '37%' )
              : hp( '45%' ),
          ]}
          renderContent={this.renderConfirmContent}
          renderHeader={this.renderConfirmHeader}
        />
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
    walletName:
      idx( state, ( _ ) => _.storage.database.WALLET_SETUP.walletName ) || '',
    s3Service: idx( state, ( _ ) => _.sss.service ),
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    healthLoading: idx( state, ( _ ) => _.trustedContacts.loading.walletCheckIn ),
    trustedContactsInfo: idx(
      state,
      ( _ ) => _.trustedContacts.trustedContactsInfo
    ),
    trustedContactsService: idx( state, ( _ ) => _.trustedContacts.service ),
    health: idx( state, ( _ ) => _.sss.overallHealth ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    walletCheckIn,
    initHealthCheck,
  } )( ManageBackupUpgradeSecurity )
)

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 10,
  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  cardTimeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
  },
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 'auto',
  },
  headerSettingImageView: {
    height: wp( '10%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSettingImage: {
    height: wp( '6%' ),
    width: wp( '6%' ),
  },
  topHealthView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthShieldImage: {
    width: wp( '17%' ),
    height: wp( '25%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSeparator: {
    backgroundColor: Colors.seaBlue,
    width: 4,
    borderRadius: 5,
    height: wp( '17%' ),
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
  },
  backupText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 15 ),
  },
  noteText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
  },
  backupInfoText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 18 ),
  },
  manageBackupCard: {
    flex: 1,
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
  cardTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: Colors.backgroundColor,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderColor,
  },
} )
