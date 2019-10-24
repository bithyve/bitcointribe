import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'native-base';
import Modal from 'react-native-modalbox';

interface Props {
  data: [];
  closeModal: Function;
  click_Done: Function;
  pop: Function;
}

export default class ModelBottomAddTestCoinsAndAccounts extends Component<
  Props,
  any
> {
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
            {/* <FlatList
                            data={ arr_FirstListItem }
                            showsVerticalScrollIndicator={ false }
                            scrollEnabled={ false }
                            renderItem={ ( { item } ) => (
                                <TouchableOpacity
                                    onPress={ () => this.click_MenuItem( item ) }
                                >
                                    <RkCard
                                        rkType="shadowed"
                                        style={ {
                                            flex: 1,
                                            borderRadius: 8,
                                            marginLeft: 8,
                                            marginRight: 8,
                                            marginBottom: 4,
                                        } }
                                    >
                                        <View
                                            rkCardHeader
                                            style={ {
                                                flex: 1,
                                            } }
                                        >
                                            <View style={ { flex: 0.23, justifyContent: "center", alignItems: "flex-start" } }>
                                                <ImageSVG
                                                    style={ { width: 40, height: 40 } }
                                                    source={
                                                        svgIcon.moreScreen[ item.svgIcon ]
                                                    }
                                                />
                                            </View>
                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                <Text
                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                >
                                                    { item.title }
                                                </Text>
                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11 } }>{ item.subTitle }</Text>
                                            </View>
                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                <SvgIcon
                                                    name="icon_forword"
                                                    color="#BABABA"
                                                    size={ 20 }
                                                />
                                            </View>
                                        </View>
                                    </RkCard>
                                </TouchableOpacity>
                            ) }
                            keyExtractor={ ( item, index ) => index.toString() }
                        /> */}
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
