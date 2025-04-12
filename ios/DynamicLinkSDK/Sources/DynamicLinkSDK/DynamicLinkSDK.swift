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
        
        try config.validate()
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
        
        // スキームの検証
        guard url.scheme == config.scheme else {
            log(.debug, "Invalid scheme: \(url.scheme ?? "nil")")
            return false
        }
        
        // URLコンポーネントの解析
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            log(.error, "Failed to parse URL components")
            return false
        }
        
        // パラメータの抽出
        var parameters: [String: String] = [:]
        components.queryItems?.forEach { item in
            parameters[item.name] = item.value
        }
        
        // 必要なパラメータの検証
        for requiredParam in config.requiredParameters {
            guard parameters[requiredParam] != nil else {
                log(.error, "Missing required parameter: \(requiredParam)")
                throw DynamicLinkError.missingRequiredParameter(requiredParam)
            }
        }
        
        // カスタムパラメータの抽出
        var customParameters: [String: String] = [:]
        parameters.forEach { key, value in
            if key.hasPrefix(config.customParameterPrefix) {
                let customKey = String(key.dropFirst(config.customParameterPrefix.count))
                customParameters[customKey] = value
            }
        }
        
        // リンクの作成と検証
        let link = DynamicLink(
            url: url,
            parameters: parameters,
            customParameters: customParameters,
            timestamp: Date()
        )
        
        // リンクの有効性チェック
        guard link.isValid else {
            if let error = link.error {
                log(.error, "Link validation failed: \(error.localizedDescription)")
                throw error
            }
            return false
        }
        
        // フォールバックURLの処理
        if let fallbackURL = config.fallbackURL, !link.isValid {
            log(.warning, "Redirecting to fallback URL: \(fallbackURL)")
            UIApplication.shared.open(fallbackURL)
            return false
        }
        
        log(.info, "Successfully processed deep link: \(url)")
        return true
    }
    
    /// SDKをリセットする（主にテスト用）
    internal func reset() {
        initializationLock.lock()
        defer { initializationLock.unlock() }
        
        configuration = nil
        isInitialized = false
    }
    
    /// ログを出力する
    /// - Parameters:
    ///   - level: ログレベル
    ///   - message: ログメッセージ
    private func log(_ level: LogLevel, _ message: String) {
        guard let config = configuration, level <= config.logLevel else {
            return
        }
        
        let prefix: String
        switch level {
        case .error:
            prefix = "🔴 ERROR"
        case .warning:
            prefix = "⚠️ WARNING"
        case .info:
            prefix = "ℹ️ INFO"
        case .debug:
            prefix = "🔍 DEBUG"
        case .none:
            return
        }
        
        print("[DynamicLinkSDK] \(prefix): \(message)")
    }
}

/// SDKの設定を保持する構造体
public struct DynamicLinkConfig {
    /// アプリのスキーム
    public let scheme: String
    
    /// デバッグモードの有効/無効
    public let isDebugEnabled: Bool
    
    /// リンクの有効期限（秒）
    public let linkExpirationTime: TimeInterval
    
    /// リダイレクトURL
    public let fallbackURL: URL?
    
    /// カスタムパラメータのプレフィックス
    public let customParameterPrefix: String
    
    /// ログレベル
    public let logLevel: LogLevel
    
    /// 必要なパラメータ
    public let requiredParameters: [String]
    
    /// イニシャライザ
    /// - Parameters:
    ///   - scheme: アプリのスキーム
    ///   - isDebugEnabled: デバッグモードの有効/無効
    ///   - linkExpirationTime: リンクの有効期限（秒）
    ///   - fallbackURL: リダイレクトURL
    ///   - customParameterPrefix: カスタムパラメータのプレフィックス
    ///   - logLevel: ログレベル
    ///   - requiredParameters: 必要なパラメータ
    public init(
        scheme: String,
        isDebugEnabled: Bool = false,
        linkExpirationTime: TimeInterval = 3600,
        fallbackURL: URL? = nil,
        customParameterPrefix: String = "dl_",
        logLevel: LogLevel = .info,
        requiredParameters: [String] = []
    ) {
        self.scheme = scheme
        self.isDebugEnabled = isDebugEnabled
        self.linkExpirationTime = linkExpirationTime
        self.fallbackURL = fallbackURL
        self.customParameterPrefix = customParameterPrefix
        self.logLevel = logLevel
        self.requiredParameters = requiredParameters
    }
    
    /// 設定のバリデーション
    /// - Throws: DynamicLinkError
    public func validate() throws {
        // スキームのバリデーション
        guard !scheme.isEmpty else {
            throw DynamicLinkError.invalidScheme
        }
        
        // 有効期限のバリデーション
        guard linkExpirationTime > 0 else {
            throw DynamicLinkError.invalidExpirationTime
        }
        
        // カスタムパラメータプレフィックスのバリデーション
        guard !customParameterPrefix.isEmpty else {
            throw DynamicLinkError.invalidParameterPrefix
        }
    }
}

/// ログレベル
public enum LogLevel: Int, Comparable {
    case none = 0
    case error = 1
    case warning = 2
    case info = 3
    case debug = 4
    
    public static func < (lhs: LogLevel, rhs: LogLevel) -> Bool {
        return lhs.rawValue < rhs.rawValue
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
    
    /// 無効なスキーム
    case invalidScheme
    
    /// 無効な有効期限
    case invalidExpirationTime
    
    /// 無効なパラメータプレフィックス
    case invalidParameterPrefix
    
    /// リンクが期限切れ
    case linkExpired
    
    /// 必要なパラメータが不足
    case missingRequiredParameter(String)
    
    /// 無効なパラメータ形式
    case invalidParameterFormat(String)
    
    /// カスタムエラー
    case custom(String)
    
    public var errorDescription: String? {
        switch self {
        case .alreadyInitialized:
            return "SDK is already initialized"
        case .notInitialized:
            return "SDK is not initialized"
        case .configurationMissing:
            return "Configuration is missing"
        case .invalidScheme:
            return "Invalid scheme"
        case .invalidExpirationTime:
            return "Invalid expiration time"
        case .invalidParameterPrefix:
            return "Invalid parameter prefix"
        case .linkExpired:
            return "Link expired"
        case .missingRequiredParameter(let param):
            return "Missing required parameter: \(param)"
        case .invalidParameterFormat(let param):
            return "Invalid parameter format: \(param)"
        case .custom(let message):
            return message
        }
    }
}
