import { createStackNavigator } from "react-navigation-stack";
import BecomeASherpa from "../../../pages/Sherpa/BecomeASherpa";
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
  }
});

export default SherpaStack;