package io.hexawallet.hexa;

import android.content.Context;
import android.net.Uri;
import android.os.Environment;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;


import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.util.Log;
import android.util.Pair;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.drive.Drive;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.api.services.drive.DriveScopes;
import com.google.gson.Gson;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static io.hexawallet.hexa.DriveServiceHelper.getGoogleDriveService;

public class GoogleDrive extends ReactContextBaseJavaModule {
    private ReactApplicationContext mContext;
    private static final int REQUEST_CODE_SIGN_IN = 100;
    private GoogleSignInClient mGoogleSignInClient;
    private DriveServiceHelper mDriveServiceHelper;
    private static final String TAG = "GoogleDrive";
    private GoogleApiClient googleApiClient;
    private Callback tokenCallback;
    private Callback uploadFileCallback;
    private Callback listOfFilesAvailable;
    private Callback updateFileCallback;
    private Callback readFileCallback;
    private final String LOGIN = "onLogin";
    private final String VALIDATE = "onValidate";
    private final String LOGOUT = "onLogout";
    private final String ERROR = "onError";
    private final String EVENT_KEY = "eventName";
    private final String ERROR_KEY = "error";
    private final String CANCEL_KEY = "isCancelled";
    private final String LIST_IS_EMPTY = "listEmpty";
    private final String SUCCESSFULLY_UPDATE = "successFullyUpdate";
    private final String SUCCESSFULLY_UPLOAD = "successFullyUpload";
    private final String ON_FAILURE = "failure";


    public GoogleDrive(ReactApplicationContext reactContext) {
        super(reactContext); // required by React Native
        if(reactContext != null){
            mContext = reactContext;
        }
        Log.d("mContext " , String.valueOf(mContext));
        reactContext.addActivityEventListener(new ActivityEventListener());

    }

    @Override
    // getName is required to define the name of the module represented in
    // JavaScript
    public String getName() {
        return "GoogleDrive";
    }


    @ReactMethod
    public void setup(final Promise promise) {
        final Activity activity = getCurrentActivity();

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestEmail()
                        .requestIdToken("1002970291557-vpnumcsv5u05bs81o01rt99a795jej48.apps.googleusercontent.com")
                        .requestScopes(new Scope(DriveScopes.DRIVE_APPDATA))
                        .build();

                googleApiClient = new GoogleApiClient.Builder(activity.getBaseContext())
                        .addApi(Auth.GOOGLE_SIGN_IN_API, gso)
                        .build();
                googleApiClient.connect();
                promise.resolve(true);
            }
        });
    }



    @ReactMethod
    public void login(final Callback callback) {
        tokenCallback = callback;
        if (googleApiClient == null) {
            onError(-1, "googleApiClient is null");
            return;
        }

        final Activity activity = getCurrentActivity();

        if (activity == null) {
            onError(-1, "No activity");
            return;
        }
        GoogleSignInAccount accougetDriveClientnt = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext());
        if(accougetDriveClientnt == null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(googleApiClient);
                    activity.startActivityForResult(signInIntent, REQUEST_CODE_SIGN_IN);
                }
            });
        } else{
            mDriveServiceHelper = new DriveServiceHelper(getGoogleDriveService(mContext, accougetDriveClientnt, "hexa"));
            setData(accougetDriveClientnt, false);
        }

    }

    public void signIn(){
        final Activity activity = getCurrentActivity();
        Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(googleApiClient);
        activity.startActivityForResult(signInIntent, REQUEST_CODE_SIGN_IN);
    }

    private void handleSignInResult(GoogleSignInResult result, Boolean isSilent) {
        if (result.isSuccess()) {
            GoogleSignInAccount acct = result.getSignInAccount();
            mDriveServiceHelper = new DriveServiceHelper(getGoogleDriveService(mContext, acct, "hexa"));
            setData(acct, true);

        } else {
            int code = result.getStatus().getStatusCode();
            String error = GoogleSignInStatusCodes.getStatusCodeString(code);
            Log.d(TAG, "handleSignInResult error: " + code + " - " + error);

            onError(code, error);
        }
    }

    private void setData(GoogleSignInAccount acct, boolean isFirstTimeLogin){
        WritableMap map = Arguments.createMap();
        WritableArray scopes = Arguments.createArray();

        Uri photoUrl = acct.getPhotoUrl();

        for(Scope scope : acct.getGrantedScopes()) {
            String scopeString = scope.toString();
            if (scopeString.startsWith("http")) {
                scopes.pushString(scopeString);
            }
        }

        map.putString("id", acct.getId());
        map.putString("name", acct.getDisplayName());
        map.putString("email", acct.getEmail());
        map.putString("photo", photoUrl != null ? photoUrl.toString() : null);
        map.putString("idToken", acct.getIdToken());
        map.putString("serverAuthCode", acct.getServerAuthCode());
        map.putArray("scopes", scopes);
        map.putBoolean("isFirstTimeLogin", isFirstTimeLogin);
        onLogin(map);
    }

//    @ReactMethod
//    public void searchFile(String metaData, Callback callBack) {
//        uploadFileCallback = callBack;
//        if (mDriveServiceHelper == null) {
//            return;
//        }
//    }

    private void onError(int code, String error) {
        WritableMap map = Arguments.createMap();
        map.putString(EVENT_KEY, ERROR);
        map.putString("error", error);
        map.putString(ERROR_KEY, error);
        tokenCallback.invoke(map, null);
    }

    private void onLogin(WritableMap map) {
        map.putString(EVENT_KEY, LOGIN);
        tokenCallback.invoke(null, map);
    }

    private class ActivityEventListener extends BaseActivityEventListener {
        @Override
        public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
            if (requestCode == REQUEST_CODE_SIGN_IN) {
                GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(intent);
                handleSignInResult(result, false);
            }
        }
    }



    @ReactMethod
    public void uploadFile(String metaData, Callback callBack) {
        uploadFileCallback = callBack;
        if (mDriveServiceHelper == null) {
            return;
        }
            mDriveServiceHelper.uploadFile(metaData)
                    .addOnSuccessListener(new OnSuccessListener<GoogleDriveFileHolder>() {
                        @Override
                        public void onSuccess(GoogleDriveFileHolder googleDriveFileHolder) {
                            Log.d(TAG, "onSuccess GoogleDriveFileHolder: " + googleDriveFileHolder);
                            WritableMap map = Arguments.createMap();
                            map.putString(EVENT_KEY, SUCCESSFULLY_UPLOAD);
                            uploadFileCallback.invoke(map, null);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.d(TAG, "onFailure uploadFile: " + e.getMessage());
                            uploadFileCallback.invoke(null, e.getMessage());
                        }
                    });
    }

    @ReactMethod
    public  List<GoogleDriveFileHolder>  checkIfFileExist(String metaData, Callback callBack) {
        listOfFilesAvailable = callBack;
        if (mDriveServiceHelper == null) {
            return null;
        }
        JSONObject jsonObj = null;
        List<GoogleDriveFileHolder> googleDriveFileHolders = new ArrayList<>();
        try {
            jsonObj = new JSONObject(metaData);
            mDriveServiceHelper.searchFile(jsonObj.getString("name"),jsonObj.getString("mimeType"))
                    .addOnSuccessListener(new OnSuccessListener<List<GoogleDriveFileHolder>>() {
                        @Override
                        public void onSuccess(List<GoogleDriveFileHolder> googleDriveFileHolders) {
                            Log.d(TAG, "onSuccess checkIfFileExist: " + googleDriveFileHolders);
                            //googleDriveFileHolders = googleDriveFileHolders;
                            WritableMap map = Arguments.createMap();
                            if(googleDriveFileHolders.size() == 0) {
                               map.putString(EVENT_KEY, LIST_IS_EMPTY);
                            } else {
                                for(int i   = 0 ; i < googleDriveFileHolders.size() ; i++) {
                                    map.putString("id", googleDriveFileHolders.get(i).getId());
                                    map.putString("name", googleDriveFileHolders.get(i).getName());
                                    map.putString("modifiedTime", String.valueOf(googleDriveFileHolders.get(i).getModifiedTime()));
                                    map.putString("createdTime", String.valueOf(googleDriveFileHolders.get(i).getCreatedTime()));
                                    map.putString("starred", String.valueOf(googleDriveFileHolders.get(i).getStarred()));
                                    map.putString("mimeType", googleDriveFileHolders.get(i).getMimeType());
                                    map.putDouble("size", googleDriveFileHolders.get(i).getSize());
                                }
                            }

                            listOfFilesAvailable.invoke(map, null);
                        }
                        })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.d(TAG, "onFailure uploadFile: " + e.getMessage());
                            WritableMap map = Arguments.createMap();
                            map.putString(EVENT_KEY, ON_FAILURE);
                            listOfFilesAvailable.invoke(map, null);
                        }
                    });

        } catch (Exception e) {
            Log.d(TAG, " uploadFile onFailure: " + e.getMessage());
        }
        return googleDriveFileHolders;
    }

    @ReactMethod
    public void updateFile(String metaData, Callback callBack) {
        updateFileCallback = callBack;
        if (mDriveServiceHelper == null) {
            return;
        }
        mDriveServiceHelper.saveFile(getReactApplicationContext(), metaData)
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        Log.d(TAG, "onSuccess updateFile: ");
                        WritableMap map = Arguments.createMap();
                        map.putString(EVENT_KEY, SUCCESSFULLY_UPDATE);
                        updateFileCallback.invoke(map, null);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.d(TAG, "onFailure updateFile: " + e.getMessage());
                       updateFileCallback.invoke(null, e.getMessage());
                    }
                });
    }

    @ReactMethod
    public void readFile(String metaData, Callback callBack) {
        readFileCallback = callBack;
        if (mDriveServiceHelper == null) {
            return;
        }
        JSONObject jsonObj = null;
        try {
            jsonObj = new JSONObject(metaData);
        mDriveServiceHelper.readFile(jsonObj.getString("id"))
                .addOnSuccessListener(new OnSuccessListener<String>() {
                    @Override
                    public void onSuccess(String data) {
                        Log.d(TAG, "onSuccess readFileCallback: "+ data);
                        WritableMap map = Arguments.createMap();
                        map.putString("data", data);
                        readFileCallback.invoke(map, null);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.d(TAG, "onFailure readFileCallback: " + e.getMessage());
                        readFileCallback.invoke(null, e.getMessage());
                    }
                });
        } catch (Exception e) {
            Log.d(TAG, " uploadFile onFailure: " + e.getMessage());
        }
    }
}