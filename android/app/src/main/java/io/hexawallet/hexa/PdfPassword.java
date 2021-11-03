package io.hexawallet.hexa;

import android.content.Context;
import android.os.Environment;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;


import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;



import android.graphics.Bitmap;
import android.os.Environment;
import android.print.PrintManager;
import android.util.Log;


import com.itextpdf.text.Anchor;
import com.itextpdf.text.BadElementException;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chapter;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.List;
import com.itextpdf.text.ListItem;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Section;
import com.itextpdf.text.pdf.Barcode128;
import com.itextpdf.text.pdf.Barcode39;
import com.itextpdf.text.pdf.BarcodeQRCode;
import com.itextpdf.text.pdf.PdfDocument;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.parser.PdfTextExtractor;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import static com.itextpdf.text.pdf.PdfName.C;


public class PdfPassword extends ReactContextBaseJavaModule {
    private static Font catFont = new Font(Font.FontFamily.TIMES_ROMAN, 22,
            Font.BOLD);
    private static Font subFont = new Font(Font.FontFamily.TIMES_ROMAN, 16,
            Font.BOLD);
    private static Font smallBold = new Font(Font.FontFamily.TIMES_ROMAN, 12,
            Font.BOLD);
    public PdfPassword(ReactApplicationContext reactContext) {
        super(reactContext); // required by React Native
    }
    private static float qrImageSize = 320f;

    @Override
    // getName is required to define the name of the module represented in
    // JavaScript
    public String getName() {
        return "PdfPassword";
    }

    @ReactMethod
    public void createPdf(String pdfData, Callback errorCallback, Callback successCallback) {
        try {
            JSONObject jsonObj = new JSONObject(pdfData);
            Document document = new Document(PageSize.A4);
            Context context = this.getCurrentActivity().getApplicationContext();

            String path = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS).getPath() +"/"+jsonObj.getString("fileName");
            Log.d("createPdf: ", path);
            //String outPath = Environment.getExternalStorageDirectory() +"/"+jsonObj.getString("fileName");
            //Create PDFWriter instance.
            PdfWriter pdfWriter =  PdfWriter.getInstance(document, new FileOutputStream(path));
            //Add password protection.
            pdfWriter.setEncryption(jsonObj.getString("password").getBytes(), jsonObj.getString("password").getBytes(),
                    PdfWriter.ALLOW_COPY | PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128);
            document.open();
            addMetaData(document);
            addTitlePage(document,pdfData);
            document.close();
            successCallback.invoke(path);
        } catch (Exception e) {
            Log.e("createPdf: ", e.toString());
            errorCallback.invoke(e.getMessage());
        }
    }

    // iText allows to add metadata to the PDF which can be viewed in your Adobe
    private static void addMetaData(Document document) {
        document.addTitle("Hexa");
        document.addSubject("Using for recover wallet.");
        document.addKeywords("Hexa");
        document.addAuthor("Bithyve");
        document.addCreator("Bithyve");
    }

    private static void addTitlePage(Document document,String pdfData)
            throws DocumentException, JSONException {
        JSONObject jsonObj = new JSONObject(pdfData);
        JSONArray qrcode = jsonObj.getJSONArray("qrcode");
        JSONArray qrCodeString = jsonObj.getJSONArray("qrCodeString");

        Paragraph preface = new Paragraph();
        preface.add(new Paragraph(jsonObj.getString("title"), catFont));
        preface.add(new Paragraph("Follow the instructions on the app to scan the 8 QRs below", subFont));
        document.add(preface);
        addEmptyLine(preface, 1);
        // part 1
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 1:",
                subFont));
        document.add(preface);
        BarcodeQRCode barcodeQRCode = new BarcodeQRCode(qrcode.getString(0), (int)qrImageSize, (int)qrImageSize, null);
        Image codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(0),
//                smallBold));
//        document.add(preface);
        //part 2
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 2:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(1), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(1),
//                smallBold));
//        document.add(preface);

        document.newPage();
        //part 3
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 3:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(2), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(2),
//                smallBold));
//        document.add(preface);
        //part 4
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 4:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(3), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(3),
//                smallBold));
//        document.add(preface);
        document.newPage();

        //part 5
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 5:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(4), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(4),
//                smallBold));
//        document.add(preface);
        //part 6
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 6:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(5), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(5),
//                smallBold));
//        document.add(preface);
        document.newPage();

        //part 7
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 7:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(6), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(6),
//                smallBold));
//        document.add(preface);
        //part 8
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 8:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(7), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                qrCodeString.getString(7),
//                smallBold));
//        document.add(preface);
        //document.newPage();
        // Secondary Xpub and 2FA Secret
        /*preface = new Paragraph();
        preface.add(new Paragraph(
                "Secondary Xpub (Encrypted):",
                catFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(jsonObj.getString("secondaryXpub"), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(jsonObj.getString("secondaryXpub"),
                smallBold));
        document.add(preface);

        preface = new Paragraph();
        preface.add(new Paragraph(
                "Scan the above QR Code using your HEXA " +
                        "wallet in order to restore your Secure Account.",
                smallBold));
        document.add(preface);*/


        /*  // Exit Key and BitHyve Xpub
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Exit/Regenerate 2FA Key:",
                catFont));
        preface.add(new Paragraph(
                "Use this key to reset the 2FA if you have lost your authenticator app or for transferring your funds from Savings account if the BitHyve server is not responding",
                smallBold));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(jsonObj.getString("secondaryMnemonic"), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
//        preface = new Paragraph();
//        preface.add(new Paragraph(
//                jsonObj.getString("secondaryMnemonic"),
//                smallBold));
//        document.add(preface);


        preface = new Paragraph();
        preface.add(new Paragraph(
                "BitHyve Xpub:",
                catFont));
        document.add(preface);
        preface = new Paragraph();
        preface.add(new Paragraph(
                jsonObj.getString("bhXpub"),
                smallBold));
        document.add(preface);
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Following assets can be used to recover your funds using " +
                        "the open - sourced ga - recovery tool.",
                smallBold));
        document.add(preface);*/




    }

    @ReactMethod
    public void createPdfKeeper(String pdfData, Callback errorCallback, Callback successCallback) {
        try {
            JSONObject jsonObj = new JSONObject(pdfData);
            Document document = new Document(PageSize.A4);
            //String outPath = Environment.getExternalStorageDirectory() +"/"+jsonObj.getString("fileName");
            Context context = this.getCurrentActivity().getApplicationContext();
            String path = context.getExternalFilesDir(null).getPath() +"/"+jsonObj.getString("fileName");
            Log.d("createPdf: ", path);
            //Create PDFWriter instance.
            PdfWriter pdfWriter =  PdfWriter.getInstance(document, new FileOutputStream(path));
            document.open();
            addMetaData(document);
            addTitlePageKeeper(document,pdfData);
            document.close();
            successCallback.invoke(path);
        } catch (Exception e) {
            Log.d("createPdf: ", e.toString());
            errorCallback.invoke(e.getMessage());
        }
    }

    private static void addTitlePageKeeper(Document document,String pdfData)
            throws DocumentException, JSONException {
        JSONObject jsonObj = new JSONObject(pdfData);
        JSONArray qrcode = jsonObj.getJSONArray("qrcode");
        JSONArray qrCodeString = jsonObj.getJSONArray("qrCodeString");

        Paragraph preface = new Paragraph();
        preface.add(new Paragraph(jsonObj.getString("title"), catFont));
        preface.add(new Paragraph("Follow the instructions on the app to scan QRs below", subFont));
        document.add(preface);
        addEmptyLine(preface, 1);
        // part 1
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Recovery Key:",
                subFont));
        document.add(preface);
        BarcodeQRCode barcodeQRCode = new BarcodeQRCode(qrcode.getString(0), (int)qrImageSize, (int)qrImageSize, null);
        Image codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);

        /*// Exit Key and BitHyve Xpub
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Exit/Regenerate 2FA Key:",
                catFont));
        preface.add(new Paragraph(
                "Use this key to reset the 2FA if you have lost your authenticator app or for transferring your funds from Savings account if the BitHyve server is not responding",
                smallBold));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(1), (int)qrImageSize, (int)qrImageSize, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(qrImageSize, qrImageSize);
        document.add(codeQrImage);
        */
    }


    private static void addEmptyLine(Paragraph paragraph, int number) {
        for (int i = 0; i < number; i++) {
            paragraph.add(new Paragraph(" "));
        }
    }


    @ReactMethod
    public void print(String descFile, Callback errorCallback, Callback successCallback) {
        try {
            JSONObject jsonObj = new JSONObject(descFile);
            PdfReader reader = new PdfReader(jsonObj.getString("path"), jsonObj.getString("password").getBytes());
            System.out.println(new String(reader.computeUserPassword()));
            String outPath = Environment.getExternalStorageDirectory() +"/"+jsonObj.getString("filename");
            PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(outPath));
            stamper.close();
            reader.close();
            successCallback.invoke(outPath);

        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }
    @ReactMethod
    public  void deleteFile(String filePath,Callback errorCallback,Callback successCallback){
        try{
            File file = new File(filePath);
            boolean deleted = file.delete();
            successCallback.invoke(deleted);
        }catch (Exception e){
            errorCallback.invoke(e.getMessage());
        }
    }
}