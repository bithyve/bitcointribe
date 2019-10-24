import React, { Component } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, Icon, Text } from 'native-base';
import { Avatar } from 'react-native-elements';

import { FullLinearGradientButton } from 'hexaComponent/LinearGradient/Buttons';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaComponent/Styles/FontFamily';

// TODO: Custome Object
var utils = require('hexaUtils');

interface Props {
  data: [];
  closeModal: Function;
  click_AssociateContact: Function;
  click_Skip: Function;
}

export default class ModelBackupShareAssociateContact extends Component<
  Props,
  any
> {
  render() {
    let walletName =
      this.props.data.length != 0
        ? this.props.data[0].walletName
        : 'Hexa Wallet';
    return (
      <Modal
        transparent
        animationType={'fade'}
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
            <View style={{ flexDirection: 'row', flex: 0.5 }}>
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
                Secret Accepted
              </Text>
              <Button
                light
                iconLeft
                style={{ width: 40, height: 40, borderRadius: 20 }}
                onPress={() => this.props.closeModal()}
              >
                <Icon name="close" style={{ alignSelf: 'center' }} />
              </Button>
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
                style={[
                  FontFamily.ffFiraSansMedium,
                  { textAlign: 'center', fontSize: 12, marginBottom: 20 },
                ]}
              >
                Please keep this share safe, the sender might need this share to
                restore wallet in case of device loss
              </Text>
              <Avatar
                medium
                rounded
                title={walletName.length != 0 ? walletName.charAt(0) : ''}
              />
              <Text style={FontFamily.ffFiraSansMedium}>{walletName}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Text
                note
                style={[
                  FontFamily.ffFiraSansMedium,
                  { textAlign: 'center', fontSize: 12 },
                ]}
              >
                You will need to open the Hexa application on your device once
                in two weeks to make sure the secret is still accessible
              </Text>
              <FullLinearGradientButton
                click_Done={() => this.props.click_AssociateContact(walletName)}
                title="Associate Contact"
                disabled={false}
                style={[{ borderRadius: 10 }]}
              />
              <Button
                onPress={() => this.props.click_Skip()}
                style={[
                  FontFamily.ffFiraSansSemiBold,
                  {
                    backgroundColor: '#838383',
                    borderRadius: 10,
                    margin: 5,
                    height: 50,
                  },
                ]}
                full
              >
                <Text>Skip</Text>
              </Button>
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
    flex: utils.getIphoneSize() == 'iphone X' ? 0.7 : 0.7,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
