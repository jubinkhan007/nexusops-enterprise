import Foundation
import Combine

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var workflows: [WorkflowItem] = []
    @Published var isLoading: Bool = false
    @Published var systemHealthScore: Double = 99.4
    @Published var activeWorkflowsCount: Int = 14

    func loadDashboardData() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            self.workflows = try await NetworkService.shared.fetchWorkflows()
        } catch {
            print("Error loading dashboard data: \(error)")
        }
    }
}
