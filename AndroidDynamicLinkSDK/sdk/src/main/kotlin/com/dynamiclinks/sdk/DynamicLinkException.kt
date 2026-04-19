package com.dynamiclinks.sdk

/**
 * SDK例外クラス
 */
sealed class DynamicLinkException(message: String) : Exception(message) {
    object AlreadyInitialized : DynamicLinkException("SDK is already initialized")
    object NotInitialized : DynamicLinkException("SDK is not initialized")
    object ConfigurationMissing : DynamicLinkException("Configuration is missing")
    object InvalidDomain : DynamicLinkException("Invalid domain")
    object InvalidScheme : DynamicLinkException("Invalid scheme")
    object InvalidExpirationTime : DynamicLinkException("Invalid expiration time")
    object InvalidParameterPrefix : DynamicLinkException("Invalid parameter prefix")
    data class MissingRequiredParameter(val paramName: String) : DynamicLinkException("Missing required parameter: $paramName")
    data class Custom(val reason: String) : DynamicLinkException(reason)
}
