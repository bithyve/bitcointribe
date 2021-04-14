import React, { Component, createRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Platform,
  ImageBackground,
  Keyboard,
  AsyncStorage,
} from 'react-native'
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
import {
  fetchEphemeralChannel,
  clearPaymentDetails,
} from '../../store/actions/trustedContacts'
import idx from 'idx'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import moment from 'moment'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import DeviceInfo from 'react-native-device-info'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Loader from '../../components/loader'
import BottomInfoBox from '../../components/BottomInfoBox'
import RestoreFromICloud from '../RestoreHexaWithKeeper/RestoreFromICloud'
import SetupPrimaryKeeper from '../NewBHR/SetupPrimaryKeeper'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import SecurityQuestion from '../NewBHR/SecurityQuestion'
import UpgradingKeeperContact from './UpgradingKeeperContact'
import UpgradePdfKeeper from './UpgradePdfKeeper'
import Dash from 'react-native-dash'
import S3Service from '../../bitcoin/services/sss/S3Service'
import {
  initializeHealthSetup,
  updateMSharesHealth,
  initLevelTwo,
  generateMetaShare,
  keeperProcessStatus,
  updatedKeeperInfo,
  generateSMMetaShares
} from '../../store/actions/health'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { LevelHealthInterface, MetaShare } from '../../bitcoin/utilities/Interface'
import AccountShell from '../../common/data/models/AccountShell'
import PersonalNode from '../../common/data/models/PersonalNode'
import { initNewBHRFlow } from '../../store/actions/health'
import { setCloudData, updateHealthForCloud, } from '../../store/actions/cloud'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { setCloudDataForLevel, autoUploadSecondaryShare, autoShareContactKeeper } from '../../store/actions/upgradeToNewBhr'
import { addNewSecondarySubAccount } from '../../store/actions/accounts'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import TrustedContactsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import SecondaryDevice from '../NewBHR/SecondaryDeviceNewBHR'

interface UpgradeBackupStateTypes {
  selectedIds: any[];
  listData: {
    title: String;
    info: String;
    subTitle: String;
    type: String;
    image: any;
    status: String;
  }[];
  selectedContact: any[];
  encryptedCloudDataJson: any;
  isCloudBackupProcessing: Boolean;
  showLoader: boolean;
  isUpgradeDone: boolean;
  totalKeeper: number;
  availableKeeperInfo: {shareId: string; type: string;}[];
  levelToSetup: number;
  secondaryQR: string;
  selectedShareId: string;
}

interface UpgradeBackupPropsTypes {
  navigation: any;
  s3Service: S3Service;
  initializeHealthSetup: any;
  walletName: string;
  regularAccount: RegularAccount;
  database: any;
  updateHealthForCloud: any;
  cloudBackupStatus: CloudBackupStatus;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  updateMSharesHealth: any;
  accountShells: AccountShell[];
  activePersonalNode: PersonalNode;
  isBackupProcessing: any;
  initNewBHRFlow: any;
  versionHistory: any;
  setCloudData: any;
  overallHealth: any[];
  generateMetaShare: any;
  metaSharesKeeper: MetaShare[],
  initLevelTwo: any;
  healthCheckInitializedKeeper: boolean;
  setCloudDataForLevel: any;
  addNewSecondarySubAccount: any;
  trustedContacts: TrustedContactsService
  SHARES_TRANSFER_DETAILS: any;
  keeperProcessStatus: any;
  updatedKeeperInfo: any;
  uploadMetaShare: boolean;
  updateEphemeralChannelLoader: boolean;
  keeperProcessStatusFlag: KeeperProcessStatus;
  isSmMetaSharesCreatedFlag: boolean;
  generateSMMetaShares: any;
  autoUploadSecondaryShare: any;
  trustedContactsInfo: any;
  autoShareContactKeeper: any;
}

class UpgradeBackup extends Component<
  UpgradeBackupPropsTypes,
  UpgradeBackupStateTypes
> {
  RestoreFromICloud = createRef<BottomSheet>()
  UpgradingKeeperContact = createRef<BottomSheet>()
  UpgradePdfKeeper = createRef<BottomSheet>()
  SecurityQuestionBottomSheet = createRef<BottomSheet>()
  secondaryDeviceBottomSheet = createRef<BottomSheet>()
  constructor( props ) {
    super( props )
    this.RestoreFromICloud
    this.UpgradingKeeperContact
    this.UpgradePdfKeeper
    this.SecurityQuestionBottomSheet
    this.secondaryDeviceBottomSheet

    this.state = {
      isCloudBackupProcessing: false,
      selectedIds: [],
      encryptedCloudDataJson: [],
      listData: [
        {
          title: 'App Backup',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'cloud',
          image: require( '../../assets/images/icons/icon_backup.png' ),
          status: 'setup'
        },
        {
          title: 'Primary Keeper',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'primary',
          image: require( '../../assets/images/icons/icon_secondarydevice.png' ),
          status: 'setup'
        },
        {
          title: 'Keeper Contacts',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'contact',
          image: require( '../../assets/images/icons/icon_contact.png' ),
          status: 'setup'
        },
        {
          title: 'Keeper Device & PDF Keepers',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'devicePDF',
          image: require( '../../assets/images/icons/files-and-folders-2.png' ),
          status: 'setup'
        },
        {
          title: 'Security Question',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'securityQuestion',
          image: require( '../../assets/images/icons/icon_question.png' ),
          status: 'setup'
        },
      ],
      selectedContact: [
      ],
      showLoader: false,
      isUpgradeDone: false,
      totalKeeper: 0,
      availableKeeperInfo: [],
      levelToSetup: 0,
      secondaryQR: '',
      selectedShareId: '',
    }
  }

  componentDidMount = () => {
    const { trustedContactsInfo, overallHealth } = this.props
    let TotalKeeper = 1
    const keepersInfo = []
    for ( let i = 0; i < overallHealth.sharesInfo.length; i++ ) {
      const element = overallHealth.sharesInfo[ i ]
      const type = i == 0 ? 'device' : i == 1 || i == 2 ? 'contact' : 'pdf'
      const selectedContacts = []
      if ( ( i == 1 || i == 2 ) && element.updatedAt > 0 && trustedContactsInfo ) {
        if( trustedContactsInfo.slice( 1, 3 )[ 0 ] ) selectedContacts.push( trustedContactsInfo.slice( 1, 3 )[ 0 ] )
        if( trustedContactsInfo.slice( 1, 3 )[ 1 ] ) selectedContacts.push( trustedContactsInfo.slice( 1, 3 )[ 1 ] )
        this.setState( {
          selectedContact: selectedContacts
        } )
      }
      if( element.updatedAt > 0 ) {
        TotalKeeper = TotalKeeper + 1
        keepersInfo.push( {
          shareId: element.identifier, type
        } )
      }
    }
    this.setState( {
      totalKeeper: TotalKeeper,
      levelToSetup: TotalKeeper <= 1 ? 1 : TotalKeeper == 2 || TotalKeeper <= 3 ? 2 : 3,
      availableKeeperInfo: keepersInfo,
    } )
    console.log( 'TotalKeeper', TotalKeeper )
    this.nextToProcess( keepersInfo, TotalKeeper <= 1 ? 1 : TotalKeeper == 2 || TotalKeeper <= 3 ? 2 : 3 )
    this.updateListData( TotalKeeper <= 1 ? 1 : TotalKeeper == 2 || TotalKeeper <= 3 ? 2 : 3 )
  };

  nextToProcess = ( keepersInfo: {shareId: string; type: string}[], levelToSetup: number ) => {
    const { levelHealth } = this.props
    const { listData } = this.state
    if( levelHealth[ levelToSetup-1 ] ) {
      if( levelHealth[ levelToSetup-1 ].levelInfo[ 0 ] && levelHealth[ levelToSetup-1 ].levelInfo[ 0 ].shareType == 'cloud' && levelHealth[ levelToSetup-1 ].levelInfo[ 0 ].status == 'notAccessible' ){
        this.RestoreFromICloud.current.snapTo( 1 )
      }
      else if( levelHealth[ levelToSetup-1 ].levelInfo[ 2 ] && levelHealth[ levelToSetup-1 ].levelInfo[ 2 ].status == 'notAccessible' ){
        if( keepersInfo.findIndex( value => value.type == 'device' ) > -1 ) {
          console.log( 'levelHealth[ levelToSetup-1 ].levelInfo[ 2 ].shareId', levelHealth[ levelToSetup-1 ].levelInfo[ 2 ].shareId )
          this.props.autoUploadSecondaryShare( levelHealth[ levelToSetup-1 ].levelInfo[ 2 ].shareId )
        } else {
          this.secondaryDeviceBottomSheet.current.snapTo( 1 )
          this.createGuardian()
        }
      }
      else if( levelHealth[ levelToSetup-1 ].levelInfo[ 3 ] && levelHealth[ levelToSetup-1 ].levelInfo[ 3 ].status == 'notAccessible' ) {
        if( keepersInfo.findIndex( value => value.type == 'contact' ) > -1 ) {
          this.UpgradingKeeperContact.current.snapTo( 1 )
        }
      }
    } else {
      this.RestoreFromICloud.current.snapTo( 1 )
    }

  }

  updateListData = ( levelToSetup ) => {
    const { levelHealth } = this.props
    const { listData } = this.state
    console.log( 'levelHealth', levelHealth )
    if( levelHealth[ levelToSetup - 1 ] ) {
      for ( let i = 0; i < levelHealth[ levelToSetup - 1 ].levelInfo.length; i++ ) {
        const element = levelHealth[ levelToSetup - 1 ].levelInfo[ i ]
        if( element.shareType === 'cloud' && element.status === 'accessible' ) {
          listData[ 0 ].status = 'accessible'
        }
        if( i == 2 && element.shareType === 'device' && element.status === 'accessible' ) {
          listData[ 1 ].status = 'accessible'
        }
        else if( ( element.shareType == 'device'|| element.shareType == 'pdf' ) && element.status == 'accessible' ) {
          listData[ 3 ].status = 'accessible'
        }
        if( element.shareType == 'contact' && element.status == 'accessible' ) {
          listData[ 2 ].status = 'accessible'
        }
        if( element.shareType == 'securityQuestion' && element.status == 'accessible' ) {
          listData[ 4 ].status = 'accessible'
        }
      }
    }
    console.log( 'listData', listData )
    this.setState( {
      listData
    } )
  }

  componentDidUpdate = ( prevProps ) => {
    if (
      prevProps.levelHealth !=
        this.props.levelHealth &&
        prevProps.levelHealth.length == 0 && this.props.levelHealth.length == 1
    ) {
      this.props.setCloudData(  )
    }

    if( prevProps.cloudBackupStatus != this.props.cloudBackupStatus && ( this.props.cloudBackupStatus === CloudBackupStatus.COMPLETED || this.props.cloudBackupStatus === CloudBackupStatus.PENDING ) ){
      this.setState( {
        showLoader: false
      } )
      if( this.state.isUpgradeDone == true ) {
        this.props.initNewBHRFlow( true )
        this.props.navigation.replace( 'ManageBackupNewBHR' )
      }
    }

    if( prevProps.levelHealth !=
      this.props.levelHealth &&
      this.props.levelHealth.length > 1 &&
      this.props.levelHealth[ this.state.levelToSetup - 1 ].levelInfo[ 0 ].status == 'notAccessible' ) {
      console.log( 'this.props.levelHealth.length > 1 IN IF', this.props.levelHealth.length > 1 )
      this.props.setCloudDataForLevel( this.state.levelToSetup )
    }

    if( prevProps.SHARES_TRANSFER_DETAILS != this.props.SHARES_TRANSFER_DETAILS &&
      prevProps.trustedContacts != this.props.trustedContacts &&
      prevProps.uploadMetaShare != this.props.uploadMetaShare &&
      prevProps.updateEphemeralChannelLoader != this.props.updateEphemeralChannelLoader
    ){
      this.setSecondaryDeviceQR()
    }

    if( JSON.stringify( prevProps.levelHealth ) != JSON.stringify( this.props.levelHealth ) ){
      this.nextToProcess( this.state.availableKeeperInfo, this.state.levelToSetup )
      this.updateListData( this.state.levelToSetup )
    }

  };

  cloudBackup = () => {
    this.setState( {
      showLoader: true
    } )
    const { totalKeeper, levelToSetup } = this.state
    const { initializeHealthSetup, healthCheckInitializedKeeper } = this.props
    console.log( 'totalKeeper', totalKeeper )
    console.log( 'levelToSetup', levelToSetup )
    if( levelToSetup == 1 ) {
      if( healthCheckInitializedKeeper == false ) {
        initializeHealthSetup()
      }
      this.setState( {
        isUpgradeDone: true
      } )
    } else {
      this.props.generateMetaShare( levelToSetup, true )
      if( !this.props.isSmMetaSharesCreatedFlag ){
        this.props.generateSMMetaShares()
      }
    }
  };

  createGuardian = async ( ) => {
    const { trustedContacts, updatedKeeperInfo, keeperProcessStatus, accountShells, addNewSecondarySubAccount } = this.props
    const index = 0
    const firstName = 'Secondary'
    const lastName = 'Device1'

    const contactName = `${firstName} ${lastName ? lastName : ''}`
      .toLowerCase()
      .trim()

    const trustedContact = trustedContacts.tc.trustedContacts[ contactName ]
    let info = null
    if ( trustedContact && trustedContact.secondaryKey ) info = trustedContact.secondaryKey

    // Keeper setup started
    keeperProcessStatus( KeeperProcessStatus.IN_PROGRESS )
    updatedKeeperInfo( {
      shareId: this.state.selectedShareId,
      name: contactName,
      uuid: '',
      publicKey: '',
      ephemeralAddress: '',
      type: 'device',
      data: {
        name: contactName, index
      }
    } )

    const hasTrustedChannel = trustedContact.symmetricKey ? true : false
    const isEphemeralChannelExpired = trustedContact.ephemeralChannel &&
        trustedContact.ephemeralChannel.initiatedAt &&
        Date.now() - trustedContact.ephemeralChannel.initiatedAt >
        config.TC_REQUEST_EXPIRY? true: false

    if ( !hasTrustedChannel && isEphemeralChannelExpired ) this.setState( {
      secondaryQR: ''
    } )


    const contactInfo = {
      contactName,
      info: info? info.trim(): null,
      isGuardian: true,
      shareIndex: index,
      shareId: this.state.selectedShareId,
      changeContact: false,
    }

    let parentShell: AccountShell
    accountShells.forEach( ( shell: AccountShell ) => {
      if( !shell.primarySubAccount.instanceNumber ){
        if( shell.primarySubAccount.sourceKind === REGULAR_ACCOUNT ) parentShell = shell
      }
    } )
    const newSecondarySubAccount: SubAccountDescribing = new TrustedContactsSubAccountInfo( {
      accountShellID: parentShell.id,
      isTFAEnabled: parentShell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT? true: false,
    } )

    addNewSecondarySubAccount( newSecondarySubAccount, parentShell, contactInfo )
  }

  setSecondaryDeviceQR = () => {
    const { uploadMetaShare, updateEphemeralChannelLoader, trustedContacts, keeperProcessStatus, walletName } = this.props
    const { secondaryQR } = this.state
    const index = 0
    if ( uploadMetaShare || updateEphemeralChannelLoader ) {
      if ( secondaryQR ) this.setState( {
        secondaryQR: ''
      } )
      return
    }

    const firstName = 'Secondary'
    let lastName = 'Device'
    if( index === 0 ) lastName = 'Device1'
    else if( index === 3 ) lastName = 'Device2'
    else lastName = 'Device3'
    const contactName = `${firstName} ${lastName ? lastName : ''}`
      .toLowerCase()
      .trim()

    if (
      trustedContacts.tc.trustedContacts[ contactName ] &&
      trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
    ) {
      const { publicKey, secondaryKey } = trustedContacts.tc.trustedContacts[
        contactName
      ]
      if( publicKey ) {
        keeperProcessStatus( KeeperProcessStatus.COMPLETED )
      }
      this.updateShare()
      this.setState( {
        secondaryQR:
        JSON.stringify( {
          isGuardian: true,
          requester: walletName,
          publicKey,
          info: secondaryKey,
          uploadedAt:
          trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
            .initiatedAt,
          type: 'secondaryDeviceGuardian',
          ver: DeviceInfo.getVersion(),
          isFromKeeper: true,
        } )
      } )
    }
  }

  updateShare = () => {
    const index = 0
    let contactName = 'Secondary Device'
    if( index === 0 ) contactName = 'Secondary Device1'
    else if( index === 3 ) contactName = 'Secondary Device2'
    else contactName = 'Secondary Device3'
    const shareArray = [
      {
        walletId: this.props.s3Service.getWalletId().data.walletId,
        shareId: this.state.selectedShareId,
        reshareVersion: 0,
        updatedAt: moment( new Date() ).valueOf(),
        name: contactName,
        shareType: 'device',
        status: 'notAccessible',
      },
    ]
    console.log( 'shareArray', shareArray )
    this.props.updateMSharesHealth( shareArray )
  }

  saveInTransitHistory = async () => {
    const index = 0
    const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
    if ( shareHistory ) {
      const updatedShareHistory = [ ...shareHistory ]
      updatedShareHistory[ index ] = {
        ...updatedShareHistory[ index ],
        inTransit: Date.now(),
      }
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify( updatedShareHistory ),
      )
    }
  }

  renderSecondaryDeviceContents = () => {
    console.log( this.state.secondaryQR )
    return (
      <SecondaryDevice
        secondaryQR={this.state.secondaryQR}
        onPressOk={async () => {
          this.saveInTransitHistory()
          this.secondaryDeviceBottomSheet.current.snapTo( 0 )
        }}
        onPressBack={() => {
          this.secondaryDeviceBottomSheet.current.snapTo( 0 )
        }}
      />
    )
  }

  renderSecondaryDeviceHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          this.secondaryDeviceBottomSheet.current.snapTo( 0 )
        }}
      />
    )
  }

  render() {
    const { listData, selectedContact, isCloudBackupProcessing, showLoader } = this.state
    const { navigation } = this.props
    return (
      <View style={{
        flex: 1, backgroundColor: Colors.backgroundColor1
      }}>
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row'
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
            <View style={{
              justifyContent: 'center', width: wp( '80%' )
            }}>
              <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                {'Upgrade Backup'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet consetetur sadipscing
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{
          flex: 1
        }}>
          {listData.map( ( item, index ) => (
            <View key={index} style={styles.greyBox}>
              <View>
                <ImageBackground
                  source={require( '../../assets/images/icons/Ellipse.png' )}
                  style={{
                    ...styles.cardsImageView
                  }}
                >
                  <Image source={item.image} style={styles.cardImage} />
                </ImageBackground>
                {index != listData.length - 1 && (
                  <Dash
                    dashStyle={{
                      width: wp( '1%' ),
                      height: wp( '1%' ),
                      borderRadius: wp( '1%' ) / 2,
                      overflow: 'hidden',
                    }}
                    dashColor={Colors.borderColor}
                    style={{
                      height: 75,
                      width: wp( '1%' ),
                      flexDirection: 'column',
                      marginLeft: wp( '7%' ),
                    }}
                    dashThickness={10}
                    dashGap={5}
                  />
                )}
              </View>
              <View style={{
                flex: 1, marginLeft: 5
              }}>
                <View
                  style={{
                    borderRadius: 10,
                    paddingLeft: wp( '3%' ),
                    paddingRight: wp( '3%' ),
                    height: 50,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      ...styles.greyBoxText,
                      fontSize: RFValue( 13 ),
                      marginBottom: wp( '1.5%' ),
                    }}
                  >
                    Upgrade{' '}
                    <Text style={{
                      fontFamily: Fonts.FiraSansMedium
                    }}>
                      {item.title}
                    </Text>
                  </Text>
                  <Text style={styles.greyBoxText}>{item.info}</Text>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.borderColor,
                    borderRadius: 10,
                    paddingLeft: wp( '3%' ),
                    paddingRight: wp( '3%' ),
                    height: 50,
                    alignItems: 'center',
                    flexDirection: 'row',
                    backgroundColor: Colors.white,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue( 10 ),
                    }}
                  >
                    {item.subTitle}
                  </Text>
                  <View style={{
                    flexDirection: 'row', marginLeft: 'auto'
                  }}>
                    <View
                      style={{
                        height: wp( '6%' ),
                        width: 'auto',
                        paddingLeft: wp( '5%' ),
                        paddingRight: wp( '5%' ),
                        backgroundColor: item.status == 'accessible' ? Colors.lightGreen : Colors.borderColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: item.status == 'accessible' ? Colors.darkGreen : Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue( 9 ),
                        }}
                      >
                        {item.status == 'accessible' ? 'Complete' : 'Not Setup' }
                      </Text>
                    </View>
                    {item.status != 'setup' &&
                      <View
                        style={{
                          height: wp( '6%' ),
                          width: wp( '6%' ),
                          borderRadius: wp( '6%' ) / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: Colors.lightGreen,
                          marginLeft: wp( '2.5%' ),
                        }}
                      >
                        <AntDesign
                          style={{
                            marginTop: 1
                          }}
                          size={RFValue( 15 )}
                          color={Colors.darkGreen}
                          name={'check'}
                        />
                      </View>
                    }
                  </View>
                </View>
              </View>
            </View>
          ) )}
        </ScrollView>
        {showLoader ? <Loader isLoading={true} /> : null}

        <BottomInfoBox
          backgroundColor={Colors.white}
          title={'Note'}
          infoText={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
          }
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.RestoreFromICloud}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
          ]}
          renderContent={() => {
            return (
              <RestoreFromICloud
                isLoading={isCloudBackupProcessing}
                title={'Keeper on ' + Platform.OS == 'ios' ? 'iCloud' : 'GDrive'}
                subText={
                  'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod'
                }
                info={
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
                }
                cardInfo={'Store Backup'}
                cardTitle={'Hexa Wallet Backup'}
                cardSubInfo={Platform.OS == 'ios' ? 'iCloud' : 'GDrive' + ' backup'}
                proceedButtonText={'Backup'}
                backButtonText={'Back'}
                modalRef={this.RestoreFromICloud}
                onPressProceed={() => {
                  this.cloudBackup()
                }}
                onPressBack={() => {
                  this.RestoreFromICloud.current.snapTo( 0 )
                }}
              />
            )
          }}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                this.RestoreFromICloud.current.snapTo( 0 )
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.SecurityQuestionBottomSheet}
          snapPoints={[ -30, hp( '75%' ), hp( '90%' ) ]}
          renderContent={() => (
            <SecurityQuestion
              onFocus={() => {
                if ( Platform.OS == 'ios' )
                  this.SecurityQuestionBottomSheet.current.snapTo( 2 )
              }}
              onBlur={() => {
                if ( Platform.OS == 'ios' )
                  this.SecurityQuestionBottomSheet.current.snapTo( 1 )
              }}
              onPressConfirm={async () => {
                Keyboard.dismiss()
                navigation.navigate( 'ConfirmKeys' )
                setTimeout( () => {
                  this.SecurityQuestionBottomSheet.current.snapTo( 0 )
                }, 2 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                this.SecurityQuestionBottomSheet.current.snapTo( 0 )
              }}
            />
          )}
        />

        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.UpgradingKeeperContact}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '70%' )
              : hp( '80%' ),
          ]}
          renderContent={() => {
            if( selectedContact.length ){
              return ( <UpgradingKeeperContact
                title={'Upgrading Keeper Contacts'}
                subText={
                  'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod'
                }
                info={
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
                }
                selectedContactArray={selectedContact}
                proceedButtonText={'Proceed'}
                onPressProceed={() => {
                  this.UpgradingKeeperContact.current.snapTo( 0 )
                  // this.UpgradePdfKeeper.current.snapTo( 1 )
                  this.props.autoShareContactKeeper( this.state.selectedContact, this.state.availableKeeperInfo )
                }}
              /> )
            }}}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                this.UpgradingKeeperContact.current.snapTo( 0 )
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.UpgradePdfKeeper}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
          ]}
          renderContent={() => (
            <UpgradePdfKeeper
              title={'Upgrade PDF Keeper'}
              subText={
                'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod'
              }
              info={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
              }
              modalRef={this.UpgradePdfKeeper}
              onPressSetup={() => {
                this.UpgradePdfKeeper.current.snapTo( 0 )
                this.SecurityQuestionBottomSheet.current.snapTo( 1 )
              }}
              onPressBack={() => {
                this.UpgradePdfKeeper.current.snapTo( 0 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                this.UpgradePdfKeeper.current.snapTo( 0 )
              }
            />
          )}
        />
        <BottomSheet
          onCloseEnd={() => {
            if( this.props.keeperProcessStatusFlag == KeeperProcessStatus.COMPLETED ){
              this.saveInTransitHistory()
              this.secondaryDeviceBottomSheet.current.snapTo( 0 )
            }
          }}
          onCloseStart={() => {
            this.secondaryDeviceBottomSheet.current.snapTo( 0 )
          }}
          enabledInnerScrolling={true}
          ref={this.secondaryDeviceBottomSheet}
          snapPoints={[ -30, hp( '85%' ) ]}
          renderContent={this.renderSecondaryDeviceContents}
          renderHeader={this.renderSecondaryDeviceHeader}
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
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    s3Service: idx( state, ( _ ) => _.health.service ),
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    cloudBackupStatus:
      idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    levelHealth: idx( state, ( _ ) => _.health.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    keeperInfo: idx( state, ( _ ) => _.health.keeperInfo ),
    isLevel2Initialized: idx( state, ( _ ) => _.health.isLevel2Initialized ),
    isLevel3Initialized: idx( state, ( _ ) => _.health.isLevel3Initialized ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    activePersonalNode: idx( state, ( _ ) => _.nodeSettings.activePersonalNode ),
    isBackupProcessing: idx( state, ( _ ) => _.preferences.isBackupProcessing ) || false,
    versionHistory: idx( state, ( _ ) => _.versionHistory.versions ),
    metaSharesKeeper: idx( state, ( _ ) => _.health.service.levelhealth.metaSharesKeeper ),
    healthCheckInitializedKeeper: idx( state, ( _ ) => _.health.service.levelhealth.healthCheckInitializedKeeper ),
    SHARES_TRANSFER_DETAILS:  idx( state, ( _ ) => _.storage.database.DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS ),
    uploadMetaShare: idx( state, ( _ ) => _.health.loading.uploadMetaShare ),
    updateEphemeralChannelLoader: idx( state, ( _ ) => _.trustedContacts.loading.updateEphemeralChannel ),
    keeperProcessStatusFlag: idx( state, ( _ ) => _.state.health.keeperProcessStatus ),
    isSmMetaSharesCreatedFlag: idx( state, ( _ ) => _.health.isSmMetaSharesCreatedFlag ),
    trustedContactsInfo: idx( state, ( _ ) => _.trustedContacts.trustedContactsInfo ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
    initializeHealthSetup,
    updateHealthForCloud,
    updateMSharesHealth,
    initNewBHRFlow,
    setCloudData,
    generateMetaShare,
    initLevelTwo,
    setCloudDataForLevel,
    addNewSecondarySubAccount,
    keeperProcessStatus,
    updatedKeeperInfo,
    generateSMMetaShares,
    autoUploadSecondaryShare,
    autoShareContactKeeper
  } )( UpgradeBackup )
)

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp( '0.7%' ),
    marginBottom: hp( '0.7%' ),
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  cardsInfoText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  cardsView: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.backgroundColor,
  },
  cardsImageView: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp( '5%' ),
    height: wp( '5%' ),
    resizeMode: 'contain',
    //marginBottom: wp('1%'),
  },
  statusTextView: {
    height: wp( '5%' ),
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 'auto',
    paddingLeft: 10,
    paddingRight: 10,
  },
  statusText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  greyBox: {
    backgroundColor: Colors.backgroundColor1,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    //  marginTop: wp('2%'),
    //  marginBottom: wp('2%'),
  },
  greyBoxImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp( '15%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowColor: Colors.textColorGrey,
    shadowRadius: 5,
    elevation: 10,
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '35%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
} )
