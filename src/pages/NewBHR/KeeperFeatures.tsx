import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { withNavigationFocus, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import idx from 'idx';
import RadioButton from '../../components/RadioButton';
import {
  createAndUploadOnEFChannel,
  updateMSharesHealth,
  generateMetaShare,
  initLevelTwo,
  emptyShareTransferDetailsForContactChange,
} from '../../store/actions/health';
import { MetaShare } from '../../bitcoin/utilities/Interface';
import Loader from '../../components/loader';
import S3Service from '../../bitcoin/services/sss/S3Service';

interface KeeperFeaturesStateTypes {
  levelData: any;
  selectedIds: any[];
  setUpLoader: Boolean;
  setupKeeperClicked: boolean;
}

interface KeeperFeaturesPropsTypes {
  navigation: any;
  createAndUploadOnEFChannel: any;
  levelHealth: any[];
  s3Service: S3Service;
  updateMSharesHealth: any;
  isLevelTwoMetaShareCreated: Boolean;
  isLevelThreeMetaShareCreated: Boolean;
  generateMetaShare: any;
  initLevelTwo: any;
  isLevel2Initialized: Boolean;
  updateMSharesHealthStatus: Boolean;
  isLevel3Initialized: Boolean;
  metaShare: MetaShare[];
  keeperInfo: any[];
  keeperSetupStatus: Boolean;
  emptyShareTransferDetailsForContactChange: any;
}

class KeeperFeatures extends Component<
  KeeperFeaturesPropsTypes,
  KeeperFeaturesStateTypes
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedIds: [],
      levelData: [
        {
          type: 'health',
          title: 'Show Backup Health',
          info: 'Keep an eye on your wallet health',
          id: 1,
        },
        {
          type: 'balance',
          title: 'Show Balances',
          info: 'View balances of your wallet accounts',
          id: 3,
        },
        {
          type: 'receive',
          title: 'Receive Bitcoins',
          info: 'Generate receive bitcoin address',
          id: 4,
        },
      ],
      setUpLoader: false,
      setupKeeperClicked: false,
    };
  }

  componentDidUpdate = (prevProp, prevState) => {
    let { updateMSharesHealthStatus, isLevel2Initialized, isLevel3Initialized, keeperSetupStatus, navigation, emptyShareTransferDetailsForContactChange } = this.props;

    if (prevProp.updateMSharesHealthStatus != updateMSharesHealthStatus && !updateMSharesHealthStatus) {
      this.setState({ setUpLoader: false });
    }

    if (
      (prevProp.isLevel2Initialized !== isLevel2Initialized && isLevel2Initialized) ||
      ((isLevel2Initialized || isLevel3Initialized) &&
      prevState.setupKeeperClicked !== this.state.setupKeeperClicked &&
      this.state.setupKeeperClicked) || (prevProp.isLevel3Initialized !== isLevel3Initialized && isLevel3Initialized)
    ) {
      this.uploadDataOnEFChannel();
    }
    if(prevProp.keeperSetupStatus != keeperSetupStatus && !keeperSetupStatus && this.state.setUpLoader) {
      if(navigation.getParam('prevKeeperType') == 'contact' && navigation.getParam('isChange') && navigation.getParam('contactIndex')){
        emptyShareTransferDetailsForContactChange(navigation.getParam('contactIndex'))
      }
      const popAction = StackActions.pop({ n: 2 });
      navigation.dispatch(popAction);
      navigation.replace('ManageBackupKeeper');
    }
  };

  onFeatureSelect = (value) => {
    let selectedId = this.state.selectedIds;
    if (this.state.selectedIds.findIndex((item) => item == value.id) == -1) {
      selectedId.push(value.id);
    } else {
      selectedId.splice(
        this.state.selectedIds.findIndex((item) => item == value.id),
        1,
      );
    }
    this.setState({ selectedIds: selectedId });
  };

  setUpKeeper = async () => {
    let level = this.props.navigation.state.params.selectedLevelId;
    if (!this.props.isLevelTwoMetaShareCreated && !this.props.isLevel2Initialized  && level == 2)
      await this.props.generateMetaShare(level);
    if(!this.props.isLevelThreeMetaShareCreated && !this.props.isLevel3Initialized && level == 3)
      await this.props.generateMetaShare(level);
    this.setState({ setupKeeperClicked: true });
  };

  uploadDataOnEFChannel = () => {
    let {
      isLevel3Initialized,
      isLevel2Initialized,
      navigation,
      createAndUploadOnEFChannel,
      metaShare,
    } = this.props;
    let { selectedIds, levelData } = this.state;
    let shareId = navigation.state.params.selectedShareId;
    if (navigation.state.params.qrScannedData) {
      let featuresList = [];
      for (let i = 0; i < levelData.length; i++) {
        const element = levelData[i];
        if (selectedIds.findIndex((value) => value == element.id) > -1) {
          featuresList.push(element);
        }
      }
      let share = {};
      if (
        !isLevel3Initialized &&
        isLevel2Initialized &&
        shareId &&
        metaShare.findIndex((value) => value.shareId == shareId) > -1
      ) {
        share =
          metaShare[metaShare.findIndex((value) => value.shareId == shareId)];
      }
      if (
        isLevel3Initialized &&
        isLevel2Initialized &&
        shareId &&
        metaShare.findIndex((value) => value.shareId == shareId) > -1
      ) {
        share =
          metaShare[metaShare.findIndex((value) => value.shareId == shareId)];
      }
      createAndUploadOnEFChannel(
        navigation.state.params.qrScannedData,
        featuresList,
        navigation.state.params.isPrimaryKeeper,
        shareId,
        share,
        'device',
        navigation.getParam('isReshare'),
        navigation.state.params.selectedLevelId,
        navigation.getParam('isChange') ? navigation.getParam('isChange') : false,
      );
    }
  };

  render() {
    const { levelData, selectedIds, setUpLoader } = this.state;
    const { navigation } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1 }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
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
            <View style={{ justifyContent: 'center', width: wp('80%') }}>
              <View style={{ flexDirection: 'row' }}>
                <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                  {'Setup Primary Keeper\non a Personal Device'}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 'auto', marginRight: wp('1%') }}
                  onPress={() => {}}
                >
                  <Text
                    onPress={() => {}}
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(12),
                      marginLeft: 'auto',
                      textAlign: 'center',
                      padding: 10,
                    }}
                  >
                    Know more
                  </Text>
                </TouchableOpacity>
              </View>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit
                amet, consetetur Lorem ipsum dolor sit amet, consetetur
              </Text>
            </View>
          </View>
        </View>
        {setUpLoader ? <Loader isLoading={true} /> : null}
        <ScrollView style={{ flex: 1 }}>
          <View style={{ ...styles.topHealthView }}>
            <View
              style={{
                justifyContent: 'center',
                width: wp('80%'),
                marginLeft: wp('6%'),
                paddingTop: wp('5%'),
                paddingBottom: wp('5%'),
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: RFValue(13),
                  color: Colors.black,
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Help recover Hexa app
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: RFValue(11),
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  marginTop: 5,
                }}
              >
                Store one of your wallet's Recovery Key
              </Text>
            </View>
            {this.props.navigation.getParam('isPrimaryKeeper') && <View
              style={{
                justifyContent: 'center',
                width: wp('80%'),
                marginLeft: wp('6%'),
                paddingTop: wp('2%'),
                paddingBottom: wp('7%'),
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: RFValue(13),
                  color: Colors.black,
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                2FA for Savings accounts
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: RFValue(11),
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  marginTop: 5,
                }}
              >
                Generate 2FA code to send from your savings account
              </Text>
            </View>
            }
          </View>
          <View
            style={{
              height: 0.5,
              width: wp('90%'),
              alignSelf: 'center',
              backgroundColor: Colors.borderColor,
            }}
          />
          <View style={{ flex: 1, alignItems: 'center', position: 'relative' }}>
            <Text
              numberOfLines={2}
              style={{
                ...styles.modalHeaderInfoText,
                marginTop: hp('1.5%'),
                marginLeft: wp('10%'),
                marginRight: wp('10%'),
              }}
            >
              Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit amet,
              consetetur Lorem ipsum dolor sit amet, consetetur
            </Text>
            {levelData.map((value) => {
              return (
                <TouchableOpacity
                  activeOpacity={10}
                  onPress={() => this.onFeatureSelect(value)}
                  style={styles.keeperTypeElementView}
                >
                  <View style={styles.typeRadioButtonView}>
                    <RadioButton
                      size={15}
                      color={Colors.lightBlue}
                      borderColor={Colors.borderColor}
                      isChecked={
                        selectedIds.findIndex((item) => item == value.id) > -1
                          ? true
                          : false
                      }
                      onpress={() => this.onFeatureSelect(value)}
                    />
                  </View>
                  <View>
                    <Text style={styles.keeperTypeTitle}>{value.title}</Text>
                    <Text numberOfLines={1} style={styles.keeperTypeInfo}>
                      {value.info}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        {/* <BottomInfoBox
            backgroundColor={Colors.white}
            title={'Note'}
            infoText={
              'Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit amet, consetetur'
            }
          /> */}
        <View style={styles.bottomButtonView}>
          <TouchableOpacity
            disabled={setUpLoader ? true : false}
            onPress={() => {
              this.setState({ setUpLoader: true }, () => {
                this.setUpKeeper();
            }); 
            }}
            style={{
              ...styles.successModalButtonView,
              shadowColor: Colors.shadowBlue,
              backgroundColor: Colors.blue,
            }}
          >
            {setUpLoader ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text
                style={{
                  ...styles.proceedButtonText,
                  color: Colors.white,
                }}
              >
                Setup keeper
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonView}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.blue,
              }}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    levelHealth: idx(state, (_) => _.health.levelHealth),
    isLevelTwoMetaShareCreated: idx(
      state,
      (_) => _.health.isLevelTwoMetaShareCreated,
    ),
    isLevelThreeMetaShareCreated: idx(
      state,
      (_) => _.health.isLevelThreeMetaShareCreated,
    ),
    isLevel2Initialized: idx(state, (_) => _.health.isLevel2Initialized),
    updateMSharesHealthStatus: idx(state, (_) => _.health.updateMSharesHealth),
    isLevel3Initialized: idx(state, (_) => _.health.isLevel3Initialized),
    metaShare: idx(state, (_) => _.health.service.levelhealth.metaSharesKeeper),
    keeperInfo: idx(state, (_) => _.health.keeperInfo),
    keeperSetupStatus: idx(state, (_) => _.health.loading.keeperSetupStatus),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    createAndUploadOnEFChannel,
    updateMSharesHealth,
    generateMetaShare,
    initLevelTwo,
    emptyShareTransferDetailsForContactChange
  })(KeeperFeatures),
);

const styles = StyleSheet.create({
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
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp('0.7%'),
    marginBottom: hp('0.7%'),
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  topHealthView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keeperTypeElementView: {
    flexDirection: 'row',
    paddingTop: wp('5%'),
    paddingBottom: wp('5%'),
  },
  typeRadioButtonView: {
    justifyContent: 'center',
    width: wp('10%'),
    height: wp('10%'),
  },
  keeperTypeTitle: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
    marginBottom: 5,
  },
  keeperTypeInfo: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    width: wp('70%'),
  },
  bottomButtonView: {
    height: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: wp('8%'),
  },
  backButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp('8%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
