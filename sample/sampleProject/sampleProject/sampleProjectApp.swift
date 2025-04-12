//
//  sampleProjectApp.swift
//  sampleProject
//
//  Created by 遠藤拓弥 on 2025/04/12.
//

import SwiftUI
import DynamicLinkSDK

@main
struct sampleProjectApp: App {
    @StateObject private var linkHandler = DeepLinkHandler()
    
    init() {
        setupDynamicLinkSDK()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(linkHandler)
        }
    }
    
    private func setupDynamicLinkSDK() {
        let config = DynamicLinkConfig(
            domain: "example.com",
            pathPrefix: "/app/",
            scheme: "https",
            requiredParameters: ["id", "type"],
            linkExpirationTime: 3600,
            fallbackURL: URL(string: "https://example.com/fallback"),
            customParameterPrefix: "custom_",
            logLevel: .debug,
            customScheme: "sampleapp"
        )
        
        do {
            try DynamicLinkSDK.shared.configure(with: config)
        } catch {
            print("Failed to initialize DynamicLinkSDK: \(error)")
        }
    }
}

class DeepLinkHandler: ObservableObject {
    @Published var currentLink: DynamicLink?
    @Published var errorMessage: String?
    @Published var sampleURLs: [URL] = []
    
    init() {
        generateSampleURLs()
    }
    
    func handleDeepLink(_ url: URL) {
        do {
            let success = try DynamicLinkSDK.shared.handleDeepLink(url)
            if success {
                currentLink = DynamicLinkSDK.shared.currentLink
                errorMessage = nil
            }
        } catch {
            errorMessage = error.localizedDescription
            currentLink = nil
        }
    }
    
    private func generateSampleURLs() {
        let parameters = [
            "id": "123",
            "type": "test",
            "custom_param1": "value1",
            "custom_param2": "value2"
        ]
        
        // HTTPスキームのURL
        if let httpURL = URL(string: "https://example.com/app/?id=123&type=test&custom_param1=value1&custom_param2=value2") {
            sampleURLs.append(httpURL)
        }
        
        // カスタムスキームのURL
        if let customURL = URL(string: "sampleapp://open?id=123&type=test&custom_param1=value1&custom_param2=value2") {
            sampleURLs.append(customURL)
        }
    }
}
