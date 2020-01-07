export const socialMediaType = ( packageName: any ) => {
    switch ( packageName ) {
        case "com.facebook.katana":
            return "Facebook";
        case "com.facebook.pages.app":
            return "FacebookPagesManagerShare";
        case "com.twitter.android":
            return "Twitter";
        case "com.whatsapp":
            return "WhatsApp";
        case "com.instagram.android":
            return "Instagram";
        case "com.google.android.apps.plus":
            return "GooglePlus";
        case "com.google.android.gm":
        case "com.apple.UIKit.activity.Mail":
            return "Email";
        case "com.pinterest":
            return "Pinterest"
        case "com.android.mms":
            return "SMS";
        case "com.snapchat.android":
            return "SnapChat";
        case "com.facebook.orca":
            return "Messenger";
        case "com.Slack":
            return "Slack";
        case "com.android.bluetooth":
            return "Bluetooth";
        case "com.google.android.apps.docs":
            return "GoogleDrive";
        case "com.apple.UIKit.activity.AirDrop":
            return "AirDrop"
        default:
            return "Other"
    }
};   