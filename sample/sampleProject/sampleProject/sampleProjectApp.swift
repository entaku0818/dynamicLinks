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
            scheme: "sampleapp",
            requiredParameters: ["id", "type"],
            linkExpirationTime: 3600,
            fallbackURL: URL(string: "https://example.com"),
            customParameterPrefix: "custom_",
            logLevel: .debug
        )
        
        do {
            try DynamicLinkSDK.shared.initialize(with: config)
        } catch {
            print("Failed to initialize DynamicLinkSDK: \(error)")
        }
    }
}

class DeepLinkHandler: ObservableObject {
    @Published var currentLink: DynamicLink?
    @Published var errorMessage: String?
    
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
}
