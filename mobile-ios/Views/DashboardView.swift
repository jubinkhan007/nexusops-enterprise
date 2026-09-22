import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    
                    // Header Banner
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("NexusOps Mobile")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Text("Enterprise Telemetry & AI")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Circle()
                            .fill(Color.green)
                            .frame(width: 10, height: 10)
                    }
                    .padding()
                    .background(Color(white: 0.1))
                    .cornerRadius(16)

                    // Stats Cards Grid
                    HStack(spacing: 16) {
                        MetricCard(title: "Active Workflows", value: "\(viewModel.activeWorkflowsCount)", color: .blue)
                        MetricCard(title: "System Health", value: "\(viewModel.systemHealthScore)%", color: .green)
                    }

                    // Active Workflows List Section
                    Text("Automated Workflows")
                        .font(.headline)
                        .padding(.top, 10)

                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, alignment: .center)
                    } else {
                        ForEach(viewModel.workflows) { workflow in
                            WorkflowRowView(workflow: workflow)
                        }
                    }
                }
                .padding()
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Dashboard")
            .navigationBarHidden(true)
            .task {
                await viewModel.loadDashboardData()
            }
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
            Text(value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(white: 0.12))
        .cornerRadius(12)
    }
}

struct WorkflowRowView: View {
    let workflow: WorkflowItem

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(workflow.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                Spacer()
                Text(workflow.status)
                    .font(.caption2)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.2))
                    .foregroundColor(.green)
                    .cornerRadius(6)
            }
            Text(workflow.description)
                .font(.caption)
                .foregroundColor(.gray)
                .lineLimit(2)
        }
        .padding()
        .background(Color(white: 0.08))
        .cornerRadius(12)
    }
}
