import SwiftUI

struct ActivityFeedView: View {
    @StateObject private var streamService = RealtimeStreamService.shared
    @StateObject private var viewModel = ActivityFeedViewModel()

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 16) {
                
                // Live Status Header Banner
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(streamService.isConnected ? Color.green : Color.orange)
                                .frame(width: 10, height: 10)
                            Text(streamService.isConnected ? "LIVE SIGNALR STREAM ACTIVE" : "RECONNECTING TO STREAM...")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .foregroundColor(streamService.isConnected ? .green : .orange)
                        }
                        Text("Real-Time Telemetry & Alerts")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    Spacer()
                    Text("\(streamService.events.count) Events")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.blue.opacity(0.2))
                        .foregroundColor(.blue)
                        .cornerRadius(8)
                }
                .padding()
                .background(Color(white: 0.12))
                .cornerRadius(14)
                .padding(.horizontal)

                // Search Filter & Severity Picker
                VStack(spacing: 12) {
                    TextField("Filter stream by component or keyword...", text: $viewModel.searchQuery)
                        .padding(10)
                        .background(Color(white: 0.14))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                        .onChange(of: viewModel.searchQuery) { _ in
                            viewModel.filterEvents()
                        }

                    Picker("Severity", selection: $viewModel.selectedSeverityFilter) {
                        ForEach(ActivityFeedViewModel.EventSeverityFilter.allCases) { filter in
                            Text(filter.rawValue).tag(filter)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .onChange(of: viewModel.selectedSeverityFilter) { _ in
                        viewModel.filterEvents()
                    }
                }
                .padding(.horizontal)

                // Event List
                if viewModel.filteredEvents.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "bolt.horizontal.circle")
                            .font(.system(size: 40))
                            .foregroundColor(.gray)
                        Text("Listening for live stream events...")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 10) {
                            ForEach(viewModel.filteredEvents) { event in
                                TelemetryEventRow(event: event)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .padding(.top)
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Live Activity Feed")
            .navigationBarHidden(true)
            .onAppear {
                viewModel.markRead()
                viewModel.filterEvents()
            }
        }
    }
}

struct TelemetryEventRow: View {
    let event: TelemetryEvent

    var severityColor: Color {
        switch event.severity {
        case .info: return .blue
        case .warning: return .orange
        case .critical: return .red
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(event.sourceComponent)
                    .font(.caption2)
                    .fontWeight(.bold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.1))
                    .foregroundColor(.white)
                    .cornerRadius(4)

                Text(event.category)
                    .font(.caption2)
                    .foregroundColor(.gray)

                Spacer()

                Text(event.severity.rawValue.uppercased())
                    .font(.caption2)
                    .fontWeight(.extrabold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(severityColor.opacity(0.2))
                    .foregroundColor(severityColor)
                    .cornerRadius(4)

                Text(event.timestamp)
                    .font(.caption2)
                    .foregroundColor(.gray)
            }

            Text(event.message)
                .font(.subheadline)
                .foregroundColor(.white)
                .lineSpacing(3)

            if let ms = event.executionTimeMs {
                HStack {
                    Spacer()
                    Text(String(format: "Latency: %.2f ms", ms))
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }
        }
        .padding(12)
        .background(Color(white: 0.08))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(severityColor.opacity(0.3), lineWidth: 1)
        )
    }
}
