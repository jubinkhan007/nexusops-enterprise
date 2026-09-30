import Foundation
import Combine

@MainActor
class EnterpriseOpsViewModelIOS: ObservableObject {
    @Published var summary = EnterpriseOpsSummaryIOS()
    @Published var isLoading = false

    init() {
        fetchSummary()
    }

    func fetchSummary() {
        isLoading = true
        Task {
            self.summary = await NetworkService.shared.fetchEnterpriseOpsSummary()
            self.isLoading = false
        }
    }
}
