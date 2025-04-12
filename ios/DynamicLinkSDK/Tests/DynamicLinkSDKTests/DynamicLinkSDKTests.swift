import XCTest
@testable import DynamicLinkSDK

final class DynamicLinkSDKTests: XCTestCase {
    var sdk: DynamicLinkSDK!
    
    override func setUp() {
        super.setUp()
        sdk = DynamicLinkSDK.shared
    }
    
    override func tearDown() {
        super.tearDown()
    }
    
    func testSharedInstance() {
        // シングルトンインスタンスのテスト
        XCTAssertTrue(DynamicLinkSDK.shared === DynamicLinkSDK.shared)
    }
    
    func testConfiguration() {
        // 設定のテスト
        let config = DynamicLinkConfig(scheme: "myapp", isDebugEnabled: true)
        sdk.configure(with: config)
        
        // Note: 現在はconfigurationがprivateなので、直接テストできません
        // 後でテスト用のAPIを追加する必要があります
    }
    
    func testHandleDeepLink() {
        // ディープリンク処理のテスト
        let config = DynamicLinkConfig(scheme: "myapp")
        sdk.configure(with: config)
        
        let url = URL(string: "myapp://test")!
        let result = sdk.handleDeepLink(url)
        
        // 現在は未実装なのでfalseが返ることを確認
        XCTAssertFalse(result)
    }
}
