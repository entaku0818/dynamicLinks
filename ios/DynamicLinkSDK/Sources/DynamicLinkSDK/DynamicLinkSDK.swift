// The Swift Programming Language
// https://docs.swift.org/swift-book

import Foundation

/// DynamicLinkSDKのメインクラス
public class DynamicLinkSDK {
    /// シングルトンインスタンス
    public static let shared = DynamicLinkSDK()
    
    /// SDKの設定
    private var configuration: DynamicLinkConfig?
    
    /// プライベートイニシャライザ
    private init() {}
    
    /// SDKの設定を行う
    /// - Parameter config: SDKの設定
    public func configure(with config: DynamicLinkConfig) {
        self.configuration = config
    }
    
    /// ディープリンクを処理する
    /// - Parameter url: 処理するURL
    /// - Returns: 処理が成功したかどうか
    public func handleDeepLink(_ url: URL) -> Bool {
        // TODO: 実装
        return false
    }
}

/// SDKの設定を保持する構造体
public struct DynamicLinkConfig {
    /// アプリのスキーム
    public let scheme: String
    
    /// デバッグモードの有効/無効
    public let isDebugEnabled: Bool
    
    /// イニシャライザ
    /// - Parameters:
    ///   - scheme: アプリのスキーム
    ///   - isDebugEnabled: デバッグモードの有効/無効
    public init(scheme: String, isDebugEnabled: Bool = false) {
        self.scheme = scheme
        self.isDebugEnabled = isDebugEnabled
    }
}
