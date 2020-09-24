import { StyleSheet } from "react-native";
import Colors from "../Colors";
import Fonts from "../Fonts";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
        height: 54,
        backgroundColor: Colors.white,
        borderBottomColor: Colors.white,
        borderBottomWidth: 0.5,
    },
    headerLeftIconContainer: {
        height: 54
    },
    headerLeftIconInnerContainer:{
        width: 54,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitles:{
        color: Colors.blue,
        fontSize: RFValue(25),
        marginLeft: 20,
        fontFamily: Fonts.FiraSansRegular
    },
    headerTitlesInfoText:{
        color: Colors.textColorGrey,
        fontSize: RFValue(12),
        marginLeft: 20,
        fontWeight: 'normal',
        marginRight: 20,
        marginTop: 5,
        fontFamily: Fonts.FiraSansRegular
    },
    homepageAmountText:{
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(21),
        marginRight: 5
    },
    homepageAmountUnitText:
    {
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11),
        marginBottom: 3
    },
    homepageAmountImage:{
        width: wp('3%'),
        height: wp('3%'),
        marginRight: 5,
        marginBottom: wp('1%'),
        resizeMode: 'contain'
    },
    rootView: {
        flex: 1,
        backgroundColor: 'white'
    },
    statusBarStyle: {
        flex: 0,
    },
    backIconRootContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backIconTouchContainer: {
        height: 30,
        width: 30,
        justifyContent: 'center'
    }
});
