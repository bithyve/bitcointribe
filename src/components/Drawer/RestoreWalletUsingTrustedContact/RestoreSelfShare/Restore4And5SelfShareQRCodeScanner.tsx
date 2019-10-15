import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Container, Tab, Tabs, TabHeading, Icon } from 'native-base';
//NsNotification
import BackboneEvents from 'backbone-events-standalone';
// global event bus
window.EventBus = BackboneEvents.mixin({});

//TODO: Custome object
import { colors, localDB } from 'hexaConstants';
var dbOpration = require('hexaDBOpration');

//TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';
let alert = new AlertSimple();

//Custome Compontes
import { CustomStatusBar } from 'hexaCustStatusBar';
import { HeaderTitle } from 'hexaCustHeader';

//Screens
import Restore4And5SelfShareQRCodeScreen1 from './Screens/Restore4And5SelfShareQRCodeScreen1';
import Restore4And5SelfShareQRCodeScreen2 from './Screens/Restore4And5SelfShareQRCodeScreen2';
import Restore4And5SelfShareQRCodeScreen3 from './Screens/Restore4And5SelfShareQRCodeScreen3';
import Restore4And5SelfShareQRCodeScreen4 from './Screens/Restore4And5SelfShareQRCodeScreen4';
import Restore4And5SelfShareQRCodeScreen5 from './Screens/Restore4And5SelfShareQRCodeScreen5';
import Restore4And5SelfShareQRCodeScreen6 from './Screens/Restore4And5SelfShareQRCodeScreen6';
import Restore4And5SelfShareQRCodeScreen7 from './Screens/Restore4And5SelfShareQRCodeScreen7';
import Restore4And5SelfShareQRCodeScreen8 from './Screens/Restore4And5SelfShareQRCodeScreen8';

//TODO: Common Funciton
var comFunDBRead = require('hexaCommonDBReadData');

//Bitcoin Files
import { S3Service } from 'hexaBitcoin';

export default class Restore4And5SelfShareQRCodeScanner extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            data: [],
            title: '',
            type: '',
            arr_Shares: [],
            selectedIndex: 0
        };
    }

    componentWillMount() {
        let data = this.props.navigation.getParam('data');
        let type = this.props.navigation.getParam('type');
        console.log({ data, type });

        this.setState({
            data,
            type
        });
    }

    //TODO: Click next qrcode click on
    click_Next(index: number, data: any) {
        let arr_Shares = this.state.arr_Shares;
        arr_Shares.push.apply(arr_Shares, data);
        this.setState({
            selectedIndex: index,
            arr_Shares
        });
    }

    click_Confirm = async (type: string, data: any) => {
        const dateTime = Date.now();
        let arr_Shares = this.state.arr_Shares;
        arr_Shares.push.apply(arr_Shares, data);
        console.log({ arr_Shares });
        var resRecoverMetaShareFromQR = await S3Service.recoverMetaShareFromQR(
            arr_Shares
        );
        if (resRecoverMetaShareFromQR.status == 200) {
            resRecoverMetaShareFromQR = resRecoverMetaShareFromQR.data;
            console.log({ resRecoverMetaShareFromQR });
            let resInsertContactList = await dbOpration.updateRestoreUsingTrustedContactSelfShare(
                localDB.tableName.tblSSSDetails,
                dateTime,
                resRecoverMetaShareFromQR.metaShare,
                type,
                'Good'
            );
            console.log({ resInsertContactList });
            if (resInsertContactList) {
                await comFunDBRead.readTblSSSDetails();
                this.props.navigation.pop(2);
            }
        } else {
            alert.simpleOk('Oops', resRecoverMetaShareFromQR.err);
        }
    };

    render() {
        //values
        let { selectedIndex, type } = this.state;
        return (
            <Container>
                <HeaderTitle
                    title="Scan QRCode"
                    pop={() => this.props.navigation.pop()}
                />
                <SafeAreaView
                    style={[
                        styles.container,
                        { backgroundColor: 'transparent' }
                    ]}
                >
                    <Tabs locked={true} page={selectedIndex}>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen1
                                type={type}
                                click_Next={(val: number, data: any) =>
                                    this.click_Next(val, data)
                                }
                            />
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen2
                                type={type}
                                click_Next={(val: number, data: any) =>
                                    this.click_Next(val, data)
                                }
                            />
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen3
                                type={type}
                                click_Next={(val: number, data: any) =>
                                    this.click_Next(val, data)
                                }
                            />
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen4
                                type={type}
                                click_Next={(val: number, data: any) =>
                                    this.click_Next(val, data)
                                }
                            />
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen5
                                type={type}
                                click_Next={(val: number, data: any) =>
                                    this.click_Next(val, data)
                                }
                            />
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen6
                                type={type}
                                click_Next={(val: number, data: any) =>
                                    this.click_Next(val, data)
                                }
                            />
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen7
                                type={type}
                                click_Next={(val: number, data: any) =>
                                    this.click_Next(val, data)
                                }
                            />
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading>
                                    <Icon name="radio-button-on" />
                                </TabHeading>
                            }
                        >
                            <Restore4And5SelfShareQRCodeScreen8
                                type={type}
                                click_Confirm={(type: string, data: any) =>
                                    this.click_Confirm(type, data)
                                }
                            />
                        </Tab>
                    </Tabs>
                </SafeAreaView>
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
        backgroundColor: 'gray'
    }
});
