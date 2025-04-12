// The Swift Programming Language
// https://docs.swift.org/swift-book

import Foundation

/// DynamicLinkSDKのメインクラス
public final class DynamicLinkSDK {
    /// シングルトンインスタンス
    public static let shared = DynamicLinkSDK()
    
    /// 初期化状態を管理するフラグ
    private var isInitialized = false
    
    /// スレッドセーフな初期化を保証するためのロック
    private let initializationLock = NSLock()
    
    /// SDKの設定
    private var configuration: DynamicLinkConfig?
    
    /// プライベートイニシャライザ
    private init() {}
    
    /// SDKの設定を行う
    /// - Parameter config: SDKの設定
    /// - Throws: DynamicLinkError
    public func configure(with config: DynamicLinkConfig) throws {
        initializationLock.lock()
        defer { initializationLock.unlock() }
        
        guard !isInitialized else {
            throw DynamicLinkError.alreadyInitialized
        }
        
        self.configuration = config
        isInitialized = true
    }
    
    /// ディープリンクを処理する
    /// - Parameter url: 処理するURL
    /// - Returns: 処理が成功したかどうか
    /// - Throws: DynamicLinkError
    public func handleDeepLink(_ url: URL) throws -> Bool {
        guard isInitialized else {
            throw DynamicLinkError.notInitialized
        }
        
        guard let config = configuration else {
            throw DynamicLinkError.configurationMissing
        }
        
        // TODO: 実装
        return false
    }
    
    /// SDKをリセットする（主にテスト用）
    internal func reset() {
        initializationLock.lock()
        defer { initializationLock.unlock() }
        
        configuration = nil
        isInitialized = false
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

/// SDKのエラー型
public enum DynamicLinkError: LocalizedError {
    /// SDKが既に初期化されている
    case alreadyInitialized
    
    /// SDKが初期化されていない
    case notInitialized
    
    /// 設定が存在しない
    case configurationMissing
    
    public var errorDescription: String? {
        switch self {
        case .alreadyInitialized:
            return "SDK is already initialized"
        case .notInitialized:
            return "SDK is not initialized"
        case .configurationMissing:
            return "Configuration is missing"
        }
    }
}
