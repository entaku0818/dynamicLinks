package com.dynamiclinks.sdk

import android.net.Uri

/**
 * 処理済みディープリンクを表すデータクラス
 */
data class DynamicLink(
    val uri: Uri,
    val parameters: Map<String, String>,
    val customParameters: Map<String, String>,
    val timestamp: Long,
)
