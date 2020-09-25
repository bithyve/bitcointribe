import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, SafeAreaView, SectionList } from 'react-native';
import { NewAccountPayload } from '../../../common/data/models/NewAccountPayload';
import { AddNewAccountAction } from '../../../store/actions/accounts';
import NEW_ACCOUNT_CHOICES from './NewAccountChoices';
import NewAccountOptionsSection from './NewAccountOptionsSection';
import HeadingStyles from '../../../common/Styles/HeadingStyles';
import { Button } from 'react-native-elements';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ButtonStyles from '../../../common/Styles/Buttons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../../common/Colors';
import AccountKind from '../../../common/data/enums/AccountKind';

export enum SectionKind {
  ADD_NEW_HEXA_ACCOUNT,
  ADD_NEW_SERVICE_ACCOUNT,
  IMPORT_WALLET,
}

const sectionListItemKeyExtractor = index => index;


function titleForSectionHeader(kind: SectionKind) {
  switch (kind) {
    case SectionKind.ADD_NEW_HEXA_ACCOUNT:
      return "Add A New Account";
    case SectionKind.ADD_NEW_SERVICE_ACCOUNT:
      return "Add A Service";
    case SectionKind.IMPORT_WALLET:
      return "Import A Wallet";
  }
}

function renderSectionHeader({ section }) {
  const kind: SectionKind = section.kind;

  return (
    <Text style={[HeadingStyles.listSectionHeading, styles.listSectionHeading]}>
      {titleForSectionHeader(kind)}
    </Text>
  );
}

// TODO: Reuse this elsewhere
export const NavigationHeader = ({ title, onBackPress }) => {
  return (
    <View style={styles.screenHeader}>
      <TouchableOpacity
        style={{marginRight: 24}}
        onPress={onBackPress}
      >
        <FontAwesome
          name="long-arrow-left"
          color={Colors.blue}
          size={17}
        />
      </TouchableOpacity>

      <Text style={HeadingStyles.screenHeadingLarge}>{title}</Text>
    </View>
  );
};

export interface Props {
  navigation: any,
}

const NewAccountTypeSelectionList: React.FC<Props> = ({
  navigation,
}: Props) => {
  const [selectedChoice, setSelectedChoice] = useState<NewAccountPayload>(null);

  const canProceed = useMemo(() => {
    return selectedChoice !== null;
  }, [selectedChoice]);

  const ListFooter = () => {
    return (
      <View style={{ ...styles.listFooterSection}}>
        <Button
          raised
          buttonStyle={ButtonStyles.primaryActionButton}
          title="Proceed"
          titleStyle={ButtonStyles.actionButtonText}
          onPress={handleProceedButtonPress}
          disabled={canProceed === false}
        />
      </View>
    );
  };

  function handleProceedButtonPress() {
    switch (selectedChoice.kind) {
      case AccountKind.TEST:
      case AccountKind.REGULAR:
      case AccountKind.SECURE:
        navigation.navigate('AddNewAccountDetails', {
          currentPayload: selectedChoice,
        });
        break;
      case AccountKind.SERVICE:
        break;
      case AccountKind.FULLY_IMPORTED_WALLET:
      case AccountKind.WATCH_ONLY_IMPORTED_WALLET:
        break;
      default:
        break;
    }
  }

  function handleChoiceSelection(choice: NewAccountPayload) {
    setSelectedChoice(choice);
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <SectionList
        ListHeaderComponent={<NavigationHeader title="Add New" onBackPress={() => navigation.goBack() } />}
        ListFooterComponent={<ListFooter />}
        extraData={[selectedChoice]}
        sections={[
          {
            kind: SectionKind.ADD_NEW_HEXA_ACCOUNT,
            data: [NEW_ACCOUNT_CHOICES.hexaAccounts],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={NEW_ACCOUNT_CHOICES.hexaAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              );
            },
          },
          {
            kind: SectionKind.ADD_NEW_SERVICE_ACCOUNT,
            data: [NEW_ACCOUNT_CHOICES.serviceAccounts],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={NEW_ACCOUNT_CHOICES.serviceAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              );
            },
          },
          {
            kind: SectionKind.IMPORT_WALLET,
            data: [NEW_ACCOUNT_CHOICES.importedWalletAccounts],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={NEW_ACCOUNT_CHOICES.importedWalletAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              );
            },
          },
        ]}
        keyExtractor={sectionListItemKeyExtractor}
        renderSectionHeader={renderSectionHeader}
      >
      </SectionList>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,

    ...Platform.select({
      android: {
        marginTop: StatusBar.currentHeight,
      },
      ios: {
        marginTop: 22,
      },
      'default': {
        marginTop: 22,
      },
    }),
  },

  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  listSectionHeading: {
    paddingLeft: 16,
  },

  viewSectionContainer: {
    marginBottom: 32,
  },

  proceedButtonContainer: {
    marginLeft: 20,
    marginTop: heightPercentageToDP('6%'),
  },

  listFooterSection: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
});

export default NewAccountTypeSelectionList;
