package com.hexa;

import android.os.Environment;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;


import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;



import android.graphics.Bitmap;
import android.os.Environment;


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
import com.itextpdf.text.pdf.PdfWriter;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


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
            String outPath = Environment.getExternalStorageDirectory() +"/"+jsonObj.getString("fileName");
            //Create PDFWriter instance.
            PdfWriter pdfWriter =  PdfWriter.getInstance(document, new FileOutputStream(outPath));
            //Add password protection.
            pdfWriter.setEncryption(jsonObj.getString("password").getBytes(), jsonObj.getString("password").getBytes(),
                    PdfWriter.ALLOW_COPY | PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128);
            document.open();
            addMetaData(document);
            addTitlePage(document,pdfData);
            document.close();
            successCallback.invoke(outPath);
        } catch (Exception e) {
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
        document.add(preface);
        addEmptyLine(preface, 1);
        // part 1
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 1:",
                subFont));
        document.add(preface);
        BarcodeQRCode barcodeQRCode = new BarcodeQRCode(qrcode.getString(0), 250, 250, null);
        Image codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(0),
                smallBold));
        document.add(preface);
        //part 2
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 2:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(1), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(1),
                smallBold));
        document.add(preface);

        document.newPage();
        //part 3
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 3:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(2), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(2),
                smallBold));
        document.add(preface);
        //part 4
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 4:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(3), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(3),
                smallBold));
        document.add(preface);
        document.newPage();

        //part 5
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 5:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(4), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(4),
                smallBold));
        document.add(preface);
        //part 6
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 6:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(5), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(5),
                smallBold));
        document.add(preface);
        document.newPage();

        //part 7
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 7:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(6), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(6),
                smallBold));
        document.add(preface);
        //part 8
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Part 8:",
                subFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(qrcode.getString(7), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                qrCodeString.getString(7),
                smallBold));
        document.add(preface);
        document.newPage();
        // Secondary Xpub and 2FA Secret
        preface = new Paragraph();
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
        document.add(preface);


        // Secondary Mnemonic and BitHyve Xpub
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Secondary Mnemonic:",
                catFont));
        document.add(preface);
        preface = new Paragraph();
        preface.add(new Paragraph(
                jsonObj.getString("secondaryMnemonic"),
                smallBold));
        document.add(preface);
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


        document.newPage();
        preface = new Paragraph();
        preface.add(new Paragraph(
                "2FA Secret:",
                catFont));
        document.add(preface);
        barcodeQRCode = new BarcodeQRCode(jsonObj.getString("twoFAQR"), 250, 250, null);
        codeQrImage = barcodeQRCode.getImage();
        codeQrImage.scaleAbsolute(250, 250);
        document.add(codeQrImage);
        preface = new Paragraph();
        preface.add(new Paragraph(
                jsonObj.getString("twoFASecret"),
                smallBold));
        document.add(preface);
        preface = new Paragraph();
        preface.add(new Paragraph(
                "Following assets can be used to recover your funds using " +
                        "the open - sourced ga - recovery tool.",
                smallBold));
        document.add(preface);




    }

    private static void addEmptyLine(Paragraph paragraph, int number) {
        for (int i = 0; i < number; i++) {
            paragraph.add(new Paragraph(" "));
        }
    }
}