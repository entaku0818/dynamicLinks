
import Foundation
public enum DeepLinkResult {
    case success(destination: Destination)
    case failure(error: DeepLinkError)
}
