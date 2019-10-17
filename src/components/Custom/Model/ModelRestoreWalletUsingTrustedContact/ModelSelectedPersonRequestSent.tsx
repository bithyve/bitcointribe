import React, { Component } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, Icon, Text } from 'native-base';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

interface Props {
  data: [];
  closeModal: Function;
  click_Next: Function;
  pop: Function;
  click_Request: Function;
}

export default class ModelSelectedPersonRequestSent extends Component<
  Props,
  any
> {
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
                {item.name} wallet has selected you as trusted contact
              </Text>
              <Button
                light
                iconLeft
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
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
                  {
                    textAlign: 'center',
                    fontSize: 12,
                    marginBottom: 20,
                  },
                ]}
              >
                This secret is required if {item.name} want to retore wallet in
                case of loss
              </Text>
              {/* <Avatar medium rounded title={ item.name.charAt( 0 ) } /> */}
              <Text style={FontFamily.ffFiraSansMedium}>{item.name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Text
                note
                style={[
                  FontFamily.ffFiraSansMedium,
                  { textAlign: 'center', fontSize: 12 },
                ]}
              >
                You are requested to open the Hexa application once in two weeks
                to make sure the secret is still accessible
              </Text>
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
