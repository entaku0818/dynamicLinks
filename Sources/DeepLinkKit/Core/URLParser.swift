
import Foundation
internal class URLParser {
    func parse(_ url: URL) -> DeepLinkResult {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else {
            return .failure(error: .invalidURL)
        }

        guard let scheme = components.scheme else {
            return .failure(error: .invalidScheme)
        }

        guard let path = components.path.split(separator: "/").first else {
            return .failure(error: .invalidPath)
        }

        let queryItems = components.queryItems ?? []

        switch path {
        case "product":
            if let id = queryItems.first(where: { $0.name == "id" })?.value {
                return .success(destination: .product(id: id))
            }
        case "article":
            if let id = queryItems.first(where: { $0.name == "id" })?.value {
                return .success(destination: .article(id: id))
            }
        case "campaign":
            if let id = queryItems.first(where: { $0.name == "id" })?.value {
                return .success(destination: .campaign(id: id))
            }
        case "category":
            if let id = queryItems.first(where: { $0.name == "id" })?.value {
                return .success(destination: .category(id: id))
            }
        case "home":
            return .success(destination: .home)
        default:
            break
        }

        return .failure(error: .parseError)
    }
}
