import SwiftUI

struct EnterpriseOpsView: View {
    @StateObject private var viewModel = EnterpriseOpsViewModelIOS()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Header Subtitle
                    Text("Multi-Region HA, FinOps, Canary Rollouts & SOC 2 Compliance")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .padding(.horizontal)

                    // 1. Multi-Region HA Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("🌐 Multi-Region Active-Active")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Text("RPO < 1s")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.green.opacity(0.2))
                                .foregroundColor(.green)
                                .cornerRadius(8)
                        }

                        Text("Primary Leader: \(viewModel.summary.multiRegion.primaryRegion) | Failover: \(viewModel.summary.multiRegion.secondaryRegion)")
                            .font(.subheadline)
                            .foregroundColor(.gray)

                        Text("Replication Lag: \(String(format: "%.1f", viewModel.summary.multiRegion.replicationLagMs)) ms | Route53: \(viewModel.summary.multiRegion.route53Health)")
                            .font(.system(.caption, design: .monospaced))
                            .foregroundColor(.cyan)
                    }
                    .padding()
                    .background(Color(white: 0.12))
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    .padding(.horizontal)

                    // 2. FinOps Cost Optimization Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("💰 FinOps Cost Optimization")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Text("\(String(format: "%.1f", viewModel.summary.finOps.potentialSavingsPercentage))% Saved")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.teal.opacity(0.2))
                                .foregroundColor(.teal)
                                .cornerRadius(8)
                        }

                        Text("Optimized Spend: $9,100 / mo (Saved $\(Int(viewModel.summary.finOps.potentialSavingsUsd))/mo)")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.green)

                        Text("Unattached EBS Volumes Pruned: \(viewModel.summary.finOps.unattachedVolumesFound)")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(Color(white: 0.12))
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    .padding(.horizontal)

                    // 3. Argo Canary Rollouts Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("🐥 Canary Progressive Delivery")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Text("Step 2 (25%)")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.purple.opacity(0.2))
                                .foregroundColor(.purple)
                                .cornerRadius(8)
                        }

                        Text("Rollout: \(viewModel.summary.canary.rolloutName) (\(viewModel.summary.canary.canaryVersion))")
                            .font(.subheadline)
                            .foregroundColor(.white)

                        Text("Traffic Split: \(viewModel.summary.canary.stablePercentage)% Stable / \(viewModel.summary.canary.canaryPercentage)% Canary | Prometheus: \(viewModel.summary.canary.prometheusAnalysis)")
                            .font(.system(.caption, design: .monospaced))
                            .foregroundColor(.purple)
                    }
                    .padding()
                    .background(Color(white: 0.12))
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    .padding(.horizontal)

                    // 4. Incident War Room Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("🚨 Incident War Room & PagerDuty")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Text(viewModel.summary.activeIncident.severity)
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.red.opacity(0.2))
                                .foregroundColor(.red)
                                .cornerRadius(8)
                        }

                        Text("\(viewModel.summary.activeIncident.incidentId): \(viewModel.summary.activeIncident.title)")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)

                        Text("On-Call: \(viewModel.summary.activeIncident.onCallEngineer) | MTTR: \(String(format: "%.1f", viewModel.summary.activeIncident.mttrMinutes)) min")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(Color(white: 0.12))
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    .padding(.horizontal)

                    // 5. SOC 2 Compliance Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("🛡️ SOC 2 & ISO 27001 Compliance")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Text("\(String(format: "%.1f", viewModel.summary.compliance.overallScorePercentage))% Score")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.green.opacity(0.2))
                                .foregroundColor(.green)
                                .cornerRadius(8)
                        }

                        Text(viewModel.summary.compliance.auditStatus)
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.green)

                        Text("Secret Leaks: 0 | Verified Controls: 5/5 | Frameworks: SOC 2, ISO 27001, HIPAA")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(Color(white: 0.12))
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Enterprise Ops & Security")
        }
    }
}
