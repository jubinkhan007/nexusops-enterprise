import SwiftUI

@main
struct NexusOpsMobileApp: App {
    @StateObject private var streamService = RealtimeStreamService.shared

    var body: some Scene {
        WindowGroup {
            TabView {
                DashboardView()
                    .tabItem {
                        Label("Dashboard", systemImage: "chart.bar.fill")
                    }

                RAGSearchView()
                    .tabItem {
                        Label("Gemini RAG", systemImage: "magnifyingglass.circle.fill")
                    }

                ActivityFeedView()
                    .tabItem {
                        Label("Live Feed", systemImage: "bell.badge.fill")
                    }
                    .badge(streamService.unreadCount > 0 ? "\(streamService.unreadCount)" : nil)
            }
            .preferredColorScheme(.dark)
        }
    }
}

