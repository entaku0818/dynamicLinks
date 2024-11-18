// swift-tools-version: 5.10
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "DeepLinkKit",
    platforms: [
        .iOS(.v15),
    ],
    products: [
        .library(
            name: "DeepLinkKit",
            targets: ["DeepLinkKit"]),
    ],
    targets: [
        .target(
            name: "DeepLinkKit",
            dependencies: []),
        .testTarget(
            name: "DeepLinkKitTests",
            dependencies: ["DeepLinkKit"]),
    ]
)
