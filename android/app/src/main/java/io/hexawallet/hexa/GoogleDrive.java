package io.hexawallet.hexa;

import android.net.Uri;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;

import android.util.Log;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.api.client.googleapis.extensions.android.gms.auth.UserRecoverableAuthIOException;
import com.google.api.services.drive.DriveScopes;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import static io.hexawallet.hexa.DriveServiceHelper.getGoogleDriveService;

public class GoogleDrive extends ReactContextBaseJavaModule {
    private ReactApplicationContext mContext;
    private static final int REQUEST_CODE_SIGN_IN = 100;
    private static final int REQUEST_AUTHORIZATION = 101;
    private GoogleSignInClient mGoogleSignInClient;
    private DriveServiceHelper mDriveServiceHelper;
    private static final String TAG = "GoogleDrive";
    private GoogleApiClient googleApiClient;
    private Promise tokenPromise;
    private Promise uploadFilePromise;
    private Promise listOfFilesAvailable;
    private Promise updateFilePromise;
    private Promise readFilePromise;
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
    private String ifExistFileMetaData = null;
    private String currentPromise = null;

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
                try{
                    GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                            .requestIdToken("1002970291557-vpnumcsv5u05bs81o01rt99a795jej48.apps.googleusercontent.com") //Client ID for Web application
                            .requestEmail()
                            .requestScopes(new Scope(DriveScopes.DRIVE_FILE))
                            .build();

                    googleApiClient = new GoogleApiClient.Builder(activity.getBaseContext())
                            .addApi(Auth.GOOGLE_SIGN_IN_API, gso)
                            .build();
                    googleApiClient.connect();
                    promise.resolve(true);
                }catch (Exception e) {
                    promise.resolve(false);
                    Log.d(TAG, e.toString());
                }
            }
        });
    }



    @ReactMethod
    public void login(final Promise promise) {
        tokenPromise = promise;
        if (googleApiClient == null) {
            onError(30, "googleApiClient is null");
            return;
        }

        final Activity activity = getCurrentActivity();

        if (activity == null) {
            onError(30, "No activity");
            return;
        }
        GoogleSignInAccount accougetDriveClientnt = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext());
        if(accougetDriveClientnt == null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try{
                        Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(googleApiClient);
                        activity.startActivityForResult(signInIntent, REQUEST_CODE_SIGN_IN);
                    }catch (Exception e) {
                        onError(30, "GoogleSignIn failed");
                    }
                }
            });
        } else{
            mDriveServiceHelper = new DriveServiceHelper(getGoogleDriveService(mContext.getApplicationContext(), accougetDriveClientnt, "hexa"));
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
            mDriveServiceHelper = new DriveServiceHelper(getGoogleDriveService(mContext.getApplicationContext(), acct, "hexa"));
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

    private void onError(int code, String error) {
        WritableMap map = Arguments.createMap();
        map.putString(EVENT_KEY, ERROR);
        map.putString("error", error);
        map.putString("code", String.valueOf((code)));
        tokenPromise.resolve(map);
    }

    private void onLogin(WritableMap map) {
        map.putString(EVENT_KEY, LOGIN);
        tokenPromise.resolve(map);
    }

    private class ActivityEventListener extends BaseActivityEventListener {
        @Override
        public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
            Log.d(TAG, "onActivityResult : " + requestCode);
            
            switch (requestCode) {
                case REQUEST_CODE_SIGN_IN: 
                GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(intent);
                handleSignInResult(result, false);
                break;

            case REQUEST_AUTHORIZATION:
           // Log.d(TAG, "ifExistFileMetaData : " + ifExistFileMetaData);
            //   Log.d(TAG, "listOfFilesAvailable " + listOfFilesAvailable);
               if(currentPromise.equals("listOfFilesAvailable")) {
                   WritableMap map = Arguments.createMap();
                   map.putString(EVENT_KEY, "UseUserRecoverableAuthIOException");
                   listOfFilesAvailable.resolve(map);
               } else if(currentPromise.equals("uploadFilePromise")) {
                   WritableMap map = Arguments.createMap();
                   map.putString(EVENT_KEY, "UseUserRecoverableAuthIOException");
                   uploadFilePromise.resolve( map);
               }
           break;
        }
        }
    }



    @ReactMethod
    public void uploadFile(String metaData, Promise promise) {
        uploadFilePromise = promise;
        currentPromise = "uploadFilePromise";
        Log.d(TAG, "mDriveServiceHelper " + mDriveServiceHelper);
        if (mDriveServiceHelper == null) {
            return;
        }
        try {
            final Activity activity = getCurrentActivity();
            mDriveServiceHelper.uploadFile(activity, metaData)
                    .addOnSuccessListener(new OnSuccessListener<GoogleDriveFileHolder>() {
                        @Override
                        public void onSuccess(GoogleDriveFileHolder googleDriveFileHolder) {
                            Log.d(TAG, "onSuccess GoogleDriveFileHolder: " + googleDriveFileHolder);
                            WritableMap map = Arguments.createMap();
                            map.putString(EVENT_KEY, SUCCESSFULLY_UPLOAD);
                            uploadFilePromise.resolve(map);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            //  Log.d(TAG, "onFailure uploadFile: " + e.getMessage());
                            if (e instanceof UserRecoverableAuthIOException) {
                                // Log.d(TAG, " onFailure UseUserRecoverableAuthIOException: " + e.getMessage());
                                // map.putString(EVENT_KEY, "UseUserRecoverableAuthIOException");
                                activity.startActivityForResult(((UserRecoverableAuthIOException) e).getIntent(), REQUEST_AUTHORIZATION);
                            } else {
                                WritableMap map = Arguments.createMap();
                                map.putString(EVENT_KEY, ON_FAILURE);
                                map.putString("code", "31");
                                uploadFilePromise.resolve(map);
                            }


                        }
                    });
        }
        catch (Exception e) {
            WritableMap map = Arguments.createMap();
            map.putString(EVENT_KEY, ON_FAILURE);
            uploadFilePromise.resolve(map);
            Log.d(TAG, " uploadFilePromise Exception: " + e.getMessage());
        }

    }

    @ReactMethod
    public  List<GoogleDriveFileHolder>  checkIfFileExist(String metaData, Promise promise) {
        listOfFilesAvailable = promise;
        currentPromise = "listOfFilesAvailable";

        ifExistFileMetaData = metaData;
        if (mDriveServiceHelper == null) {
            return null;
        }
        JSONObject jsonObj = null;
        final Activity activity = getCurrentActivity();
        List<GoogleDriveFileHolder> googleDriveFileHolders = new ArrayList<>();
        try {
            jsonObj = new JSONObject(metaData);
            Log.d(TAG, "jsonObj: " + jsonObj.getString("name") + jsonObj.getString("mimeType"));
            mDriveServiceHelper.searchFile(activity, jsonObj.getString("name"),jsonObj.getString("mimeType"))
                    .addOnSuccessListener(new OnSuccessListener<List<GoogleDriveFileHolder>>() {
                        @Override
                        public void onSuccess(List<GoogleDriveFileHolder> googleDriveFileHolders) {
                            Log.d(TAG, "onSuccess checkIfFileExist: " + googleDriveFileHolders);
                            //googleDriveFileHolders = googleDriveFileHolders;
                            WritableMap map = Arguments.createMap();
                            if(googleDriveFileHolders.size() == 0) {
                               map.putString(EVENT_KEY, LIST_IS_EMPTY);
                            } else {
                                for(int i = 0 ; i < googleDriveFileHolders.size() ; i++) {
                                    map.putString("id", googleDriveFileHolders.get(i).getId());
                                    map.putString("name", googleDriveFileHolders.get(i).getName());
                                    map.putString("modifiedTime", String.valueOf(googleDriveFileHolders.get(i).getModifiedTime()));
                                    map.putString("createdTime", String.valueOf(googleDriveFileHolders.get(i).getCreatedTime()));
                                    map.putString("starred", String.valueOf(googleDriveFileHolders.get(i).getStarred()));
                                    map.putString("mimeType", googleDriveFileHolders.get(i).getMimeType());
                                    map.putDouble("size", googleDriveFileHolders.get(i).getSize());
                                }
                            }
                            listOfFilesAvailable.resolve(map);
                        }
                        })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.d(TAG, "onFailure sdfdfdsaf: " + e.getMessage());
                            if(e instanceof UserRecoverableAuthIOException){
                                Log.d(TAG, " onFailure UseUserRecoverableAuthIOException: " + e.getMessage());
                                activity.startActivityForResult(((UserRecoverableAuthIOException) e).getIntent(), REQUEST_AUTHORIZATION);
                            }   else{
                                WritableMap map = Arguments.createMap();
                                map.putString(EVENT_KEY, ON_FAILURE);
                                map.putString("code", "32");
                                listOfFilesAvailable.resolve(map);
                            }
                        }
                    });

        }
        catch (Exception e) {
            Log.d(TAG, " checkIfFileExist Exception: " + e.getMessage());
            WritableMap map = Arguments.createMap();
                            map.putString(EVENT_KEY, ON_FAILURE);
                            listOfFilesAvailable.resolve(map);
        }
        return googleDriveFileHolders;
    }

    @ReactMethod
    public void updateFile(String metaData, Promise promise) {
        updateFilePromise = promise;
        if (mDriveServiceHelper == null) {
            return;
        }
        try {
        mDriveServiceHelper.saveFile(getReactApplicationContext(), metaData)
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        Log.d(TAG, "onSuccess updateFile: ");
                        WritableMap map = Arguments.createMap();
                        map.putString(EVENT_KEY, SUCCESSFULLY_UPDATE);
                        updateFilePromise.resolve(map);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.d(TAG, "onFailure updateFile: " + e.getMessage());
                        WritableMap map = Arguments.createMap();
                        map.putString(EVENT_KEY, ON_FAILURE);
                        map.putString("code", "33");
                        updateFilePromise.resolve(map);
                    }
                });
        } catch (Exception e) {
            WritableMap map = Arguments.createMap();
            map.putString(EVENT_KEY, ON_FAILURE);
            map.putString("code", "33");
            updateFilePromise.resolve(map);
            Log.d(TAG, " updateFilePromise Exception: " + e.getMessage());
        }
    }

    @ReactMethod
    public void readFile(String metaData, Promise promise) {
        readFilePromise = promise;
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
                        Log.d(TAG, "onSuccess readFilePromise: "+ data);
                        WritableMap map = Arguments.createMap();
                        map.putString("data", data);
                        readFilePromise.resolve(map);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        WritableMap map = Arguments.createMap();
                        map.putString(EVENT_KEY, ON_FAILURE);
                        map.putString("code", "34");
                        Log.d(TAG, "onFailure readFilePromise: " + e.getMessage());
                        readFilePromise.resolve(map);
                    }
                });
        } catch (Exception e) {
            WritableMap map = Arguments.createMap();
            map.putString(EVENT_KEY, ON_FAILURE);
            map.putString("code", "34");
            readFilePromise.resolve(map);
            Log.d(TAG, " readFile Exception: " + e.getMessage());
        }
    }
}