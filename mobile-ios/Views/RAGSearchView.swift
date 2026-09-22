import SwiftUI

struct RAGSearchView: View {
    @StateObject private var viewModel = RAGSearchViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            
            // Header Banner
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Gemini RAG Vector Search")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Spacer()
                    Image(systemName: "sparkles")
                        .font(.title3)
                        .foregroundColor(.indigo)
                }
                Text("1536-Dimensional pgvector HNSW Engine & Multi-Modal Document Upload")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding(.horizontal)

            // Multi-Modal Document Attachment Section
            VStack(alignment: .leading, spacing: 8) {
                Text("Attach Context Document (PDF / JSON / Text)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.gray)

                if let fileName = viewModel.attachedFileName {
                    HStack {
                        Image(systemName: "doc.fill")
                            .foregroundColor(.blue)
                        Text(fileName)
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        Spacer()
                        Button(action: {
                            viewModel.removeAttachment()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(10)
                    .background(Color.blue.opacity(0.15))
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.blue.opacity(0.4), lineWidth: 1)
                    )
                } else {
                    HStack(spacing: 10) {
                        Button(action: {
                            viewModel.attachSampleDocument(
                                name: "Anomaly_Runbook_v2.pdf",
                                content: "IsolationForest threshold settings: set contamination score = 0.05. When anomaly score > 0.85, auto-trigger ASP.NET Webhook and SignalR alert."
                            )
                        }) {
                            HStack(spacing: 4) {
                                Image(systemName: "doc.badge.plus")
                                Text("+ Anomaly PDF")
                            }
                            .font(.caption2)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color(white: 0.14))
                            .foregroundColor(.indigo)
                            .cornerRadius(6)
                        }

                        Button(action: {
                            viewModel.attachSampleDocument(
                                name: "Telemetry_Schema.json",
                                content: "{ 'event_type': 'TelemetryReceived', 'latency_ms': 42.1, 'vector_dim': 1536, 'index': 'hnsw_cosine' }"
                            )
                        }) {
                            HStack(spacing: 4) {
                                Image(systemName: "doc.badge.plus")
                                Text("+ Telemetry JSON")
                            }
                            .font(.caption2)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color(white: 0.14))
                            .foregroundColor(.indigo)
                            .cornerRadius(6)
                        }
                    }
                }

                if let status = viewModel.uploadMessage {
                    Text(status)
                        .font(.caption2)
                        .foregroundColor(.green)
                }
            }
            .padding(.horizontal)

            // Query Search Bar
            HStack {
                TextField("Ask natural language question...", text: $viewModel.query)
                    .padding(12)
                    .background(Color(white: 0.12))
                    .foregroundColor(.white)
                    .cornerRadius(10)

                Button(action: {
                    Task {
                        await viewModel.performSearch()
                    }
                }) {
                    Text(viewModel.isLoading ? "Searching..." : "Search")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            .padding(.horizontal)

            // Loading / Results View
            if viewModel.isLoading || viewModel.isIndexing {
                VStack(spacing: 12) {
                    ProgressView()
                    Text(viewModel.isIndexing ? "Vectorizing & Indexing Document in pgvector..." : "Running Gemini RAG Cosine Retrieval...")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.top, 20)
            } else if let response = viewModel.ragResponse {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        
                        // Gemini AI Synthesis Card
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("GEMINI AI SYNTHESIS")
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.indigo)
                                Spacer()
                                Text("1536-dim Embeddings")
                                    .font(.caption2)
                                    .foregroundColor(.gray)
                            }
                            Text(response.aiSynthesis)
                                .font(.subheadline)
                                .foregroundColor(.white)
                                .lineSpacing(4)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(white: 0.12))
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.indigo.opacity(0.4), lineWidth: 1)
                        )

                        Text("PostgreSQL HNSW Vector Matches (\(response.topMatches.count))")
                            .font(.headline)
                            .foregroundColor(.white)

                        ForEach(response.topMatches) { match in
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text(match.title)
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("\(String(format: "%.1f", match.matchPercentage))% Match")
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.green.opacity(0.2))
                                        .foregroundColor(.green)
                                        .cornerRadius(6)
                                }
                                HStack {
                                    Text(match.category)
                                        .font(.caption2)
                                        .foregroundColor(.gray)
                                    Spacer()
                                    Text("Relevance: \(String(format: "%.3f", match.relevanceScore))")
                                        .font(.caption2)
                                        .foregroundColor(.gray)
                                }
                                Text(match.snippet)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                    .lineLimit(3)
                            }
                            .padding()
                            .background(Color(white: 0.08))
                            .cornerRadius(10)
                        }
                    }
                    .padding(.horizontal)
                }
            }

            Spacer()
        }
        .padding(.top)
        .background(Color.black.ignoresSafeArea())
        .task {
            await viewModel.performSearch()
        }
    }
}

