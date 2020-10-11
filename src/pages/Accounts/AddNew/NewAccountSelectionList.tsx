import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList } from 'react-native';
import NewAccountOptionsSection from './NewAccountOptionsSection';
import HeadingStyles from '../../../common/Styles/HeadingStyles';
import { Button } from 'react-native-elements';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import ButtonStyles from '../../../common/Styles/Buttons';
import SubAccountKind from '../../../common/data/enums/SubAccountKind';
import useAccountGenerationCompletionEffect from '../../../utils/hooks/account-effects/UseAccountGenerationCompletionEffect';
import { addNewAccount } from '../../../store/actions/accounts';
import { useDispatch } from "react-redux";
import { goHomeAction } from '../../../navigation/actions/NavigationActions';
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind';
import ExternalServiceSubAccountInfo from '../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import useNewAccountChoices from '../../../utils/hooks/account-utils/UseNewAccountChoices';

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

export interface Props {
  navigation: any,
}

const NewAccountSelectionList: React.FC<Props> = ({
  navigation,
}: Props) => {
  useAccountGenerationCompletionEffect(() => {
    navigation.dispatch(goHomeAction);
  });

  const dispatch = useDispatch();
  const newAccountChoices = useNewAccountChoices();
  const [selectedChoice, setSelectedChoice] = useState<SubAccountDescribing>(null);

  const canProceed = useMemo(() => {
    return selectedChoice !== null;
  }, [selectedChoice]);

  const ListFooter = () => {
    return (
      <View style={styles.listFooterSection}>
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
    if (selectedChoice instanceof ExternalServiceSubAccountInfo) {
      // TODO: Present options for choosing b/w a standalone Service account or
      // adding it to a Hexa account (e.g. Checking or Savings account).
      switch (selectedChoice.serviceAccountKind) {
        case ServiceAccountKind.FAST_BITCOINS:
          dispatch(addNewAccount(selectedChoice));
          break;
        default:
          break;
      }
    }

    switch (selectedChoice.kind) {
      case SubAccountKind.TEST:
      case SubAccountKind.REGULAR:
      case SubAccountKind.SECURE:
      case SubAccountKind.DONATION:
        navigation.navigate('AddNewHexaAccountDetails', {
          currentSubAccountInfo: selectedChoice,
        });
        break;
      case SubAccountKind.TRUSTED_CONTACTS:
        dispatch(addNewAccount(selectedChoice));
        break;
      // case AccountKind.SERVICE:
        // if ((selectedChoice as ExternalServiceSubAccountInfo).serviceAccountKind === ServiceAccountKind.FAST_BITCOINS) {
          // dispatch(addNewAccount({ payload: selectedChoice }));
          // break;
        // }
      case SubAccountKind.FULLY_IMPORTED_WALLET:
      case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
        break;
      default:
        break;
    }
  }

  function handleChoiceSelection(choice: SubAccountDescribing) {
    setSelectedChoice(choice);
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <SectionList
        contentContainerStyle={{ paddingVertical: 12 }}
        ListFooterComponent={<ListFooter />}
        extraData={[selectedChoice]}
        sections={[
          {
            kind: SectionKind.ADD_NEW_HEXA_ACCOUNT,
            data: [newAccountChoices.hexaAccounts],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={newAccountChoices.hexaAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              );
            },
          },
          {
            kind: SectionKind.ADD_NEW_SERVICE_ACCOUNT,
            data: [newAccountChoices.serviceAccounts],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={newAccountChoices.serviceAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              );
            },
          },
          {
            kind: SectionKind.IMPORT_WALLET,
            data: [newAccountChoices.importedWalletAccounts],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={newAccountChoices.importedWalletAccounts}
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
        stickySectionHeadersEnabled={false}
      >
      </SectionList>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },

  listSectionHeading: {
    paddingLeft: 16,
  },

  viewSectionContainer: {
    marginBottom: 32,
  },

  listFooterSection: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
});

export default NewAccountSelectionList;
