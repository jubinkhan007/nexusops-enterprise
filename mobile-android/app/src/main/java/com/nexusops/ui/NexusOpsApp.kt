package com.nexusops.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.nexusops.data.RealtimeStreamService
import com.nexusops.ui.screens.*

enum class NexusTab(val title: String) {
    DASHBOARD("Dashboard"),
    WORKFLOWS("Workflows"),
    RAG_SEARCH("Gemini RAG"),
    LIVE_FEED("Live Feed"),
    REPORTS("Reports")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NexusOpsApp() {
    var selectedTab by remember { mutableStateOf(NexusTab.DASHBOARD) }
    val unreadCount by RealtimeStreamService.unreadCount.collectAsState()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0F172A),
                contentColor = Color.White
            ) {
                NavigationBarItem(
                    selected = selectedTab == NexusTab.DASHBOARD,
                    onClick = { selectedTab = NexusTab.DASHBOARD },
                    label = { Text(NexusTab.DASHBOARD.title) },
                    icon = { Text("📊") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        indicatorColor = Color(0xFF1E293B)
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == NexusTab.WORKFLOWS,
                    onClick = { selectedTab = NexusTab.WORKFLOWS },
                    label = { Text(NexusTab.WORKFLOWS.title) },
                    icon = { Text("⚡") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        indicatorColor = Color(0xFF1E293B)
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == NexusTab.RAG_SEARCH,
                    onClick = { selectedTab = NexusTab.RAG_SEARCH },
                    label = { Text(NexusTab.RAG_SEARCH.title) },
                    icon = { Text("🔍") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        indicatorColor = Color(0xFF1E293B)
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == NexusTab.LIVE_FEED,
                    onClick = { selectedTab = NexusTab.LIVE_FEED },
                    label = { Text(NexusTab.LIVE_FEED.title) },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (unreadCount > 0) {
                                    Badge(containerColor = Color(0xFFEF4444)) {
                                        Text("$unreadCount", color = Color.White)
                                    }
                                }
                            }
                        ) {
                            Text("🔔")
                        }
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        indicatorColor = Color(0xFF1E293B)
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == NexusTab.REPORTS,
                    onClick = { selectedTab = NexusTab.REPORTS },
                    label = { Text(NexusTab.REPORTS.title) },
                    icon = { Text("📜") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        indicatorColor = Color(0xFF1E293B)
                    )
                )
            }
        }
    ) { paddingValues ->
        Surface(
            modifier = Modifier.padding(paddingValues),
            color = Color(0xFF0F172A)
        ) {
            when (selectedTab) {
                NexusTab.DASHBOARD -> DashboardScreen()
                NexusTab.WORKFLOWS -> WorkflowsScreen()
                NexusTab.RAG_SEARCH -> RAGSearchScreen()
                NexusTab.LIVE_FEED -> ActivityFeedScreen()
                NexusTab.REPORTS -> ExecutiveReportsScreen()
            }
        }
    }
}
