//
//  Backup.swift
//  HEXA
//
//  Created by cakesoft on 31/08/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation

@objc class Backup : NSObject {
   
   var query: NSMetadataQuery!
   
   override init() {
    super.init()
    initialiseQuery()
  }
  
  @objc func initialiseQuery() {
    query = NSMetadataQuery.init()
    query.operationQueue = .main
    query.searchScopes = [NSMetadataQueryUbiquitousDataScope]
    query.predicate = NSPredicate(format: "%K LIKE %@", NSMetadataItemFSNameKey, "sample.mp4")
  }
  
  @objc func startBackup() throws {
    print("startBackup function");
//    guard let fileURL = Bundle.main.url(forResource: "sample", withExtension: "mp4") else { return }
//    guard let containerURL = FileManager.default.url(forUbiquityContainerIdentifier: "iCloud.com.test.backup") else { return }
//
//    if !FileManager.default.fileExists(atPath: containerURL.path) {
//        try FileManager.default.createDirectory(at: containerURL, withIntermediateDirectories: true, attributes: nil)
//    }
//    let backupFileURL = containerURL.appendingPathComponent("sample.mp4")
//    if FileManager.default.fileExists(atPath: backupFileURL.path) {
//        try FileManager.default.removeItem(at: backupFileURL)
//        try FileManager.default.copyItem(at: fileURL, to: backupFileURL)
//    } else {
//        try FileManager.default.copyItem(at: fileURL, to: backupFileURL)
//    }
//
//    query.operationQueue?.addOperation({ [weak self] in
//        _ = self?.query.start()
//        self?.query.enableUpdates()
//    })
  }
  
  @objc func addNotificationObservers() {
                      
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
          if fileItemURL.lastPathComponent.contains("sample.mp4") {
              fileItem = item
              fileURL = fileItemURL
          }
      }
      
      let fileValues = try? fileURL!.resourceValues(forKeys: [URLResourceKey.ubiquitousItemIsUploadingKey])
      if let fileUploaded = fileItem?.value(forAttribute: NSMetadataUbiquitousItemIsUploadedKey) as? Bool, fileUploaded == true, fileValues?.ubiquitousItemIsUploading == false {
          print("backup upload complete")

      } else if let error = fileValues?.ubiquitousItemUploadingError {
          print("upload error---", error.localizedDescription)
          
      } else {
          if let fileProgress = fileItem?.value(forAttribute: NSMetadataUbiquitousItemPercentUploadedKey) as? Double {
              print("uploaded percent ---", fileProgress)
          }
      }
  }
  
}
