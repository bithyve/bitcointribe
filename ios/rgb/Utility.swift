//
//  Utility.swift
//  HEXA
//
//  Created by Shashank Shinde on 25/06/23.
//

import Foundation

struct Utility{
  static func convertToJSONString(params: [String: Any]) -> String {
    do {
      let jsonData = try JSONSerialization.data(withJSONObject: params, options: [])
      let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
      return jsonString
    } catch {
      print("Error converting to JSON string: \(error)")
      return "{}"
    }
  }
  
  static func convertToJSONString(_ value: [[String: Any]]) -> String? {
      guard let jsonData = try? JSONSerialization.data(withJSONObject: value, options: []),
            let jsonString = String(data: jsonData, encoding: .utf8) else {
          return nil
      }
      return jsonString
  }
  
  static func getDocumentsDirectory() -> URL {
      let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
      let documentsDirectory = paths[0]
      return documentsDirectory
  }
  
  static func getBdkDir()->URL?{
    let dir = getDocumentsDirectory().appendingPathComponent(Constants.bdkDirName)
    do{
      try FileManager.default.createDirectory(atPath: dir.path, withIntermediateDirectories: true)
      return dir
    }catch{
      return nil
    }
  }
  
  static func getBdkDbPath()->String{
    let dbPath = getBdkDir()!.appendingPathComponent("bdk_db")
    FileManager.default.createFile(atPath:dbPath.path , contents: nil)
    return dbPath.path
  }
  
  static func getRgbDir()->URL?{
    let dir = getDocumentsDirectory().appendingPathComponent(Constants.rgbDirName)
    do{
      try FileManager.default.createDirectory(atPath: dir.path, withIntermediateDirectories: true)
      return dir
    }catch{
      return nil
    }
  }
  
  static func getBackupPath(fileName: String)->URL?{
    let dir = getDocumentsDirectory().appendingPathComponent(String(format: Constants.backupName, fileName))
    do{
      try FileManager.default.removeItem(atPath: dir.path)
      //try FileManager.default.createDirectory(atPath: dir.path, withIntermediateDirectories: true)
      print("BACKUP: \(dir.path)")
      return dir
    }catch{
      return nil
    }
  }
}
