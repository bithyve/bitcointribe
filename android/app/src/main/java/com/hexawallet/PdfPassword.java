package com.hexawallet;

import android.os.Environment;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;
import com.itextpdf.text.pdf.PdfWriter;

public class PdfPassword extends ReactContextBaseJavaModule {
    private static String USER_PASS = "Hello123";

    private static String OWNER_PASS = "Owner123";

    public static byte[] USER = "Hello".getBytes();
    /** Owner password. */
    public static byte[] OWNER = "World".getBytes();

    public PdfPassword(ReactApplicationContext reactContext) {
        super(reactContext); // required by React Native
    }

    @Override
    // getName is required to define the name of the module represented in
    // JavaScript
    public String getName() {
        return "PdfPassword";
    }

    @ReactMethod
    public void setPdfPasswrod(String filePath, String password, Callback errorCallback, Callback successCallback) {
        try {
//             File sdcard = Environment.getExternalStorageDirectory();
//             OutputStream file = new FileOutputStream(new File(sdcard,filePath));
//             Document document = new Document();
//             PdfWriter writer = PdfWriter.getInstance(document, file);
//             writer.setEncryption(USER_PASS.getBytes(), OWNER_PASS.getBytes(),
//             PdfWriter.ALLOW_PRINTING, PdfWriter.ENCRYPTION_AES_128);
    
            PdfReader reader = new PdfReader(filePath);
            PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(filePath));
            stamper.setEncryption(USER, OWNER,
                    PdfWriter.ALLOW_PRINTING, PdfWriter.ENCRYPTION_AES_128 | PdfWriter.DO_NOT_ENCRYPT_METADATA);
            stamper.close();
            reader.close();

            successCallback.invoke("Password set sucess: " + filePath);
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void encryptPdf(String src, String dest) throws IOException, DocumentException {
        PdfReader reader = new PdfReader(src);
        PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(dest));
        stamper.setEncryption(USER, OWNER,
                PdfWriter.ALLOW_PRINTING, PdfWriter.ENCRYPTION_AES_128 | PdfWriter.DO_NOT_ENCRYPT_METADATA);
        stamper.close();
        reader.close();
    }
}