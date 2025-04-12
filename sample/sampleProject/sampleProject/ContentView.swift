//
//  ContentView.swift
//  sampleProject
//
//  Created by 遠藤拓弥 on 2025/04/12.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var linkHandler: DeepLinkHandler
    
    var body: some View {
        VStack(spacing: 20) {
            Text("DynamicLinkSDK Sample")
                .font(.title)
                .padding()
            
            // サンプルURLの表示
            VStack(alignment: .leading, spacing: 10) {
                Text("Sample URLs")
                    .font(.headline)
                
                ForEach(linkHandler.sampleURLs, id: \.absoluteString) { url in
                    Button(action: {
                        UIApplication.shared.open(url)
                    }) {
                        Text(url.absoluteString)
                            .font(.subheadline)
                            .foregroundColor(.blue)
                            .lineLimit(1)
                            .truncationMode(.middle)
                    }
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(10)
            
            if let link = linkHandler.currentLink {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Current Deep Link")
                        .font(.headline)
                    
                    Text("URL: \(link.url.absoluteString)")
                        .font(.subheadline)
                    
                    Text("Parameters:")
                        .font(.headline)
                        .padding(.top)
                    
                    ForEach(link.parameters.sorted(by: { $0.key < $1.key }), id: \.key) { key, value in
                        Text("\(key): \(value)")
                            .font(.subheadline)
                    }
                    
                    if !link.customParameters.isEmpty {
                        Text("Custom Parameters:")
                            .font(.headline)
                            .padding(.top)
                        
                        ForEach(link.customParameters.sorted(by: { $0.key < $1.key }), id: \.key) { key, value in
                            Text("\(key): \(value)")
                                .font(.subheadline)
                        }
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
            } else {
                Text("No active deep link")
                    .foregroundColor(.gray)
            }
            
            if let error = linkHandler.errorMessage {
                Text("Error: \(error)")
                    .foregroundColor(.red)
                    .padding()
            }
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    ContentView()
        .environmentObject(DeepLinkHandler())
}
