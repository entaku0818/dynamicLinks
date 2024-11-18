// The Swift Programming Language
// https://docs.swift.org/swift-book
public struct Configuration {
    public let appId: String
    public let apiKey: String
    public let environment: Environment

    public init(appId: String, apiKey: String, environment: Environment = .development) {
        self.appId = appId
        self.apiKey = apiKey
        self.environment = environment
    }
}

public enum Environment {
    case development
    case production
}
