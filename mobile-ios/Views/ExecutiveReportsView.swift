import SwiftUI

struct ExecutiveReportsView: View {
    var body: some View {
        ZStack {
            Color(red: 2/255, green: 6/255, blue: 23/255)
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Executive Reports & Audit")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text("SOC 2 Type II & HIPAA Compliance Exporter for NexusOps Enterprise")
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                VStack(alignment: .leading, spacing: 16) {
                    Text("System Audit Summary")
                        .font(.headline)
                        .foregroundColor(.white)

                    HStack {
                        Text("Overall SLA Compliance")
                            .foregroundColor(.gray)
                        Spacer()
                        Text("99.98%")
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                    }

                    HStack {
                        Text("ML Anomaly Resolution Rate")
                            .foregroundColor(.gray)
                        Spacer()
                        Text("100%")
                            .fontWeight(.bold)
                            .foregroundColor(.indigo)
                    }

                    HStack {
                        Text("Vector Store Document Integrity")
                            .foregroundColor(.gray)
                        Spacer()
                        Text("Verified (1536-dim)")
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }

                    Button(action: {}) {
                        Text("Export Audit Report PDF")
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.indigo)
                            .cornerRadius(12)
                    }
                    .padding(.top, 12)
                }
                .padding(20)
                .background(Color(red: 15/255, green: 23/255, blue: 42/255))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(red: 30/255, green: 41/255, blue: 59/255), lineWidth: 1)
                )

                Spacer()
            }
            .padding()
        }
    }
}
