import { createStackNavigator } from "react-navigation-stack";
import BecomeASherpa from "../../../pages/Sherpa/BecomeASherpa";
import RestoreSherpaCode from "../../../pages/Sherpa/RestoreSherpaCode";
import SeedBackupSherpa from "../../../pages/Sherpa/SeedBackupSherpa";
import SherpaHome from "../../../pages/Sherpa/SherpaHome";
import SherpaInvitationCode from "../../../pages/Sherpa/SherpaInvitationCode";

const SherpaStack = createStackNavigator({
  BecomeASherpa: {
    screen: BecomeASherpa,
    navigationOptions: {
      header: null,
    }
  },
  InvitationCode: {
    screen: SherpaInvitationCode,
    navigationOptions: {
      header: null,
    }
  },
  SherpaHome: {
    screen: SherpaHome,
    navigationOptions: {
      header: null,
    }
  },
  SeedRestore: {
    screen: SeedBackupSherpa,
    navigationOptions: {
      header: null,
    }
  },
  CodeRestore: {
    screen: RestoreSherpaCode,
    navigationOptions: {
      header: null,
    }
  }
}, {initialRouteName: 'SherpaHome'});

export default SherpaStack;