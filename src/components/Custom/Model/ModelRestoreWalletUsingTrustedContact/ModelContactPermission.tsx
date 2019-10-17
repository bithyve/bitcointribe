import React, { Component } from 'react';
import { Modal, View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'native-base';

import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';
import { SvgIcon } from '@up-shared/components';

//TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

//TODO: Custome Object
import { images } from 'hexaConstants';
var utils = require('hexaUtils');

interface Props {
  data: [];
  closeModal: Function;
  click_Confirm: Function;
  pop: Function;
}

export default class ModelContactPermission extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    let data = this.props.data.length != 0 ? this.props.data : [];
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
                Restore Wallet Using Trusted Contacts
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
                Hexa requires access to your contacts in order to the reach out
                to your trusted parties.
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                style={styles.imgAppLogo}
                source={images.RestoreWalletUsingTrustedContact.contactPassbook}
              />
            </View>
            <View
              style={{
                flex: 0.8,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                note
                style={[FontFamily.ffFiraSansMedium, { textAlign: 'center' }]}
              >
                Hexa Wallet will not save your contact information externally or
                with any trusted party
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <FullLinearGradientButton
                click_Done={() => this.props.click_Confirm()}
                title="Proceed"
                disabled={false}
                style={[{ opacity: 1 }, { borderRadius: 10 }]}
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
  imgAppLogo: {
    width: 150,
    height: 170,
  },
});
