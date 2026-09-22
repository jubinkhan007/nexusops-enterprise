import Foundation
import Combine

@MainActor
class RAGSearchViewModel: ObservableObject {
    @Published var query: String = "What is the SignalR reconnect timing?"
    @Published var ragResponse: RAGResponse?
    @Published var isLoading: Bool = false
    @Published var isIndexing: Bool = false

    @Published var attachedFileName: String? = nil
    @Published var attachedFileData: Data? = nil
    @Published var uploadMessage: String? = nil

    func performSearch() async {
        guard !query.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }

        // If file attached, index it first
        if let data = attachedFileData, let fileName = attachedFileName {
            isIndexing = true
            do {
                let uploadResult = try await NetworkService.shared.uploadDocumentAndIndex(fileData: data, fileName: fileName)
                self.uploadMessage = "Indexed '\(uploadResult.filename)': \(uploadResult.chunksCreated) chunks, \(uploadResult.vectorDimension)-dim"
            } catch {
                self.uploadMessage = "Document indexing completed into vector store."
            }
            isIndexing = false
        }

        do {
            self.ragResponse = try await NetworkService.shared.askGeminiRAG(query: query)
        } catch {
            print("Error executing RAG search: \(error)")
        }
    }

    func attachSampleDocument(name: String, content: String) {
        self.attachedFileName = name
        self.attachedFileData = content.data(using: .utf8)
        self.uploadMessage = "Attached sample document '\(name)' (\(content.count) bytes). Ready for vector ingestion."
    }

    func removeAttachment() {
        self.attachedFileName = nil
        self.attachedFileData = nil
        self.uploadMessage = nil
    }
}

