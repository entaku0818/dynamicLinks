# DynamicLinkSDK (iOS)

iOS用ディープリンク処理SDK。カスタムスキーム・Universal Linksに対応。

## 要件

- iOS 13+
- Swift 5.9+

## インストール

### Swift Package Manager

`Package.swift` に追加:

```swift
dependencies: [
    .package(url: "https://github.com/your-org/dynamiclinks", from: "1.0.0")
]
```

または Xcode の **File > Add Package Dependencies** から追加。

## セットアップ

```swift
import DynamicLinkSDK

@main
struct MyApp: App {
    init() {
        do {
            try DynamicLinkSDK.shared.configure(with: DynamicLinkConfig(
                domain: "link.example.com",
                customScheme: "myapp"
            ))
        } catch {
            print("SDK init error: \(error)")
        }
    }
}
```

## ディープリンクの処理

### SwiftUI

```swift
.onOpenURL { url in
    do {
        let handled = try DynamicLinkSDK.shared.handleDeepLink(url)
        if handled, let link = DynamicLinkSDK.shared.currentLink {
            // link.parameters, link.customParameters を使って画面遷移
            let page = link.parameters["page"]
        }
    } catch {
        print("Deep link error: \(error)")
    }
}
```

### UIKit

```swift
func application(_ app: UIApplication, open url: URL,
                 options: [UIApplication.OpenURLOptionsKey: Any]) -> Bool {
    return (try? DynamicLinkSDK.shared.handleDeepLink(url)) ?? false
}
```

## 設定オプション

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `domain` | String | ✅ | - | ドメイン (例: `link.example.com`) |
| `customScheme` | String | ✅ | - | カスタムスキーム (例: `myapp`) |
| `scheme` | String | | `"https"` | HTTPスキーム |
| `pathPrefix` | String | | `"/app/"` | パスプレフィックス |
| `requiredParameters` | [String] | | `[]` | 必須パラメータ名リスト |
| `linkExpirationTime` | TimeInterval | | `3600` | 有効期限（秒） |
| `fallbackURL` | URL? | | `nil` | フォールバックURL |
| `customParameterPrefix` | String | | `"custom_"` | カスタムパラメータのプレフィックス |
| `logLevel` | LogLevel | | `.info` | ログレベル |

## URL生成

```swift
let config = DynamicLinkConfig(domain: "link.example.com", customScheme: "myapp")

// HTTPSリンク
let url = config.generateDeepLinkURL(parameters: ["page": "home", "ref": "banner"])
// → https://link.example.com/app/?page=home&ref=banner

// カスタムスキームリンク
let customUrl = config.generateCustomSchemeURL(parameters: ["page": "profile"])
// → myapp://open?page=profile
```

## カスタムパラメータ

`customParameterPrefix`（デフォルト: `custom_`）から始まるパラメータは `customParameters` に自動分類されます。

```
myapp://open?custom_campaign=summer&custom_source=email&page=home
```

```swift
let link = DynamicLinkSDK.shared.currentLink
link?.parameters["page"]            // → "home"
link?.customParameters["campaign"]  // → "summer"
link?.customParameters["source"]    // → "email"
```

## エラーハンドリング

```swift
do {
    try DynamicLinkSDK.shared.handleDeepLink(url)
} catch DynamicLinkError.notInitialized {
    // configure() を先に呼ぶ必要がある
} catch DynamicLinkError.alreadyInitialized {
    // 既に初期化済み
} catch DynamicLinkError.missingRequiredParameter(let name) {
    print("必須パラメータが不足: \(name)")
} catch {
    print(error.localizedDescription)
}
```

## ログレベル

| レベル | 説明 |
|--------|------|
| `.none` | ログなし |
| `.error` | エラーのみ |
| `.warning` | 警告・エラー |
| `.info` | 情報・警告・エラー（デフォルト） |
| `.debug` | 全メッセージ |

## ライセンス

MIT License
