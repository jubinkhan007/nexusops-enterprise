import Foundation

struct RAGMatch: Identifiable, Codable {
    var id: String { documentId }
    let documentId: String
    let title: String
    let category: String
    let relevanceScore: Double
    let matchPercentage: Double
    let snippet: String

    enum CodingKeys: String, CodingKey {
        case documentId = "document_id"
        case title
        case category
        case relevanceScore = "relevance_score"
        case matchPercentage = "match_percentage"
        case snippet
    }
}

struct RAGResponse: Codable {
    let query: String
    let aiSynthesis: String
    let vectorDimension: Int
    let totalDocumentsIndexed: Int
    let topMatches: [RAGMatch]

    enum CodingKeys: String, CodingKey {
        case query
        case aiSynthesis = "ai_synthesis"
        case vectorDimension = "vector_dimension"
        case totalDocumentsIndexed = "total_documents_indexed"
        case topMatches = "top_matches"
    }
}

struct RAGAskRequest: Codable {
    let query: String
}

struct RAGUploadResponse: Codable {
    let filename: String
    let documentId: String
    let chunksCreated: Int
    let vectorDimension: Int
    let status: String
    let message: String

    enum CodingKeys: String, CodingKey {
        case filename
        case documentId = "document_id"
        case chunksCreated = "chunks_created"
        case vectorDimension = "vector_dimension"
        case status
        case message
    }
}

enum EventSeverity: String, Codable, CaseIterable {
    case info = "Info"
    case warning = "Warning"
    case critical = "Critical"

    var colorName: String {
        switch self {
        case .info: return "blue"
        case .warning: return "orange"
        case .critical: return "red"
        }
    }
}

struct TelemetryEvent: Identifiable, Codable {
    let id: String
    let timestamp: String
    let sourceComponent: String
    let category: String
    let severity: EventSeverity
    let message: String
    let executionTimeMs: Double?

    enum CodingKeys: String, CodingKey {
        case id
        case timestamp
        case sourceComponent = "source_component"
        case category
        case severity
        case message
        case executionTimeMs = "execution_time_ms"
    }
}

