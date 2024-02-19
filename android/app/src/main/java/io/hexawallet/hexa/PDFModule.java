package io.hexawallet.hexa;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.util.Log;
import android.view.WindowManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.RandomAccessFileOrArray;
import com.lowagie.text.pdf.parser.PdfTextExtractor;

import java.io.BufferedInputStream;
import java.io.FileInputStream;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

public class PDFModule extends ReactContextBaseJavaModule {

    public static ReactApplicationContext context;
    public PDFModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context=reactContext;

    }

    @NonNull
    @Override
    public String getName() {
        return "PDFModule";
    }

    public static InputStream fileToInputStream(File file) throws IOException {
        FileInputStream fileInputStream = new FileInputStream(file);
        return fileInputStream;
    }

    public static String getAbsolutePathFromContentUri(Uri contentUri) {
        String absolutePath = null;

        String[] projection = {MediaStore.Images.Media.DATA};
        ContentResolver contentResolver = context.getContentResolver();

        Cursor cursor = contentResolver.query(contentUri, projection, null, null, null);
        if (cursor != null) {
            int columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
            cursor.moveToFirst();
            absolutePath = cursor.getString(columnIndex);
            cursor.close();
        }

        return absolutePath;
    }

    public static String getPath(final Uri uri) {
        if ("file".equalsIgnoreCase(uri.getScheme())) {
            return uri.getPath();
        }
        return null;
    }

    @ReactMethod
    public void pdfToText(String path, Promise resolve) {
        try{
            PdfReader pdfReader = new PdfReader(path);
            StringBuilder extractedText = new StringBuilder();
            PdfTextExtractor textExtractor = new PdfTextExtractor(pdfReader);
            WritableArray pages = new WritableNativeArray();
            for (int pageIndex = 1; pageIndex <= pdfReader.getNumberOfPages(); pageIndex++) {
                String pageText = textExtractor.getTextFromPage(pageIndex);
                String cleanedText = pageText.replaceAll("[^\\x20-\\x7e]", "").replaceAll("\\s+", " ").trim();
                pages.pushString(cleanedText);
            }
            pdfReader.close();
            resolve.resolve(pages);
        }catch (Exception e) {
            Log.d("ExtractedText error", e.toString());
            resolve.resolve(e.toString());
        }
    }
}
