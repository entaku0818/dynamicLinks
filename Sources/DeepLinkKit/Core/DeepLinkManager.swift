
import Foundation
public class DeepLinkManager {
    public static let shared = DeepLinkManager()
    private var configuration: Configuration?
    private let parser: URLParser

    init(parser: URLParser = URLParser()) {
        self.parser = parser
    }

    public func configure(_ configuration: Configuration) {
        self.configuration = configuration
        Logger.log("DeepLinkManager configured with appId: \(configuration.appId)")
    }

    public func handle(_ url: URL) -> DeepLinkResult {
        guard let configuration = configuration else {
            return .failure(error: .invalidConfiguration)
        }

        return parser.parse(url)
    }
}
