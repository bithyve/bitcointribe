import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ListItem } from 'react-native-elements';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import AccountOperations from 'src/bitcoin/utilities/accounts/AccountOperations';
import AccountUtilities from 'src/bitcoin/utilities/accounts/AccountUtilities';
import Toast from 'src/components/Toast';
import InProgressModal from 'src/components/loader/InProgressModal';
import { setTestSatsTimestamp } from 'src/store/actions/rgb';
import AmountBTC from '../../../assets/images/svgs/amount_btc.svg';
import Archive from '../../../assets/images/svgs/icon_archive.svg';
import Visibilty from '../../../assets/images/svgs/icon_visibility.svg';
import NameNDesc from '../../../assets/images/svgs/name_desc.svg';
import Xpub from '../../../assets/images/svgs/xpub.svg';
import { AccountType } from '../../../bitcoin/utilities/Interface';
import Colors from '../../../common/Colors';
import ListStyles from '../../../common/Styles/ListStyles';
import CommonStyles from '../../../common/Styles/Styles';
import { translations } from '../../../common/content/LocContext';
import AccountVisibility from '../../../common/data/enums/AccountVisibility';
import { hp } from '../../../common/data/responsiveness/responsive';
import HeaderTitle from '../../../components/HeaderTitle';
import ModalContainer from '../../../components/home/ModalContainer';
import { refreshAccountShells, updateAccountSettings } from '../../../store/actions/accounts';
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell';
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID';
import AccountArchiveModal from './AccountArchiveModal';

const SELECTABLE_VISIBILITY_OPTIONS = [
  AccountVisibility.ARCHIVED,
  // AccountVisibility.DURESS,   // Disabled until duress mode is implemented later
];

export type Props = {
  navigation: any;
  route: any;
};

export type SettingsListItem = {
  title: string;
  subtitle: string;
  imageSource: any;
  screenName?: string;
  screenParams?: Record<string, unknown>;
  onOptionPressed?: () => void;
};

const listItemKeyExtractor = (item: SettingsListItem) => item.title;

const AccountSettingsMainScreen: React.FC<Props> = ({ navigation, route }: Props) => {
  const accountShellID = route.params?.accountShellID;
  const dispatch = useDispatch();
  const strings = translations['accounts'];
  const setting = translations['stackTitle'];
  const [showRescanning, setShowRescanning] = useState(false);
  const [showRescanningPrompt, setShowRescanningPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAccountArchiveModal, setShowAccountArchiveModal] = useState(false);
  const [checkAccountModal, setCheckAccountModal] = useState(false);
  const accountShell = useAccountShellForID(accountShellID);
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);
  const account = useAccountByAccountShell(accountShell);
  //  const [ accountBalance, setAccountBalance ] = useState( primarySubAccount.balances )
  const { testSatsTimestamp } = useSelector((state) => state.rgb);
  useEffect(() => {
    return () => {
      // dismissBottomSheet()
      setShowRescanningPrompt(false);
      setShowRescanning(false);
    };
  }, [navigation]);

  const listItems = useMemo<SettingsListItem[]>(() => {
    const items = [
      ...[
        {
          title: strings.NameDescription,
          subtitle: strings.NameDescriptionSub,
          screenName: 'EditDisplayProperties',
          screenParams: {
            accountShellID: accountShell.id,
          },
          imageSource: () => <NameNDesc />,
        },
        ...(accountShell.primarySubAccount.type !== AccountType.LIGHTNING_ACCOUNT
          ? [
              {
                title: strings.ShowxPub,
                subtitle: strings.ShowxPubSub,
                screenName: 'ShowXPub',
                screenParams: {
                  primarySubAccountName:
                    primarySubAccount.customDisplayName || primarySubAccount.defaultTitle,
                  accountShellID: accountShell.id,
                },
                imageSource: () => <Xpub />,
              },
            ]
          : []),
        // {
        //   title: 'Account Sync',
        //   subtitle: 'Manually scan the account',
        //   imageSource: require( '../../../assets/images/icons/icon_checking_blue_visibility.png' ),
        //   onOptionPressed: handleRescanListItemSelection,
        // },
      ],
      ...(accountShell.primarySubAccount.isTFAEnabled
        ? [
            {
              title: strings['2FASettings'],
              subtitle: strings['2FASettingsSub'],
              screenName: 'SubAccountTFAHelp',
              screenParams: {
                sourceAccountShell: accountShell,
              },
              imageSource: () => <Xpub />,
            },
          ]
        : []),

      // 📝 These items are being commented out until their functionality is fully implemented.
      // See: https://github.com/bithyve/hexa/issues/2243

      // {
      //   title: 'Reassign Transactions',
      //   subtitle: 'Map from this account to another',
      //   screenName: 'ReassignTransactionsMainOptions',
      //   imageSource: require('../../../assets/images/icons/icon_transactions_circle.png'),
      // },
      {
        title: strings.AccountVisibility,
        subtitle: strings.AccountVisibilitySub,
        screenName: 'EditVisibility',
        screenParams: {
          accountShellID: accountShell.id,
        },
        imageSource: () => <Visibilty />,
      },
      // {
      //   title: 'Merge Account',
      //   subtitle: `Move all transactions to another Hexa account`,
      //   screenName: 'MergeAccounts',
      //   imageSource: require('../../../assets/images/icons/icon_merge_blue.png'),
      // },
      {
        title: 'Archive Account',
        subtitle: strings.ArchiveSub,
        onOptionPressed: showArchiveModal,
        imageSource: () => <Archive />,
      },
    ];
    if (account.type === AccountType.BORDER_WALLET) {
      items.push({
        title: 'Backup with Border Wallet',
        subtitle: 'Check health - grid, pattern, checksum and passphrase',
        screenName: 'BackupGridMnemonic',
        screenParams: {
          borderWalletGridType: account.borderWalletGridType,
          borderWalletMnemonic: account.borderWalletMnemonic,
          borderWalletGridMnemonic: account.borderWalletGridMnemonic,
        },
        imageSource: () => <NameNDesc />,
      });
    }
    if (account.type === AccountType.TEST_ACCOUNT) {
      items.push({
        title: 'Receive Test Sats',
        subtitle: 'Receive Test Sats to this address',
        onOptionPressed: receiveTestSats,
        imageSource: () => <AmountBTC />,
      });
    }
    return items;
  }, [accountShell, account]);

  function handleListItemPress(listItem: SettingsListItem) {
    if (typeof listItem.onOptionPressed === 'function') {
      listItem.onOptionPressed();
    } else if (listItem.screenName !== undefined) {
      const screenParams = listItem.screenParams || {};
      navigation.navigate(listItem.screenName, screenParams);
    }
  }

  const renderItem = ({ item: listItem }: { item: SettingsListItem }) => {
    if (
      listItem.title === 'Archive Account' &&
      primarySubAccount.type === AccountType.CHECKING_ACCOUNT
    ) {
      return null;
    }
    return (
      <ListItem
        underlayColor="none"
        containerStyle={{
          backgroundColor: 'transparent',
        }}
        // bottomDivider
        onPress={() => {
          handleListItemPress(listItem);
        }}
        // disabled={listItem.title === 'Archive Account' && primarySubAccount.type === AccountType.CHECKING_ACCOUNT}
      >
        <View style={ListStyles.thumbnailImageSmall}>{listItem.imageSource()}</View>

        <ListItem.Content
          style={[
            ListStyles.listItemContentContainer,
            {
              paddingVertical: 10,
            },
          ]}
        >
          <ListItem.Title style={ListStyles.listItemTitle}>{listItem.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>
            {listItem.subtitle}
          </ListItem.Subtitle>
        </ListItem.Content>

        <ListItem.Chevron size={22} />
      </ListItem>
    );
  };

  const checkAccountBalance = useCallback(() => {
    return (
      <AccountArchiveModal
        isError={true}
        onProceed={() => {
          // closeArchiveModal()
          setCheckAccountModal(false);
        }}
        onBack={() => setCheckAccountModal(false)}
        onViewAccount={() => {
          setCheckAccountModal(false);
          navigation.pop();
        }}
        account={primarySubAccount}
      />
    );
  }, [primarySubAccount]);

  function handleRescanListItemSelection() {
    // showRescanningPromptBottomSheet()
    setShowRescanningPrompt(true);
  }

  function handleAccountArchive() {
    const settings = {
      visibility: AccountVisibility.ARCHIVED,
    };
    dispatch(
      updateAccountSettings({
        accountShell,
        settings,
      })
    );
    navigation.navigate('Home');
  }

  const showAccountArchiveBottomSheet = useCallback(() => {
    return (
      <AccountArchiveModal
        isError={false}
        onProceed={() => {
          handleAccountArchive();
          setShowAccountArchiveModal(false);
        }}
        onBack={() => setShowAccountArchiveModal(false)}
        onViewAccount={() => setShowAccountArchiveModal(false)}
        account={primarySubAccount}
      />
    );
  }, [primarySubAccount]);

  function showArchiveModal() {
    if (primarySubAccount.balances.confirmed + primarySubAccount.balances.unconfirmed === 0) {
      setShowAccountArchiveModal(true);
    } else {
      setCheckAccountModal(true);
    }
  }

  async function receiveTestSats() {
    try {
      if (testSatsTimestamp) {
        const diffInMilliseconds = Math.abs(Date.now() - testSatsTimestamp);
        const millisecondsIn24Hours = 24 * 60 * 60 * 1000;
        if(diffInMilliseconds <= millisecondsIn24Hours){
          Toast('Rate limit exhausted. Try after some time', null, true);
          return
        }
      }
      setLoading(true);
      const { receivingAddress } = AccountOperations.getNextFreeExternalAddress(account);
      const network = AccountUtilities.getNetworkByType(account.networkType);
      const { txid, funded } = await AccountUtilities.getTestcoins(receivingAddress, network);
      setLoading(false);
      if (txid) {
        Toast('Test sats received');
        dispatch(setTestSatsTimestamp());
        dispatch(refreshAccountShells([accountShell], {}));
      }
    } catch (error) {
      setLoading(false);
    }
  }

  function handleTransactionDataSelectionFromRescan(transactionData: RescannedTransactionData) {
    setShowRescanning(false);
    navigation.navigate('TransactionDetails', {
      transaction: transactionData.details,
      accountShellID: accountShell.id,
    });
  }

  return (
    <SafeAreaView>
      <StatusBar barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.pop();
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerWrapper}>
        <HeaderTitle
          firstLineTitle={setting['AccountSettings']}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
      </View>
      <FlatList
        style={styles.rootContainer}
        contentContainerStyle={{
          paddingHorizontal: 14,
        }}
        extraData={accountShell}
        data={listItems}
        keyExtractor={listItemKeyExtractor}
        renderItem={renderItem}
      />
      <ModalContainer
        onBackground={() => setShowAccountArchiveModal(false)}
        visible={showAccountArchiveModal}
        closeBottomSheet={() => {}}
      >
        {showAccountArchiveBottomSheet()}
      </ModalContainer>

      <ModalContainer
        onBackground={() => setCheckAccountModal(false)}
        visible={checkAccountModal}
        closeBottomSheet={() => {}}
      >
        {checkAccountBalance()}
      </ModalContainer>
      <ModalContainer
        onBackground={() => {
          setLoading(false);
        }}
        closeBottomSheet={() => {
          setLoading(false);
        }}
        visible={loading}
      >
        <InProgressModal
          title={'Receiving Test Sats'}
          otherText={'Receiving test sats. Please hold on a moment.'}
        />
      </ModalContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    // paddingTop: 10,
  },
  headerWrapper: {
    marginBottom: hp(20),
  },
  modalContainer: {
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
  },
});

export default AccountSettingsMainScreen;
