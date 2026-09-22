package com.nexusops.model

data class RAGMatchItem(
    val document_id: String,
    val title: String,
    val category: String,
    val relevance_score: Double,
    val match_percentage: Double,
    val snippet: String
)

data class RAGResponseItem(
    val query: String,
    val ai_synthesis: String,
    val vector_dimension: Int,
    val total_documents_indexed: Int,
    val top_matches: List<RAGMatchItem>
)

data class RAGAskPayload(
    val query: String
)

data class RAGUploadResponse(
    val filename: String,
    val document_id: String,
    val chunks_created: Int,
    val vector_dimension: Int,
    val status: String,
    val message: String
)

enum class EventSeverity(val label: String) {
    INFO("Info"),
    WARNING("Warning"),
    CRITICAL("Critical")
}

data class TelemetryEvent(
    val id: String,
    val timestamp: String,
    val sourceComponent: String,
    val category: String,
    val severity: EventSeverity,
    val message: String,
    val executionTimeMs: Double? = null
)

