# DynamicLinkSDK

Dynamic LinkサービスのiOS SDKです。アプリ開発者が簡単にディープリンク機能を実装できるようにするためのSDKを提供します。

## 要件

- iOS 13.0+
- Swift 5.0+
- Xcode 13.0+

## インストール

### Swift Package Manager

1. Xcodeで「File」→「Add Packages...」を選択
2. 検索フィールドにリポジトリのURLを入力
3. バージョンルールを選択
4. 「Add Package」をクリック

### 手動インストール

1. このリポジトリをクローン
2. `ios/DynamicLinkSDK`フォルダをプロジェクトに追加

## 使い方

```swift
import DynamicLinkSDK

// SDKの初期化
let config = DynamicLinkConfig(scheme: "myapp")
DynamicLinkSDK.shared.configure(with: config)

// ディープリンクの処理
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return DynamicLinkSDK.shared.handleDeepLink(url)
}
```

## 機能

- [ ] カスタムスキームのサポート
- [ ] ディープリンクパラメータの解析
- [ ] エラーハンドリング
- [ ] デバッグモード
- [ ] ログ出力
- [ ] パフォーマンス計測

## 開発状況

現在、基本的な機能を実装中です。詳細は[GitHub Issues](https://github.com/entaku0818/dynamicLinks/issues/6)を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。 