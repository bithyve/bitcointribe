//
//  Utility.swift
//  HEXA
//
//  Created by Shashank Shinde on 27/06/23.
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
}
