import XCTest
@testable import DynamicLinkSDK

final class DynamicLinkSDKTests: XCTestCase {
    var sdk: DynamicLinkSDK!
    
    override func setUp() {
        super.setUp()
        sdk = DynamicLinkSDK.shared
        sdk.reset() // 各テスト前に状態をリセット
    }
    
    override func tearDown() {
        super.tearDown()
        sdk.reset() // 各テスト後に状態をリセット
    }
    
    func testSharedInstance() {
        // シングルトンインスタンスのテスト
        XCTAssertTrue(DynamicLinkSDK.shared === DynamicLinkSDK.shared)
    }
    
    func testInitialization() throws {
        // 基本設定での初期化テスト
        let basicConfig = DynamicLinkConfig(scheme: "myapp")
        try sdk.configure(with: basicConfig)
        
        // 詳細設定での初期化テスト
        let detailedConfig = DynamicLinkConfig(
            scheme: "myapp",
            isDebugEnabled: true,
            linkExpirationTime: 7200,
            fallbackURL: URL(string: "https://example.com"),
            customParameterPrefix: "custom_",
            logLevel: .debug
        )
        sdk.reset()
        try sdk.configure(with: detailedConfig)
        
        // 二重初期化のテスト
        XCTAssertThrowsError(try sdk.configure(with: detailedConfig)) { error in
            XCTAssertEqual(error as? DynamicLinkError, .alreadyInitialized)
        }
    }
    
    func testConfigurationValidation() {
        // 空のスキーム
        let emptySchemeConfig = DynamicLinkConfig(scheme: "")
        XCTAssertThrowsError(try emptySchemeConfig.validate()) { error in
            XCTAssertEqual(error as? DynamicLinkError, .invalidScheme)
        }
        
        // 無効な有効期限
        let invalidExpirationConfig = DynamicLinkConfig(scheme: "myapp", linkExpirationTime: 0)
        XCTAssertThrowsError(try invalidExpirationConfig.validate()) { error in
            XCTAssertEqual(error as? DynamicLinkError, .invalidExpirationTime)
        }
        
        // 空のパラメータプレフィックス
        let emptyPrefixConfig = DynamicLinkConfig(scheme: "myapp", customParameterPrefix: "")
        XCTAssertThrowsError(try emptyPrefixConfig.validate()) { error in
            XCTAssertEqual(error as? DynamicLinkError, .invalidParameterPrefix)
        }
    }
    
    func testHandleDeepLinkBeforeInitialization() {
        // 初期化前のディープリンク処理テスト
        let url = URL(string: "myapp://test")!
        XCTAssertThrowsError(try sdk.handleDeepLink(url)) { error in
            XCTAssertEqual(error as? DynamicLinkError, .notInitialized)
        }
    }
    
    func testHandleDeepLink() throws {
        // ディープリンク処理のテスト
        let config = DynamicLinkConfig(scheme: "myapp")
        try sdk.configure(with: config)
        
        let url = URL(string: "myapp://test")!
        let result = try sdk.handleDeepLink(url)
        
        // 現在は未実装なのでfalseが返ることを確認
        XCTAssertFalse(result)
    }
    
    func testThreadSafety() {
        // スレッドセーフのテスト
        let config = DynamicLinkConfig(scheme: "myapp")
        let expectation = XCTestExpectation(description: "Thread safety test")
        expectation.expectedFulfillmentCount = 100
        
        for _ in 0..<100 {
            DispatchQueue.global().async {
                do {
                    try self.sdk.configure(with: config)
                } catch {
                    // 二重初期化のエラーは期待通り
                    XCTAssertEqual(error as? DynamicLinkError, .alreadyInitialized)
                }
                expectation.fulfill()
            }
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    func testLogLevelComparison() {
        XCTAssertTrue(LogLevel.none < LogLevel.error)
        XCTAssertTrue(LogLevel.error < LogLevel.warning)
        XCTAssertTrue(LogLevel.warning < LogLevel.info)
        XCTAssertTrue(LogLevel.info < LogLevel.debug)
        XCTAssertFalse(LogLevel.debug < LogLevel.none)
    }
}
