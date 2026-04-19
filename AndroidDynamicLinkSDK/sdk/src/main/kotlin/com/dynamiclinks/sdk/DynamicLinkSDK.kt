package com.dynamiclinks.sdk

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log

/**
 * DynamicLinkSDK - Android用ディープリンク処理SDK
 */
class DynamicLinkSDK private constructor() {

    private var config: DynamicLinkConfig? = null
    private var isInitialized = false
    private val lock = Any()

    /** 最後に処理したディープリンク */
    var currentLink: DynamicLink? = null
        private set

    companion object {
        private const val TAG = "DynamicLinkSDK"

        @Volatile
        private var instance: DynamicLinkSDK? = null

        @JvmStatic
        fun getInstance(): DynamicLinkSDK =
            instance ?: synchronized(this) {
                instance ?: DynamicLinkSDK().also { instance = it }
            }

        /** テスト用リセット */
        internal fun resetForTest() {
            synchronized(this) { instance = null }
        }
    }

    /**
     * SDKを初期化する
     * @throws DynamicLinkException 既に初期化済みの場合、または設定が不正な場合
     */
    @Throws(DynamicLinkException::class)
    fun configure(config: DynamicLinkConfig) {
        synchronized(lock) {
            if (isInitialized) throw DynamicLinkException.AlreadyInitialized
            config.validate()
            this.config = config
            isInitialized = true
            log(LogLevel.INFO, "SDK initialized with domain: ${config.domain}")
        }
    }

    /**
     * Intentからディープリンクを処理する
     * @return 処理に成功した場合 true
     * @throws DynamicLinkException 未初期化の場合
     */
    @Throws(DynamicLinkException::class)
    fun handleIntent(intent: Intent): Boolean {
        val uri = intent.data ?: return false
        return handleUri(uri)
    }

    /**
     * URIからディープリンクを処理する
     * @return 処理に成功した場合 true
     * @throws DynamicLinkException 未初期化の場合
     */
    @Throws(DynamicLinkException::class)
    fun handleUri(uri: Uri): Boolean {
        val cfg = synchronized(lock) {
            if (!isInitialized) throw DynamicLinkException.NotInitialized
            config ?: throw DynamicLinkException.ConfigurationMissing
        }

        val scheme = uri.scheme?.lowercase() ?: run {
            log(LogLevel.DEBUG, "No scheme in URI: $uri")
            return false
        }

        val isCustomScheme = scheme == cfg.customScheme.lowercase()
        val isHttpsScheme = scheme == cfg.scheme.lowercase()

        if (!isCustomScheme && !isHttpsScheme) {
            log(LogLevel.DEBUG, "Invalid scheme: $scheme")
            return false
        }

        // パラメータ抽出
        val parameters = mutableMapOf<String, String>()
        uri.queryParameterNames.forEach { key ->
            uri.getQueryParameter(key)?.let { parameters[key] = it }
        }

        // 必須パラメータ検証
        for (required in cfg.requiredParameters) {
            if (!parameters.containsKey(required)) {
                log(LogLevel.ERROR, "Missing required parameter: $required")
                throw DynamicLinkException.MissingRequiredParameter(required)
            }
        }

        // カスタムパラメータ抽出
        val customParameters = parameters
            .filter { it.key.startsWith(cfg.customParameterPrefix) }
            .mapKeys { it.key.removePrefix(cfg.customParameterPrefix) }

        val link = DynamicLink(
            uri = uri,
            parameters = parameters,
            customParameters = customParameters,
            timestamp = System.currentTimeMillis()
        )

        currentLink = link
        log(LogLevel.INFO, "Successfully processed deep link: $uri")
        return true
    }

    /**
     * ディープリンクURLを生成する
     */
    fun generateDeepLinkUri(parameters: Map<String, String>): Uri {
        val cfg = synchronized(lock) {
            config ?: throw DynamicLinkException.ConfigurationMissing
        }
        return Uri.Builder()
            .scheme(cfg.scheme)
            .authority(cfg.domain)
            .path(cfg.pathPrefix)
            .apply { parameters.forEach { (k, v) -> appendQueryParameter(k, v) } }
            .build()
    }

    /**
     * カスタムスキームURLを生成する
     */
    fun generateCustomSchemeUri(parameters: Map<String, String>): Uri {
        val cfg = synchronized(lock) {
            config ?: throw DynamicLinkException.ConfigurationMissing
        }
        return Uri.Builder()
            .scheme(cfg.customScheme)
            .authority("open")
            .apply { parameters.forEach { (k, v) -> appendQueryParameter(k, v) } }
            .build()
    }

    /** テスト用リセット */
    internal fun reset() {
        synchronized(lock) {
            config = null
            isInitialized = false
            currentLink = null
        }
    }

    private fun log(level: LogLevel, message: String) {
        val cfg = config ?: return
        if (level.priority < cfg.logLevel.priority) return
        when (level) {
            LogLevel.ERROR -> Log.e(TAG, message)
            LogLevel.WARNING -> Log.w(TAG, message)
            LogLevel.INFO -> Log.i(TAG, message)
            LogLevel.DEBUG -> Log.d(TAG, message)
            LogLevel.NONE -> Unit
        }
    }
}
