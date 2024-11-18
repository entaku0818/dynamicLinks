
import SwiftUI

public extension View {
    func handleDeepLink(handler: @escaping (DeepLinkResult) -> Void) -> some View {
        self.onOpenURL { url in
            let result = DeepLinkManager.shared.handle(url)
            handler(result)
        }
    }
}
