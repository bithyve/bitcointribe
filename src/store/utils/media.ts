export const socialMediaType = ( packageName: any ) => {
    switch ( packageName ) {
        case "com.facebook.katana":
            return "FacebookShare";
        case "com.facebook.pages.app":
            return "FacebookPagesManagerShare";
        case "com.twitter.android":
            return "TwitterShare";
        case "com.whatsapp":
            return "WhatsAppShare";
        case "com.instagram.android":
            return "InstagramShare";
        case "com.google.android.apps.plus":
            return "GooglePlusShare";
        case "com.google.android.gm":
            return "EmailShare";
        case "com.pinterest":
            return "PinterestShare"
        case "com.android.mms":
            return "SMSShare";
        case "com.snapchat.android":
            return "SnapChatShare";
        case "com.facebook.orca":
            return "MessengerShare";
        case "com.Slack":
            return "SlackShare";
        case "com.android.bluetooth":
            return "BluetoothShare";
        default:
            return "Other"
    }
};