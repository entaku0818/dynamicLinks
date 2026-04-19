package com.dynamiclinks.sdk

/**
 * SDK設定クラス
 */
data class DynamicLinkConfig(
    /** ドメイン (例: example.com) */
    val domain: String,
    /** カスタムスキーム (例: myapp) */
    val customScheme: String,
    /** HTTPスキーム (デフォルト: https) */
    val scheme: String = "https",
    /** パスプレフィックス (デフォルト: /app/) */
    val pathPrefix: String = "/app/",
    /** 必須パラメータ */
    val requiredParameters: List<String> = emptyList(),
    /** リンク有効期限（ミリ秒）*/
    val linkExpirationMs: Long = 3_600_000L,
    /** フォールバックURL */
    val fallbackUrl: String? = null,
    /** カスタムパラメータのプレフィックス */
    val customParameterPrefix: String = "custom_",
    /** ログレベル */
    val logLevel: LogLevel = LogLevel.INFO,
) {
    @Throws(DynamicLinkException::class)
    fun validate() {
        if (domain.isBlank()) throw DynamicLinkException.InvalidDomain
        if (customScheme.isBlank()) throw DynamicLinkException.InvalidScheme
        if (!listOf("http", "https").contains(scheme.lowercase())) throw DynamicLinkException.InvalidScheme
        if (linkExpirationMs <= 0) throw DynamicLinkException.InvalidExpirationTime
        if (customParameterPrefix.isBlank()) throw DynamicLinkException.InvalidParameterPrefix
    }
}
