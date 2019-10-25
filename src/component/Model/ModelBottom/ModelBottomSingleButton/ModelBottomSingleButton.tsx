import React, { Component } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text } from 'native-base';
import Modal from 'react-native-modalbox';

import { ImageSVG } from 'hexaComponent/ImageSVG';
// TODO: Custome StyleSheet Files
import FontFamily from 'hexaComponent/Styles/FontFamily';
// TODO: Custome Object
import { colors, svgIcon } from 'hexaConstants';

interface Props {
  data: [];
  closeModal: Function;
  click_Done: Function;
  pop: Function;
}

export default class ModelBottomSingleButton extends Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentWillReceiveProps = (nextProps: any) => {
    let data = nextProps.data;
    // console.log( { data } );
    if (data != undefined) {
      this.setState({
        data: data[0],
      });
    }
  };

  click_Clsoe = () => {
    this.setState({
      data: [],
    });
  };

  render() {
    let { data } = this.state;
    return (
      <Modal
        style={[styles.modal, styles.modal4]}
        position={'bottom'}
        isOpen={data != undefined ? data.modalVisible : false}
        onClosed={() => this.click_Clsoe()}
      >
        <View>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 10,
              paddingBottom: 10,
              borderBottomColor: '#EFEFEF',
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {data != undefined ? data.title : ''}
            </Text>
            <Text note style={{ fontSize: 14 }}>
              {data != undefined ? data.subTitle : ''}
            </Text>
          </View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: colors.appColor,
                height: 80,
                margin: 20,
                borderRadius: 10,
              }}
            >
              <Button
                transparent
                style={{ alignSelf: 'center', marginBottom: -10 }}
                onPress={() => this.props.click_Done()}
              >
                <View
                  style={{
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ImageSVG
                    size={55}
                    source={
                      svgIcon.bottomModel[
                        data != undefined
                          ? data.svgIcon
                          : Platform.OS == 'ios'
                          ? 'recreateSVG'
                          : 'recreatePNG'
                      ]
                    }
                  />
                  <Text
                    style={[
                      FontFamily.ffFiraSansBold,
                      { fontSize: 12, color: '#ffffff' },
                    ]}
                  >
                    {data != undefined ? data.btnTitle : ''}
                  </Text>
                </View>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  // botom model
  modal: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modal4: {
    height: 180,
  },
});
