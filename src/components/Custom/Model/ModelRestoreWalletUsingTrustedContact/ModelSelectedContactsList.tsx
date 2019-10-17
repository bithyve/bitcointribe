import React, { Component } from 'react';
import { Modal, View, StyleSheet, FlatList } from 'react-native';
import { Button, Text } from 'native-base';

import { SvgIcon } from '@up-shared/components';
import { Avatar } from 'react-native-elements';
import { RkCard } from 'react-native-ui-kitten';

import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';
//TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

var utils = require('hexaUtils');
import { renderIf } from 'hexaValidation';

interface Props {
  data: [];
  closeModal: Function;
  click_Next: Function;
  pop: Function;
  click_Request: Function;
}

export default class ModelSelectedContactsList extends Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      arr_KeeperInfo: [],
      flag_DisableBtnNext: true,
    };
  }

  render() {
    let data = this.props.data.length != 0 ? this.props.data : [];
    let flag_DisableBtnNext = this.state.flag_DisableBtnNext;
    return (
      <Modal
        transparent
        animationType="fade"
        visible={data.length != 0 ? data[0].modalVisible : false}
        onRequestClose={() => this.props.closeModal()}
      >
        <View
          style={[
            styles.modalBackground,
            { backgroundColor: `rgba(0,0,0,0.4)` },
          ]}
        >
          <View style={styles.viewModelBody}>
            <View style={{ flexDirection: 'row', flex: 0.6 }}>
              <Button
                transparent
                hitSlop={{
                  top: 5,
                  bottom: 8,
                  left: 10,
                  right: 15,
                }}
                onPress={() => this.props.pop()}
              >
                <SvgIcon name="icon_back" size={25} color="gray" />
              </Button>
              <Text
                style={[
                  FontFamily.ffFiraSansMedium,
                  {
                    fontSize: 20,
                    color: '#2F2F2F',
                    flex: 6,
                    textAlign: 'center',
                    marginTop: 10,
                    marginLeft: 20,
                    marginRight: 20,
                  },
                ]}
              >
                Selected Contacts
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <Text
                note
                style={[FontFamily.ffFiraSansMedium, { textAlign: 'center' }]}
              >
                You can request share from the selected contacts
              </Text>
            </View>
            <View
              style={{
                flex: 4,
              }}
            >
              <FlatList
                data={this.state.arr_KeeperInfo}
                scrollEnabled={false}
                renderItem={({ item }) => (
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
                              item.givenName != null && item.givenName.charAt(0)
                            }
                          />,
                        )}
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flex: 2.3,
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
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                          }}
                        >
                          <Button
                            small
                            transparent
                            dark
                            style={{
                              backgroundColor: '#D0D0D0',
                            }}
                            onPress={() => this.props.click_Request(item)}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                              }}
                            >
                              Request
                            </Text>
                          </Button>
                        </View>
                      </View>
                    </View>
                  </RkCard>
                )}
                keyExtractor={item => item.recordID}
                extraData={this.state}
              />
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <FullLinearGradientButton
                click_Done={() => this.props.click_Next()}
                title="Next"
                disabled={flag_DisableBtnNext}
                style={[
                  flag_DisableBtnNext == true
                    ? { opacity: 0.4 }
                    : { opacity: 1 },
                  { borderRadius: 10 },
                ]}
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
    flex: utils.getIphoneSize() == 'iphone X' ? 0.6 : 0.8,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
