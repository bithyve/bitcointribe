//
//  iCloudHelper.swift
//  HEXA
//
//  Created by Utkarsh on 17/09/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
import CloudKit
import PDFKit

@objc class iCloudBackup: NSObject {
  
  override init() {
    super.init()
  }
  
  @objc func pdfText(filePath: String, callback: @escaping (([String]) -> Void)){
    guard let pdfURL = URL(string: filePath) else {
        return
    }
    let pdfDocument = PDFDocument(url: pdfURL)
    var result: [String] = [];
    if let pageCount = pdfDocument?.pageCount {
        for pageIndex in 0..<pageCount {
            if let pdfPage = pdfDocument?.page(at: pageIndex) {
                if let pageText = pdfPage.string {
                  result.append(pageText);
                }
            }
        }
    }
    callback(result)
  }
  
  @objc func startBackup(json: String, callback: @escaping ((String) -> Void)){
    let pred = NSPredicate(value: true)
    let ckQuery = CKQuery(recordType: "HexaJSONBackup", predicate: pred)
    let operation = CKQueryOperation(query: ckQuery)
    operation.desiredKeys = ["json"]
    operation.recordFetchedBlock = { record in
      print(record.recordID)
      print(record.recordType)
      CKContainer.init(identifier: "iCloud.io.hexawallet.hexa").privateCloudDatabase.delete(withRecordID: record.recordID) { (recordID, err) in
        guard let err = err else {
          print("\(String(describing: recordID)) deleted successffuly")
          return
        }
        print(err)
        print("delete failed for: \(String(describing: recordID)) error: \(err)")
      }
    }
    operation.queryCompletionBlock = {(_,err) in
      if let err = err as? CKError{
        print(err)
        callback("{\"status\": false, \"error\": \"\(err.localizedDescription)\", \"errorCode\": \(err.errorCode)}")
        return
      }
      print("FETCH OPERATION COMPLETED & DELETE Scheduled for all")
      let ckr = CKRecord(recordType: "HexaJSONBackup")
      ckr["json"] = json
      CKContainer.init(identifier: "iCloud.io.hexawallet.hexa").privateCloudDatabase.save(ckr) { (record, err) in
        if let err = err as? CKError{
          print(err)
          callback("{\"status\": false, \"error\": \"\(err.localizedDescription)\", \"errorCode\": \(err.errorCode)}")
          return
        }
        guard let record = record else{
          print("no records....")
          callback("{\"status\": false, \"errorCode\": -1}")
          return
        }
        guard (record["json"] as? String) != nil else{
          print("no json in record....")
          callback("{\"status\": false, \"errorCode\": -1}")
          return
        }
        print("UPLOADED NEW JSON")
        callback("{\"status\": true, \"errorCode\": 1111}")
      }
    }
    CKContainer.init(identifier: "iCloud.io.hexawallet.hexa").privateCloudDatabase.add(operation)
  }
}

@objc class iCloudRestore: NSObject {
  
  override init() {
    super.init()
  }
 
  @objc func getBackup(callback: @escaping ((String) -> Void)) {
    let pred = NSPredicate(value: true)
    let ckQuery = CKQuery(recordType: "HexaJSONBackup", predicate: pred)
    let sort = NSSortDescriptor(key: "creationDate", ascending: true)
    ckQuery.sortDescriptors = [sort]
    let operation = CKQueryOperation(query: ckQuery)
    operation.desiredKeys = ["json"]
    var jsonFromiCloud = ""
    operation.recordFetchedBlock = { record in
      print(record.recordID)
      print(record.recordType)
      guard let jsoniCloud = record["json"] as? String else {
        print("JSON NOT PRESENT")
        return
      }
      jsonFromiCloud = jsoniCloud
    }
    operation.queryCompletionBlock = {(_,err) in
      if let err = err as? CKError{
        print(err)
        callback("{\"status\": false, \"error\": \"\(err.localizedDescription)\", \"errorCode\": \(err.errorCode)}")
        return
      }
      callback(jsonFromiCloud)
    }
    CKContainer.init(identifier: "iCloud.io.hexawallet.hexa").privateCloudDatabase.add(operation)
  }
  
}
