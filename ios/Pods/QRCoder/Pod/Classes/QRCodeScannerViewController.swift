//
//  QRCodeScannerViewController.swift
//
//  Created by Sebastian Hunkeler on 18/08/14.
//  Copyright (c) 2014 hsr. All rights reserved.
//

import UIKit
import AVFoundation

open class QRCodeScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate
{
    private let metadataObjectsQueue = DispatchQueue(label: "com.sbhklr.qr", attributes: [], target: nil)
    var captureSession: AVCaptureSession = AVCaptureSession()
    var captureDevice:AVCaptureDevice? = AVCaptureDevice.default(for: AVMediaType.video)
    var deviceInput:AVCaptureDeviceInput?
    var metadataOutput:AVCaptureMetadataOutput = AVCaptureMetadataOutput()
    var videoPreviewLayer:AVCaptureVideoPreviewLayer!
    
    /**
     * The highlight view by default shows a green border around the area where
     * the QR code was found.
     */
    public var highlightView:UIView = UIView()
    
    /**
     * Defines whether the highlight view is shown upon QR code detection.
     */
    public var showHighlightView:Bool = true
    
    //MARK: Lifecycle
    
    required public init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        
        highlightView.autoresizingMask = [.flexibleTopMargin, .flexibleLeftMargin, .flexibleRightMargin, .flexibleBottomMargin]
        highlightView.layer.borderColor = UIColor.green.cgColor
        highlightView.layer.borderWidth = 3

        let preset = AVCaptureSession.Preset.high
        if(captureSession.canSetSessionPreset(preset)) {
            captureSession.sessionPreset = preset
        }
        
        videoPreviewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
    }
    
    override open func viewDidLayoutSubviews() {
        videoPreviewLayer.frame = view.bounds
    }
    
    override open func viewDidLoad()
    {
        super.viewDidLoad()
        view.addSubview(highlightView)
        
        guard let captureDevice = self.captureDevice else { return }
        
        do {
            deviceInput = try AVCaptureDeviceInput(device: captureDevice)
        } catch let error as NSError {
            didFailWithError(error: error)
            return
        }
        
        if let captureInput = deviceInput {
            captureSession.addInput(captureInput)
        } else {
            return
        }
        
        captureSession.addOutput(metadataOutput)
        metadataOutput.setMetadataObjectsDelegate(self, queue:metadataObjectsQueue)
        metadataOutput.metadataObjectTypes = [AVMetadataObject.ObjectType.qr]
        
        videoPreviewLayer.frame = self.view.bounds
        videoPreviewLayer.videoGravity = AVLayerVideoGravity.resizeAspectFill
        view.layer.addSublayer(videoPreviewLayer)
        view.bringSubview(toFront: highlightView)
    }
    
    override open func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startQRCodeScanningSession()
    }
    
    override open func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        captureSession.stopRunning()
    }
    
    open override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        coordinator.animate(alongsideTransition: { (context) -> Void in
            let orientation = UIApplication.shared.statusBarOrientation
            self.updateVideoOrientation(orientation: orientation)
        }, completion: nil)
        
        super.viewWillTransition(to: size, with: coordinator)
    }
    
    private func updateVideoOrientation(orientation:UIInterfaceOrientation){

        switch orientation {
        case .portrait :
            videoPreviewLayer.connection?.videoOrientation = .portrait
            break
        case .portraitUpsideDown :
            videoPreviewLayer.connection?.videoOrientation = .portraitUpsideDown
            break
        case .landscapeLeft :
            videoPreviewLayer.connection?.videoOrientation = .landscapeLeft
            break
        case .landscapeRight :
            videoPreviewLayer.connection?.videoOrientation = .landscapeRight
            break
        default:
            videoPreviewLayer.connection?.videoOrientation = .portrait
        }
    }
    
    //MARK: QR Code Processing
    
    /**
    * Processes the string content fo the QR code. This method should be overridden
    * in subclasses.
    * @param qrCodeContent The content of the QR code as string.
    * @return A booloean indicating whether the QR code could be processed.
    **/
     open func processQRCodeContent(qrCodeContent:String) -> Bool {
        print(qrCodeContent)
        return false
    }
    
    /**
    * Catch error when the controller is loading. This method can be overriden
    * in subclasses to detect error. Do not dismiss controller immediately.
    * @param error The error object
    **/
    public func didFailWithError(error: NSError) {
        print("Error: \(error.description)")
    }
    
    /**
     * Starts the scanning session using the built in camera.
     **/
    public func startQRCodeScanningSession(){
        updateVideoOrientation(orientation: UIApplication.shared.statusBarOrientation)
        highlightView.frame = CGRect.zero
        captureSession.startRunning()
    }
    
    /**
     Stops the scanning session
     */
    public func stopQRCodeScanningSession(){
        captureSession.stopRunning()
        highlightView.frame = CGRect.zero
    }
    
    //MARK: AVCaptureMetadataOutputObjectsDelegate
    
    public func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        
        var highlightViewRect = CGRect.zero
        var barCodeObject: AVMetadataMachineReadableCodeObject
        var detectedString:String?
        
        for metadataObject in metadataObjects {
            
            if (metadataObject.type == AVMetadataObject.ObjectType.qr) {
                barCodeObject = videoPreviewLayer.transformedMetadataObject(for: metadataObject) as! AVMetadataMachineReadableCodeObject
                highlightViewRect = barCodeObject.bounds
                
                if let machineReadableObject = metadataObject as? AVMetadataMachineReadableCodeObject {
                    detectedString = machineReadableObject.stringValue
                }
            }
            
            if let qrCode = detectedString {
                processDetectionResult(qrCode: qrCode, highlightViewRect: highlightViewRect)
                return
            }
        }
    }
    
    private func processDetectionResult(qrCode:String, highlightViewRect:CGRect) {
        captureSession.stopRunning()
        
        if !showHighlightView && !self.processQRCodeContent(qrCodeContent: qrCode) {
            self.captureSession.startRunning()
        } else {
            DispatchQueue.main.sync {
                self.highlightView.frame = highlightViewRect
                
                UIView.animate(withDuration: 0.5, animations: { () -> Void in
                    self.highlightView.alpha = 0
                }, completion: { (complete) -> Void in
                    if !self.processQRCodeContent(qrCodeContent: qrCode) {
                        self.highlightView.frame = CGRect.zero
                        self.highlightView.alpha = 1
                        self.captureSession.startRunning()
                    }
                })
            }
        }
    }
    
}
