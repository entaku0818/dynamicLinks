# DynamicLinkSDK (Android)

Android用ディープリンク処理SDK。カスタムスキーム・App Linksに対応。

## 要件

- Android API 21+
- Kotlin 1.9+

## インストール

### Gradle

`settings.gradle.kts` にリポジトリを追加:

```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
```

`build.gradle.kts` に依存関係を追加:

```kotlin
dependencies {
    implementation("com.dynamiclinks:sdk:1.0.0")
}
```

## セットアップ

### Application クラスで初期化

```kotlin
import com.dynamiclinks.sdk.DynamicLinkConfig
import com.dynamiclinks.sdk.DynamicLinkSDK
import com.dynamiclinks.sdk.LogLevel

class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        DynamicLinkSDK.getInstance().configure(
            DynamicLinkConfig(
                domain = "link.example.com",
                customScheme = "myapp"
            )
        )
    }
}
```

### AndroidManifest.xml にIntent Filterを追加

```xml
<activity android:name=".DeepLinkActivity">
    <!-- カスタムスキーム -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="myapp" />
    </intent-filter>

    <!-- App Links (HTTPS) -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="link.example.com" />
    </intent-filter>
</activity>
```

## ディープリンクの処理

```kotlin
class DeepLinkActivity : AppCompatActivity() {
    private val sdk = DynamicLinkSDK.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleDeepLink(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent) {
        try {
            val handled = sdk.handleIntent(intent)
            if (handled) {
                val link = sdk.currentLink ?: return
                val page = link.parameters["page"]
                // page に応じて画面遷移
            }
        } catch (e: DynamicLinkException) {
            Log.e("App", "Deep link error: ${e.message}")
        }
    }
}
```

## 設定オプション

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `domain` | String | ✅ | - | ドメイン (例: `link.example.com`) |
| `customScheme` | String | ✅ | - | カスタムスキーム (例: `myapp`) |
| `scheme` | String | | `"https"` | HTTPスキーム |
| `pathPrefix` | String | | `"/app/"` | パスプレフィックス |
| `requiredParameters` | List<String> | | `[]` | 必須パラメータ名リスト |
| `linkExpirationMs` | Long | | `3_600_000` | 有効期限（ミリ秒） |
| `fallbackUrl` | String? | | `null` | フォールバックURL |
| `customParameterPrefix` | String | | `"custom_"` | カスタムパラメータのプレフィックス |
| `logLevel` | LogLevel | | `LogLevel.INFO` | ログレベル |

## URI生成

```kotlin
val sdk = DynamicLinkSDK.getInstance()

// HTTPSリンク
val uri = sdk.generateDeepLinkUri(mapOf("page" to "home", "ref" to "banner"))
// → https://link.example.com/app/?page=home&ref=banner

// カスタムスキームリンク
val customUri = sdk.generateCustomSchemeUri(mapOf("page" to "profile"))
// → myapp://open?page=profile
```

## カスタムパラメータ

`customParameterPrefix`（デフォルト: `custom_`）から始まるパラメータは `customParameters` に自動分類されます。

```
myapp://open?custom_campaign=summer&custom_source=email&page=home
```

```kotlin
val link = sdk.currentLink
link?.parameters["page"]            // → "home"
link?.customParameters["campaign"]  // → "summer"
link?.customParameters["source"]    // → "email"
```

## エラーハンドリング

```kotlin
try {
    sdk.handleIntent(intent)
} catch (e: DynamicLinkException.NotInitialized) {
    // configure() を先に呼ぶ必要がある
} catch (e: DynamicLinkException.AlreadyInitialized) {
    // 既に初期化済み
} catch (e: DynamicLinkException.MissingRequiredParameter) {
    Log.e("App", "必須パラメータが不足: ${e.paramName}")
} catch (e: DynamicLinkException) {
    Log.e("App", e.message ?: "Unknown error")
}
```

## ログレベル

| レベル | 説明 |
|--------|------|
| `LogLevel.NONE` | ログなし |
| `LogLevel.ERROR` | エラーのみ |
| `LogLevel.WARNING` | 警告・エラー |
| `LogLevel.INFO` | 情報・警告・エラー（デフォルト） |
| `LogLevel.DEBUG` | 全メッセージ |

## ライセンス

MIT License
