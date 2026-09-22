import Foundation
import Combine

@MainActor
class RealtimeStreamService: ObservableObject {
    static let shared = RealtimeStreamService()

    @Published var isConnected: Bool = false
    @Published var events: [TelemetryEvent] = []
    @Published var unreadCount: Int = 0

    private var webSocketTask: URLSessionWebSocketTask?
    private var simulationTimer: Timer?
    private let serverURL = "ws://localhost:5050/hubs/notifications"

    init() {
        startConnection()
    }

    func startConnection() {
        guard let url = URL(string: serverURL) else {
            startSimulationStream()
            return
        }

        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        isConnected = true

        receiveMessage()
        startSimulationStream()
    }

    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                switch result {
                case .success(let message):
                    switch message {
                    case .string(let text):
                        if let data = text.data(using: .utf8),
                           let event = try? JSONDecoder().decode(TelemetryEvent.self, from: data) {
                            self.addEvent(event)
                        }
                    case .data(let data):
                        if let event = try? JSONDecoder().decode(TelemetryEvent.self, from: data) {
                            self.addEvent(event)
                        }
                    @unknown default:
                        break
                    }
                    self.receiveMessage()
                case .failure:
                    self.isConnected = false
                }
            }
        }
    }

    func addEvent(_ event: TelemetryEvent) {
        events.insert(event, at: 0)
        if events.count > 50 {
            events.removeLast()
        }
        unreadCount += 1
    }

    func clearUnreadCount() {
        unreadCount = 0
    }

    private func startSimulationStream() {
        simulationTimer?.invalidate()
        simulationTimer = Timer.scheduledTimer(withTimeInterval: 4.5, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self = self else { return }
                let sampleEvents: [(String, String, EventSeverity, String)] = [
                    ("FastAPI-AI", "IsolationForest", .info, "Anomaly model evaluated 128 telemetry vectors in 1.4ms."),
                    ("SignalR-Hub", "Notification", .info, "Broadcasted system health metric (99.4%) to 4 active clients."),
                    ("PGVector", "HNSW-Index", .info, "Cosine similarity search executed across 1536-dimensional embeddings."),
                    ("DotNet-Api", "WorkflowExecution", .warning, "Pipeline 'Document Sentiment' retry attempt #1 triggered."),
                    ("FastAPI-AI", "IsolationForest", .critical, "Telemetry threshold anomaly detected on node-us-east-2! Anomaly Score: 0.892.")
                ]

                let sample = sampleEvents.randomElement()!
                let formatter = DateFormatter()
                formatter.dateFormat = "HH:mm:ss"
                let timestamp = formatter.string(from: Date())

                let newEvent = TelemetryEvent(
                    id: UUID().uuidString,
                    timestamp: timestamp,
                    sourceComponent: sample.0,
                    category: sample.1,
                    severity: sample.2,
                    message: sample.3,
                    executionTimeMs: Double.random(in: 0.5...4.2)
                )
                self.addEvent(newEvent)
            }
        }
    }

    deinit {
        simulationTimer?.invalidate()
        webSocketTask?.cancel(with: .goingAway, reason: nil)
    }
}
