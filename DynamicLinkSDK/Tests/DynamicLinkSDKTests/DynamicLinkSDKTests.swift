import XCTest
@testable import DynamicLinkSDK

final class DynamicLinkSDKTests: XCTestCase {
    var sdk: DynamicLinkSDK!

    override func setUp() {
        super.setUp()
        sdk = DynamicLinkSDK.shared
        sdk.reset()
    }

    override func tearDown() {
        super.tearDown()
        sdk.reset()
    }

    // MARK: - Singleton

    func testSharedInstance() {
        XCTAssertTrue(DynamicLinkSDK.shared === DynamicLinkSDK.shared)
    }

    // MARK: - Initialization

    func testInitializationWithBasicConfig() throws {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        XCTAssertNoThrow(try sdk.configure(with: config))
    }

    func testInitializationWithDetailedConfig() throws {
        let config = DynamicLinkConfig(
            domain: "example.com",
            linkExpirationTime: 7200,
            fallbackURL: URL(string: "https://example.com"),
            customParameterPrefix: "custom_",
            logLevel: .debug,
            customScheme: "myapp"
        )
        XCTAssertNoThrow(try sdk.configure(with: config))
    }

    func testDoubleInitializationThrows() throws {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        try sdk.configure(with: config)
        XCTAssertThrowsError(try sdk.configure(with: config)) { error in
            XCTAssertEqual(error as? DynamicLinkError, .alreadyInitialized)
        }
    }

    // MARK: - Configuration Validation

    func testEmptyDomainThrows() {
        let config = DynamicLinkConfig(domain: "", customScheme: "myapp")
        XCTAssertThrowsError(try config.validate()) { error in
            XCTAssertEqual(error as? DynamicLinkError, .invalidDomain)
        }
    }

    func testEmptyCustomSchemeThrows() {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "")
        XCTAssertThrowsError(try config.validate()) { error in
            XCTAssertEqual(error as? DynamicLinkError, .invalidScheme)
        }
    }

    func testInvalidExpirationTimeThrows() {
        let config = DynamicLinkConfig(domain: "example.com", linkExpirationTime: 0, customScheme: "myapp")
        XCTAssertThrowsError(try config.validate()) { error in
            XCTAssertEqual(error as? DynamicLinkError, .invalidExpirationTime)
        }
    }

    func testEmptyParameterPrefixThrows() {
        let config = DynamicLinkConfig(domain: "example.com", customParameterPrefix: "", customScheme: "myapp")
        XCTAssertThrowsError(try config.validate()) { error in
            XCTAssertEqual(error as? DynamicLinkError, .invalidParameterPrefix)
        }
    }

    // MARK: - Deep Link Handling

    func testHandleDeepLinkBeforeInitializationThrows() {
        let url = URL(string: "myapp://open?param=value")!
        XCTAssertThrowsError(try sdk.handleDeepLink(url)) { error in
            XCTAssertEqual(error as? DynamicLinkError, .notInitialized)
        }
    }

    func testHandleCustomSchemeDeepLink() throws {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        try sdk.configure(with: config)

        let url = URL(string: "myapp://open?foo=bar")!
        let result = try sdk.handleDeepLink(url)

        XCTAssertTrue(result)
        XCTAssertNotNil(sdk.currentLink)
        XCTAssertEqual(sdk.currentLink?.parameters["foo"], "bar")
    }

    func testHandleHTTPSDeepLink() throws {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        try sdk.configure(with: config)

        let url = URL(string: "https://example.com/app/?foo=bar")!
        let result = try sdk.handleDeepLink(url)

        XCTAssertTrue(result)
    }

    func testHandleUnknownSchemeReturnsFalse() throws {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        try sdk.configure(with: config)

        let url = URL(string: "otherapp://open")!
        let result = try sdk.handleDeepLink(url)

        XCTAssertFalse(result)
    }

    // MARK: - Parameter Extraction

    func testCustomParameterExtraction() throws {
        let config = DynamicLinkConfig(
            domain: "example.com",
            customParameterPrefix: "custom_",
            customScheme: "myapp"
        )
        try sdk.configure(with: config)

        let url = URL(string: "myapp://open?custom_campaign=summer&custom_source=email&normal=value")!
        let result = try sdk.handleDeepLink(url)

        XCTAssertTrue(result)
        XCTAssertEqual(sdk.currentLink?.customParameters["campaign"], "summer")
        XCTAssertEqual(sdk.currentLink?.customParameters["source"], "email")
        XCTAssertNil(sdk.currentLink?.customParameters["normal"])
    }

    func testRequiredParameterMissingThrows() throws {
        let config = DynamicLinkConfig(
            domain: "example.com",
            requiredParameters: ["user_id"],
            customScheme: "myapp"
        )
        try sdk.configure(with: config)

        let url = URL(string: "myapp://open?foo=bar")!
        XCTAssertThrowsError(try sdk.handleDeepLink(url)) { error in
            if case .missingRequiredParameter(let param) = error as? DynamicLinkError {
                XCTAssertEqual(param, "user_id")
            } else {
                XCTFail("Expected missingRequiredParameter error")
            }
        }
    }

    func testRequiredParameterPresent() throws {
        let config = DynamicLinkConfig(
            domain: "example.com",
            requiredParameters: ["user_id"],
            customScheme: "myapp"
        )
        try sdk.configure(with: config)

        let url = URL(string: "myapp://open?user_id=123")!
        let result = try sdk.handleDeepLink(url)
        XCTAssertTrue(result)
        XCTAssertEqual(sdk.currentLink?.parameters["user_id"], "123")
    }

    // MARK: - URL Generation

    func testGenerateDeepLinkURL() {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        let url = config.generateDeepLinkURL(parameters: ["key": "value"])
        XCTAssertNotNil(url)
        XCTAssertEqual(url?.scheme, "https")
        XCTAssertEqual(url?.host, "example.com")
    }

    func testGenerateCustomSchemeURL() {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        let url = config.generateCustomSchemeURL(parameters: ["key": "value"])
        XCTAssertNotNil(url)
        XCTAssertEqual(url?.scheme, "myapp")
    }

    // MARK: - Thread Safety

    func testThreadSafety() {
        let config = DynamicLinkConfig(domain: "example.com", customScheme: "myapp")
        let expectation = XCTestExpectation(description: "Thread safety test")
        expectation.expectedFulfillmentCount = 100

        for _ in 0..<100 {
            DispatchQueue.global().async {
                do {
                    try self.sdk.configure(with: config)
                } catch {
                    XCTAssertEqual(error as? DynamicLinkError, .alreadyInitialized)
                }
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    // MARK: - LogLevel

    func testLogLevelOrdering() {
        XCTAssertTrue(LogLevel.none < LogLevel.error)
        XCTAssertTrue(LogLevel.error < LogLevel.warning)
        XCTAssertTrue(LogLevel.warning < LogLevel.info)
        XCTAssertTrue(LogLevel.info < LogLevel.debug)
        XCTAssertFalse(LogLevel.debug < LogLevel.none)
    }
}
