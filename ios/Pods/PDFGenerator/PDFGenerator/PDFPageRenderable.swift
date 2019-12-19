//
//  PDFPageRenderable.swift
//  PDFGenerator
//
//  Created by Suguru Kishimoto on 2016/02/10.
//
//

import Foundation
import UIKit
import WebKit

protocol PDFPageRenderable {
    func renderPDFPage(scaleFactor: CGFloat) throws
}

private extension UIScrollView {
    typealias TempInfo = (frame: CGRect, offset: CGPoint, inset: UIEdgeInsets)

    var tempInfo: TempInfo {
        return (frame, contentOffset, contentInset)
    }

    func transformForRender() {
        contentOffset = .zero
        contentInset = UIEdgeInsets.zero
        frame = CGRect(origin: .zero, size: contentSize)
    }

    func restore(_ info: TempInfo) {
        frame = info.frame
        contentOffset = info.offset
        contentInset = info.inset
    }
}

extension UIView: PDFPageRenderable {
    fileprivate func _render<T: UIView>(_ view: T, scaleFactor: CGFloat, area: CGRect? = nil, completion: (T) -> Void = { _ in }) throws {
        guard scaleFactor > 0.0 else {
            throw PDFGenerateError.invalidScaleFactor
        }

        let size: CGSize
        let origin: CGPoint
        if let area = area {
            origin = area.origin
            size = area.size
        } else {
            origin = .zero
            size = getPageSize()
        }

        guard size.width > 0 && size.height > 0 else {
            throw PDFGenerateError.zeroSizeView(self)
        }
        guard let context = UIGraphicsGetCurrentContext() else {
            throw PDFGenerateError.invalidContext
        }

        let renderFrame = CGRect(origin: CGPoint(x: origin.x * scaleFactor, y: origin.y * scaleFactor),
                                 size: CGSize(width: size.width * scaleFactor, height: size.height * scaleFactor))
        autoreleasepool {
            let superView = view.superview
            view.removeFromSuperview()
            UIGraphicsBeginPDFPageWithInfo(CGRect(origin: .zero, size: renderFrame.size), nil)
            context.translateBy(x: -renderFrame.origin.x, y: -renderFrame.origin.y)
            view.layer.render(in: context)
            superView?.addSubview(view)
            superView?.layoutIfNeeded()
            completion(view)
        }
    }

    func renderPDFPage(scaleFactor: CGFloat) throws {
        try self.renderPDFPage(scaleFactor: scaleFactor, area: nil)
    }

    func renderPDFPage(scaleFactor: CGFloat, area: CGRect?) throws {
        func renderScrollView(_ scrollView: UIScrollView, area: CGRect?) throws {
            let tmp = scrollView.tempInfo
            scrollView.transformForRender()
            try _render(scrollView, scaleFactor: scaleFactor, area: area) { scrollView in
                scrollView.restore(tmp)
            }
        }

        if let webView = self as? WKWebView {
            try renderScrollView(webView.scrollView, area: area)
        } else if let webView = self as? WKWebView {
            try renderScrollView(webView.scrollView, area: area)
        } else if let scrollView = self as? UIScrollView {
            try renderScrollView(scrollView, area: area)
        } else {
            try _render(self, scaleFactor: scaleFactor, area: area)
        }
    }

    fileprivate func getPageSize() -> CGSize {
        switch self {
        case (let webView as WKWebView):
            return webView.scrollView.contentSize
        case (let scrollView as UIScrollView):
            return scrollView.contentSize
        default:
            return self.frame.size
        }
    }
}

extension UIImage: PDFPageRenderable {
    func renderPDFPage(scaleFactor: CGFloat) throws {
        guard scaleFactor > 0.0 else {
            throw PDFGenerateError.invalidScaleFactor
        }
        autoreleasepool {
            let bounds = CGRect(
                origin: .zero,
                size: CGSize(
                    width: size.width * scaleFactor,
                    height: size.height * scaleFactor
                )
            )
            UIGraphicsBeginPDFPageWithInfo(bounds, nil)
            draw(in: bounds)
        }
    }
}

protocol UIImageConvertible {
    func asUIImage() throws -> UIImage
}

extension UIImage: UIImageConvertible {
    func asUIImage() throws -> UIImage {
        return self
    }
}

extension String: UIImageConvertible {
    func asUIImage() throws -> UIImage {
        guard let image = UIImage(contentsOfFile: self) else {
            throw PDFGenerateError.imageLoadFailed(self)
        }
        return image
    }
}

extension Data: UIImageConvertible {
    func asUIImage() throws -> UIImage {
        guard let image = UIImage(data: self) else {
            throw PDFGenerateError.imageLoadFailed(self)
        }
        return image
    }
}

extension CGImage: UIImageConvertible {
    func asUIImage() throws -> UIImage {
        return UIImage(cgImage: self)
    }
}
