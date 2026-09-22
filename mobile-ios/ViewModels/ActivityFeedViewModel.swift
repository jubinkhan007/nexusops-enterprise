import Foundation
import Combine

@MainActor
class ActivityFeedViewModel: ObservableObject {
    @Published var selectedSeverityFilter: EventSeverityFilter = .all
    @Published var searchQuery: String = ""

    private var streamService = RealtimeStreamService.shared
    private var cancellables = Set<AnyCancellable>()

    @Published var filteredEvents: [TelemetryEvent] = []

    enum EventSeverityFilter: String, CaseIterable, Identifiable {
        case all = "All"
        case info = "Info"
        case warning = "Warning"
        case critical = "Critical"

        var id: String { rawValue }
    }

    init() {
        streamService.$events
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in
                self?.filterEvents()
            }
            .store(in: &cancellables)
    }

    func filterEvents() {
        var result = streamService.events

        if selectedSeverityFilter != .all {
            result = result.filter { $0.severity.rawValue == selectedSeverityFilter.rawValue }
        }

        if !searchQuery.trimmingCharacters(in: .whitespaces).isEmpty {
            let query = searchQuery.lowercased()
            result = result.filter {
                $0.message.lowercased().contains(query) ||
                $0.sourceComponent.lowercased().contains(query) ||
                $0.category.lowercased().contains(query)
            }
        }

        self.filteredEvents = result
    }

    func markRead() {
        streamService.clearUnreadCount()
    }
}
