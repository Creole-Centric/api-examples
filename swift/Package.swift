// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CreoleCentricAPIExample",
    platforms: [
        .macOS(.v13),
        .iOS(.v16)
    ],
    products: [
        .executable(
            name: "CreoleCentricAPIExample",
            targets: ["CreoleCentricAPIExample"]
        ),
        .library(
            name: "CreoleCentricAPI",
            targets: ["CreoleCentricAPIExample"]
        )
    ],
    targets: [
        .executableTarget(
            name: "CreoleCentricAPIExample",
            path: ".",
            sources: ["CreoleCentricAPI.swift"]
        )
    ]
)
