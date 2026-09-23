import SwiftUI

struct WorkflowsView: View {
    @State private var workflows: [WorkflowItem] = [
        WorkflowItem(id: "wf-101", name: "Document Sentiment Pipeline", description: "Triggers AI microservice upon document upload", triggerEvent: "DocumentUploaded", actionType: "RunFastApiInference", status: "Active", totalExecutions: 142),
        WorkflowItem(id: "wf-102", name: "Anomaly Detection Alerting", description: "Evaluates telemetry against ML model", triggerEvent: "TelemetryReceived", actionType: "DispatchSignalRAlert", status: "Active", totalExecutions: 89),
        WorkflowItem(id: "wf-103", name: "PostgreSQL pgvector Embedding Sync", description: "Synchronizes 1536-dim vector embeddings with pgvector HNSW index", triggerEvent: "VectorSyncRequested", actionType: "ReindexHnswVectorStore", status: "Active", totalExecutions: 64)
    ]
    
    @State private var showingCreateModal = false
    @State private var newName = ""
    @State private var newTrigger = ""

    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 2/255, green: 6/255, blue: 23/255)
                    .ignoresSafeArea()
                
                VStack(alignment: .leading, spacing: 16) {
                    HeaderSection()

                    List(workflows) { item in
                        WorkflowRow(item: item)
                            .listRowBackground(Color(red: 15/255, green: 23/255, blue: 42/255))
                            .listRowInsets(EdgeInsets(top: 8, leading: 0, bottom: 8, trailing: 0))
                    }
                    .listStyle(.plain)
                }
                .padding()
            }
            .navigationTitle("Workflows")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateModal = true }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(.indigo)
                    }
                }
            }
            .sheet(isPresented: $showingCreateModal) {
                CreateWorkflowModalView(workflows: $workflows, isPresented: $showingCreateModal)
            }
        }
    }
}

struct HeaderSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Automation Workflows")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            Text("Event-driven trigger rules across .NET Core & FastAPI AI Engine")
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
}

struct WorkflowRow: View {
    let item: WorkflowItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(item.name)
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
                Text(item.status)
                    .font(.caption)
                    .fontWeight(.bold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.15))
                    .foregroundColor(.green)
                    .cornerRadius(6)
            }

            Text(item.description)
                .font(.subview)
                .foregroundColor(.gray)

            HStack {
                Text("Trigger: \(item.triggerEvent)")
                    .font(.caption)
                    .foregroundColor(.indigo)
                Spacer()
                Text("\(item.totalExecutions) Executions")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color(red: 15/255, green: 23/255, blue: 42/255))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(red: 30/255, green: 41/255, blue: 59/255), lineWidth: 1)
        )
    }
}

struct CreateWorkflowModalView: View {
    @Binding var workflows: [WorkflowItem]
    @Binding var isPresented: Bool
    @State private var name = ""
    @State private var trigger = ""

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Workflow Details")) {
                    TextField("Workflow Name", text: $name)
                    TextField("Trigger Event (e.g. TelemetryReceived)", text: $trigger)
                }
            }
            .navigationTitle("Create Workflow")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if !name.isEmpty {
                            workflows.insert(
                                WorkflowItem(
                                    id: "wf-\(UUID().uuidString.prefix(6))",
                                    name: name,
                                    description: "Created via iOS Mobile App",
                                    triggerEvent: trigger.isEmpty ? "CustomTrigger" : trigger,
                                    actionType: "DispatchAlert",
                                    status: "Active",
                                    totalExecutions: 0
                                ),
                                at: 0
                            )
                            isPresented = false
                        }
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isPresented = false }
                }
            }
        }
    }
}
