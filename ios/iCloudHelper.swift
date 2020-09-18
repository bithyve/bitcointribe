//
//  iCloudHelper.swift
//  HEXA
//
//  Created by Utkarsh on 17/09/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation

@objc class iCloudBackup: NSObject {
  var query: NSMetadataQuery!
  
  override init() {
    super.init()
    initialiseQuery()
    addNotificationObservers()
    //try? self.startBackup(json: "Utkarsh JSON")
  }
  
  func initialiseQuery() {
    
    query = NSMetadataQuery.init()
    query.operationQueue = .main
    query.searchScopes = [NSMetadataQueryUbiquitousDataScope]
    query.predicate = NSPredicate(format: "%K LIKE %@", NSMetadataItemFSNameKey, "HexaWalletBackup.json")
  }
  
  @objc func startBackup(json: String ){
    guard let fileURL = Bundle.main.url(forResource: "HexaWalletBackup", withExtension: "json") else { return }
    guard let containerURL = FileManager.default.url(forUbiquityContainerIdentifier: "iCloud.io.hexawallet.hexa") else { return }
    do {
      try json.write(to: fileURL, atomically: true, encoding: String.Encoding.utf8)
    if !FileManager.default.fileExists(atPath: containerURL.path) {
      try FileManager.default.createDirectory(at: containerURL, withIntermediateDirectories: true, attributes: nil)
    }
    let backupFileURL = containerURL.appendingPathComponent("HexaWalletBackup.json")
      try FileManager.default.replaceItem(at: backupFileURL, withItemAt: fileURL, backupItemName: "HexaBackup", options: FileManager.ItemReplacementOptions.init(), resultingItemURL: nil)
    }
    catch  {}
    query.operationQueue?.addOperation({ [weak self] in
      _ = self?.query.start()
      self?.query.enableUpdates()
    })
  }
  
  func addNotificationObservers() {
    
    NotificationCenter.default.addObserver(forName: NSNotification.Name.NSMetadataQueryDidStartGathering, object: query, queue: query.operationQueue) { (notification) in
      self.processCloudFiles()
    }
    
    NotificationCenter.default.addObserver(forName: NSNotification.Name.NSMetadataQueryDidUpdate, object: query, queue: query.operationQueue) { (notification) in
      self.processCloudFiles()
    }
  }
  
  @objc func processCloudFiles() {
    
    if query.results.count == 0 { return }
    var fileItem: NSMetadataItem?
    var fileURL: URL?
    
    for item in query.results {
      
      guard let item = item as? NSMetadataItem else { continue }
      guard let fileItemURL = item.value(forAttribute: NSMetadataItemURLKey) as? URL else { continue }
      if fileItemURL.lastPathComponent.contains("HexaWalletBackup.json") {
        fileItem = item
        fileURL = fileItemURL
      }
    }
    
    let fileValues = try? fileURL!.resourceValues(forKeys: [URLResourceKey.ubiquitousItemIsUploadingKey])
    if let fileUploaded = fileItem?.value(forAttribute: NSMetadataUbiquitousItemIsUploadedKey) as? Bool, fileUploaded == true, fileValues?.ubiquitousItemIsUploading == false {
      print("Backup complete")
      
    } else if let error = fileValues?.ubiquitousItemUploadingError {
      print("Error backing up:", error.localizedDescription)
      
    } else {
      if let fileProgress = fileItem?.value(forAttribute: NSMetadataUbiquitousItemPercentUploadedKey) as? Double {
        print("Upload Progress:", fileProgress)
      }
    }
  }
  
}

@objc class iCloudRestore: NSObject {
  var query: NSMetadataQuery!
  
  override init() {
    super.init()
    initialiseQuery()
    addNotificationObservers()
    self.getBackup()
  }
  
  func initialiseQuery() {
    query = NSMetadataQuery.init()
    query.operationQueue = .main
    query.searchScopes = [NSMetadataQueryUbiquitousDataScope]
    query.predicate = NSPredicate(format: "%K LIKE %@", NSMetadataItemFSNameKey, "HexaWalletBackup.json")
  }
  
  func addNotificationObservers() {
    
    NotificationCenter.default.addObserver(forName: NSNotification.Name.NSMetadataQueryDidStartGathering, object: query, queue: query.operationQueue) { (notification) in
      self.processCloudFiles()
    }
    
    NotificationCenter.default.addObserver(forName: NSNotification.Name.NSMetadataQueryGatheringProgress, object: query, queue: query.operationQueue) { (notification) in
      self.processCloudFiles()
    }
    
    NotificationCenter.default.addObserver(forName: NSNotification.Name.NSMetadataQueryDidUpdate, object: query, queue: query.operationQueue) { (notification) in
      self.processCloudFiles()
    }
  }
  
  @objc func processCloudFiles() {
    
    if query.results.count == 0 { return }
    var fileItem: NSMetadataItem?
    var fileURL: URL?
    
    for item in query.results {
      
      guard let item = item as? NSMetadataItem else { continue }
      guard let fileItemURL = item.value(forAttribute: NSMetadataItemURLKey) as? URL else { continue }
      if fileItemURL.lastPathComponent.contains("HexaWalletBackup.json") {
        fileItem = item
        fileURL = fileItemURL
        let defaults = UserDefaults.standard
        defaults.set(fileItemURL, forKey: "filePath")

      }
    }
    
    try? FileManager.default.startDownloadingUbiquitousItem(at: fileURL!)
    
    if let fileDownloaded = fileItem?.value(forAttribute: NSMetadataUbiquitousItemDownloadingStatusKey) as? String, fileDownloaded == NSMetadataUbiquitousItemDownloadingStatusCurrent {
      
      query.disableUpdates()
      query.operationQueue?.addOperation({ [weak self] in
        self?.query.stop()
      })
      print("Download complete");
    } else if let error = fileItem?.value(forAttribute: NSMetadataUbiquitousItemDownloadingErrorKey) as? NSError {
      print(error.localizedDescription)
    } else {
      if let keyProgress = fileItem?.value(forAttribute: NSMetadataUbiquitousItemPercentDownloadedKey) as? Double {
        print("File downloaded percent:", keyProgress)
      }
    }
  }
  
  @objc func getBackup() {
    query.operationQueue?.addOperation({ [weak self] in
      self?.query.start()
      self?.query.enableUpdates()
    })
  }
  
  @objc func getPath() -> String{
    let defaults = UserDefaults.standard
    return defaults.object(forKey: "filePath") as! String
  }
  
}
