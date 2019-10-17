import React from 'react';
import { ImageBackground, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Container, Text } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';

// TODO: Custome object
import { colors, images, localDB } from 'hexaConstants';

// Custome Compontes
import { CustomStatusBar } from 'hexaCustStatusBar';
import { HeaderTitle } from 'hexaCustHeader';

// TODO: Custome Model
import { ModelRestoreAssociateContactListForQRCodeScan } from 'hexaCustModel';

const dbOpration = require('hexaDBOpration');
const utils = require('hexaUtils');

// TODO: Common Funciton
const comFunDBRead = require('hexaCommonDBReadData');

export default class QRCodeScan extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      item: [],
      arr_ModelRestoreAssociateContactList: [],
      recordId: '',
      decryptedShare: '',
    };
  }

  async componentDidMount() {
    const resSSSDetails = await comFunDBRead.readTblSSSDetails();
    const arr_KeeperInfo = [];
    for (let i = 0; i < resSSSDetails.length; i++) {
      const data = {};
      const fullInfo = resSSSDetails[i];
      if (fullInfo.acceptedDate == '') {
        const keerInfo = JSON.parse(resSSSDetails[i].keeperInfo);
        data.thumbnailPath = keerInfo.thumbnailPath;
        data.givenName = keerInfo.givenName;
        data.familyName = keerInfo.familyName;
        data.phoneNumbers = keerInfo.phoneNumbers;
        data.emailAddresses = keerInfo.emailAddresses;
        data.recordId = fullInfo.recordId;
        arr_KeeperInfo.push(data);
      }
    }
    console.log({ arr_KeeperInfo });
    this.setState({
      item: arr_KeeperInfo,
    });
  }

  _renderTitleBar() {
    return <Text />;
  }

  _renderMenu() {
    return <Text />;
  }

  barcodeReceived = async (e: any) => {
    try {
      let result = e.data;
      result = JSON.parse(result);
      // console.log( { result } );
      if (result.type == 'SSS Restore') {
        utils.setDeepLinkingType('SSS Restore QR');
        const { item } = this.state;
        this.setState({
          decryptedShare: result.data,
          arr_ModelRestoreAssociateContactList: [
            {
              modalVisible: true,
              item,
            },
          ],
        });
        // console.log( { deepLinkPara } );
        // utils.setDeepLinkingUrl( deepLinkPara );
        // this.props.navigation.navigate( 'WalletScreen' );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // TODO: GoBack
  click_GoBack() {
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onSelect({ selected: true });
  }

  // TODO: Popup select any contact
  click_UpdateMsg = async () => {
    const dateTime = Date.now();
    const { recordId } = this.state;
    const { decryptedShare } = this.state;
    const resUpdateSSSRetoreDecryptedShare = await dbOpration.updateSSSRetoreDecryptedShare(
      localDB.tableName.tblSSSDetails,
      JSON.parse(decryptedShare),
      dateTime,
      recordId,
    );
    if (resUpdateSSSRetoreDecryptedShare == true) {
      this.click_GoBack();
    } else {
      Alert.alert(resUpdateSSSRetoreDecryptedShare);
    }
  };

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle
            title="Selected Contacts"
            pop={() => this.click_GoBack()}
          />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <QRCodeScanner
              onRead={this.barcodeReceived}
              topContent={this._renderTitleBar()}
              bottomContent={this._renderMenu()}
              cameraType="back"
              showMarker={true}
              vibrate={true}
            />
          </SafeAreaView>
        </ImageBackground>

        <ModelRestoreAssociateContactListForQRCodeScan
          data={this.state.arr_ModelRestoreAssociateContactList}
          click_Confirm={(recordId: string) => {
            this.setState({
              recordId,
              arr_ModelRestoreAssociateContactList: [
                {
                  modalVisible: false,
                  item: '',
                },
              ],
            });
            this.click_UpdateMsg();
          }}
        />
        <CustomStatusBar
          backgroundColor={colors.white}
          hidden={false}
          barStyle="dark-content"
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
