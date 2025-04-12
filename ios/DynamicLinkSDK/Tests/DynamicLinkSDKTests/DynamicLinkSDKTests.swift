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
        // 初期化のテスト
        let config = DynamicLinkConfig(scheme: "myapp")
        try sdk.configure(with: config)
        
        // 二重初期化のテスト
        XCTAssertThrowsError(try sdk.configure(with: config)) { error in
            XCTAssertEqual(error as? DynamicLinkError, .alreadyInitialized)
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
}
