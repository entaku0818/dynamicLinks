
internal enum Logger {
    static func log(_ message: String) {
        #if DEBUG
        print("[DeepLinkKit] \(message)")
        #endif
    }
}
