package com.dynamiclinks.sdk

import android.net.Uri
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class DynamicLinkSDKTest {

    private lateinit var sdk: DynamicLinkSDK

    @Before
    fun setUp() {
        DynamicLinkSDK.resetForTest()
        sdk = DynamicLinkSDK.getInstance()
    }

    @After
    fun tearDown() {
        sdk.reset()
    }

    // MARK: - Singleton

    @Test
    fun testSingletonInstance() {
        assertSame(DynamicLinkSDK.getInstance(), DynamicLinkSDK.getInstance())
    }

    // MARK: - Initialization

    @Test
    fun testBasicInitialization() {
        val config = DynamicLinkConfig(domain = "example.com", customScheme = "myapp")
        assertDoesNotThrow { sdk.configure(config) }
    }

    @Test
    fun testDetailedInitialization() {
        val config = DynamicLinkConfig(
            domain = "example.com",
            customScheme = "myapp",
            linkExpirationMs = 7_200_000L,
            fallbackUrl = "https://example.com/fallback",
            customParameterPrefix = "custom_",
            logLevel = LogLevel.DEBUG,
        )
        assertDoesNotThrow { sdk.configure(config) }
    }

    @Test(expected = DynamicLinkException.AlreadyInitialized::class)
    fun testDoubleInitializationThrows() {
        val config = DynamicLinkConfig(domain = "example.com", customScheme = "myapp")
        sdk.configure(config)
        sdk.configure(config)
    }

    // MARK: - Configuration Validation

    @Test(expected = DynamicLinkException.InvalidDomain::class)
    fun testEmptyDomainThrows() {
        DynamicLinkConfig(domain = "", customScheme = "myapp").validate()
    }

    @Test(expected = DynamicLinkException.InvalidScheme::class)
    fun testEmptyCustomSchemeThrows() {
        DynamicLinkConfig(domain = "example.com", customScheme = "").validate()
    }

    @Test(expected = DynamicLinkException.InvalidExpirationTime::class)
    fun testInvalidExpirationThrows() {
        DynamicLinkConfig(domain = "example.com", customScheme = "myapp", linkExpirationMs = 0).validate()
    }

    @Test(expected = DynamicLinkException.InvalidParameterPrefix::class)
    fun testEmptyPrefixThrows() {
        DynamicLinkConfig(domain = "example.com", customScheme = "myapp", customParameterPrefix = "").validate()
    }

    // MARK: - Deep Link Handling

    @Test(expected = DynamicLinkException.NotInitialized::class)
    fun testHandleUriBeforeInitThrows() {
        sdk.handleUri(Uri.parse("myapp://open?foo=bar"))
    }

    @Test
    fun testHandleCustomSchemeUri() {
        sdk.configure(DynamicLinkConfig(domain = "example.com", customScheme = "myapp"))
        val result = sdk.handleUri(Uri.parse("myapp://open?foo=bar"))
        assertTrue(result)
        assertNotNull(sdk.currentLink)
        assertEquals("bar", sdk.currentLink?.parameters?.get("foo"))
    }

    @Test
    fun testHandleHttpsUri() {
        sdk.configure(DynamicLinkConfig(domain = "example.com", customScheme = "myapp"))
        val result = sdk.handleUri(Uri.parse("https://example.com/app/?foo=bar"))
        assertTrue(result)
    }

    @Test
    fun testUnknownSchemeReturnsFalse() {
        sdk.configure(DynamicLinkConfig(domain = "example.com", customScheme = "myapp"))
        val result = sdk.handleUri(Uri.parse("otherapp://open"))
        assertFalse(result)
    }

    // MARK: - Parameter Extraction

    @Test
    fun testCustomParameterExtraction() {
        sdk.configure(
            DynamicLinkConfig(
                domain = "example.com",
                customScheme = "myapp",
                customParameterPrefix = "custom_",
            )
        )
        val result = sdk.handleUri(Uri.parse("myapp://open?custom_campaign=summer&custom_source=email&normal=value"))
        assertTrue(result)
        assertEquals("summer", sdk.currentLink?.customParameters?.get("campaign"))
        assertEquals("email", sdk.currentLink?.customParameters?.get("source"))
        assertNull(sdk.currentLink?.customParameters?.get("normal"))
    }

    @Test(expected = DynamicLinkException.MissingRequiredParameter::class)
    fun testMissingRequiredParameterThrows() {
        sdk.configure(
            DynamicLinkConfig(
                domain = "example.com",
                customScheme = "myapp",
                requiredParameters = listOf("user_id"),
            )
        )
        sdk.handleUri(Uri.parse("myapp://open?foo=bar"))
    }

    @Test
    fun testRequiredParameterPresent() {
        sdk.configure(
            DynamicLinkConfig(
                domain = "example.com",
                customScheme = "myapp",
                requiredParameters = listOf("user_id"),
            )
        )
        val result = sdk.handleUri(Uri.parse("myapp://open?user_id=123"))
        assertTrue(result)
        assertEquals("123", sdk.currentLink?.parameters?.get("user_id"))
    }

    // MARK: - Thread Safety

    @Test
    fun testThreadSafety() {
        val config = DynamicLinkConfig(domain = "example.com", customScheme = "myapp")
        val threads = (1..50).map {
            Thread {
                try {
                    sdk.configure(config)
                } catch (e: DynamicLinkException.AlreadyInitialized) {
                    // 期待通り
                }
            }
        }
        threads.forEach { it.start() }
        threads.forEach { it.join() }
    }

    // MARK: - LogLevel

    @Test
    fun testLogLevelOrdering() {
        assertTrue(LogLevel.NONE.priority < LogLevel.ERROR.priority)
        assertTrue(LogLevel.ERROR.priority < LogLevel.WARNING.priority)
        assertTrue(LogLevel.WARNING.priority < LogLevel.INFO.priority)
        assertTrue(LogLevel.INFO.priority < LogLevel.DEBUG.priority)
    }
}

private fun assertDoesNotThrow(block: () -> Unit) {
    try {
        block()
    } catch (e: Exception) {
        fail("Expected no exception but got: ${e.message}")
    }
}
