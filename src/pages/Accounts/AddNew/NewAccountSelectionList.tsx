import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList } from 'react-native';
import AccountPayload, { ExternalServiceAccountPayload } from '../../../common/data/models/AccountPayload/Interfaces';
import NEW_ACCOUNT_CHOICES from './NewAccountChoices';
import NewAccountOptionsSection from './NewAccountOptionsSection';
import HeadingStyles from '../../../common/Styles/HeadingStyles';
import { Button } from 'react-native-elements';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import ButtonStyles from '../../../common/Styles/Buttons';
import AccountKind from '../../../common/data/enums/AccountKind';
import useAccountGenerationCompletionEffect from '../../../utils/hooks/accounts-effects/UseAccountGenerationCompletionEffect';
import { addNewAccount } from '../../../store/actions/accounts';
import { useDispatch } from "react-redux";
import { goHomeAction } from '../../../navigation/actions/NavigationActions';
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind';
import ServiceAccountPayload from '../../../common/data/models/AccountPayload/ServiceAccountPayload';

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
  const [selectedChoice, setSelectedChoice] = useState<AccountPayload>(null);

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
    if (selectedChoice instanceof ServiceAccountPayload) {
      // TODO: Present options for choosing b/w a standalone Service account or adding it to a Hexa account.
      switch (selectedChoice.serviceAccountKind) {
        case ServiceAccountKind.FAST_BITCOINS:
          dispatch(addNewAccount(selectedChoice));
          break;
        default:
          break;
      }
    }

    switch (selectedChoice.kind) {
      case AccountKind.TEST:
      case AccountKind.REGULAR:
      case AccountKind.SECURE:
      case AccountKind.DONATION:
        navigation.navigate('AddNewHexaAccountDetails', {
          currentPayload: selectedChoice,
        });
        break;
      case AccountKind.TRUSTED_CONTACTS:
        dispatch(addNewAccount(selectedChoice));
        break;
      // case AccountKind.SERVICE:
        // if ((selectedChoice as ServiceAccountPayload).serviceAccountKind === ServiceAccountKind.FAST_BITCOINS) {
          // dispatch(addNewAccount({ payload: selectedChoice }));
          // break;
        // }
      case AccountKind.FULLY_IMPORTED_WALLET:
      case AccountKind.WATCH_ONLY_IMPORTED_WALLET:
        break;
      default:
        break;
    }
  }

  function handleChoiceSelection(choice: AccountPayload) {
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

  proceedButtonContainer: {
    marginLeft: 20,
    marginTop: heightPercentageToDP('6%'),
  },

  listFooterSection: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
});

export default NewAccountSelectionList;
