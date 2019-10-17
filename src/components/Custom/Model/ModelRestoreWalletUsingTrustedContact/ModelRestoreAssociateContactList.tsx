import React, { Component } from 'react';
import {
  Modal,
  View,
  Alert,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'native-base';
import { Avatar } from 'react-native-elements';
import { RkCard } from 'react-native-ui-kitten';

import { renderIf } from 'hexaValidation';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

interface Props {
  data: [];
  closeModal: Function;
  click_Confirm: Function;
  click_Request: Function;
}

export default class ModelRestoreAssociateContactList extends Component<
  Props,
  any
> {
  // TODO: list item click any perosn
  click_SelectContact(item: any) {
    Alert.alert(
      'Are you sure?',
      `you want to associate${item.givenName} ${item.familyName}?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => this.props.click_Confirm(item.id),
        },
      ],
      { cancelable: false },
    );
  }

  render() {
    const item = this.props.data.length != 0 ? this.props.data[0].item : 'temp';

    return (
      <Modal
        transparent
        animationType={'none'}
        visible={
          this.props.data.length != 0 ? this.props.data[0].modalVisible : false
        }
        onRequestClose={() => this.props.closeModal()}
      >
        <View
          style={[
            styles.modalBackground,
            { backgroundColor: `rgba(0,0,0,0.4)` },
          ]}
        >
          <View style={styles.viewModelBody}>
            <View style={{ flexDirection: 'row', flex: 0.3 }}>
              <Text
                style={[
                  FontFamily.ffFiraSansMedium,
                  {
                    fontSize: 20,
                    color: '#2F2F2F',
                    flex: 5,
                    textAlign: 'center',
                    marginTop: 10,
                  },
                ]}
              >
                Associate Contact
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <FlatList
                data={item}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => this.click_SelectContact(item)}
                  >
                    <RkCard
                      rkType="shadowed"
                      style={{
                        flex: 1,
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: '#ffffff',
                          borderRadius: 8,
                          margin: 10,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            backgroundColor: '#ffffff',
                            borderRadius: 8,
                          }}
                        >
                          {renderIf(item.thumbnailPath != '')(
                            <Avatar
                              medium
                              rounded
                              source={{
                                uri: item.thumbnailPath,
                              }}
                            />,
                          )}
                          {renderIf(item.thumbnailPath == '')(
                            <Avatar
                              medium
                              rounded
                              title={
                                item.givenName != null &&
                                item.givenName.charAt(0)
                              }
                            />,
                          )}
                          <View
                            style={{
                              flexDirection: 'column',
                              justifyContent: 'center',
                              flex: 2.8,
                            }}
                          >
                            <Text
                              style={[
                                FontFamily.ffFiraSansMedium,
                                {
                                  marginLeft: 10,
                                  fontSize: 16,
                                },
                              ]}
                            >
                              {item.givenName} {item.familyName}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </RkCard>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.recordId}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  viewModelBody: {
    flex: 0.7,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
