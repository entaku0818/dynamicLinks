# DynamicLinkSDK

DynamicLinkSDK is a powerful and easy-to-use deep linking solution for iOS applications. It provides a robust framework for handling deep links with validation, logging, and error handling capabilities.

## Features

- 🔗 Deep link handling with URL scheme validation
- ⚙️ Configurable parameters and validation
- 🔒 Secure parameter handling
- 📝 Comprehensive logging system
- ⏱️ Link expiration management
- 🔄 Fallback URL support
- 🧪 Extensive test coverage

## Requirements

- iOS 13.0+
- Swift 5.0+
- Xcode 14.0+

## Installation

### Swift Package Manager

Add the following to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/yourusername/DynamicLinkSDK.git", from: "1.0.0")
]
```

Or add it through Xcode:
1. File > Add Packages...
2. Enter the repository URL
3. Select version rules
4. Click Add Package

## Usage

### Basic Setup

```swift
import DynamicLinkSDK

// Initialize the SDK
let config = DynamicLinkConfig(
    scheme: "myapp",
    requiredParameters: ["id", "type"],
    linkExpirationTime: 3600, // 1 hour
    fallbackURL: URL(string: "https://example.com"),
    customParameterPrefix: "custom_",
    logLevel: .info
)

do {
    try DynamicLinkSDK.shared.initialize(with: config)
} catch {
    print("Initialization failed: \(error)")
}
```

### Handling Deep Links

```swift
// In your AppDelegate or SceneDelegate
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    do {
        return try DynamicLinkSDK.shared.handleDeepLink(url)
    } catch {
        print("Failed to handle deep link: \(error)")
        return false
    }
}
```

### Accessing Parameters

```swift
// Get parameters from a deep link
if let link = DynamicLinkSDK.shared.currentLink {
    let id = link.parameters["id"]
    let type = link.parameters["type"]
    let customParams = link.customParameters
}
```

## Configuration Options

### DynamicLinkConfig

| Parameter | Type | Description |
|-----------|------|-------------|
| scheme | String | URL scheme for deep links |
| requiredParameters | [String] | Required parameters for validation |
| linkExpirationTime | TimeInterval | Link expiration time in seconds |
| fallbackURL | URL? | Fallback URL for invalid links |
| customParameterPrefix | String | Prefix for custom parameters |
| logLevel | LogLevel | Logging level for the SDK |

### LogLevel

| Level | Description |
|-------|-------------|
| .none | No logging |
| .error | Error messages only |
| .warning | Warnings and errors |
| .info | Info, warnings, and errors |
| .debug | All messages including debug |

## Error Handling

The SDK throws `DynamicLinkError` for various error conditions:

```swift
enum DynamicLinkError: Error {
    case notInitialized
    case configurationMissing
    case invalidScheme
    case missingRequiredParameter(String)
    case linkExpired
    case invalidURL
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 