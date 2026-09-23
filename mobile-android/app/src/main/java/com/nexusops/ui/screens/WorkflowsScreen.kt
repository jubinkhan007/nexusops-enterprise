package com.nexusops.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nexusops.model.WorkflowItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkflowsScreen() {
    var workflows by remember {
        mutableStateOf(
            listOf(
                WorkflowItem(
                    id = "wf-101",
                    name = "Document Sentiment & Classification Pipeline",
                    description = "Triggers AI microservice upon document upload to compute embeddings & sentiment",
                    triggerEvent = "DocumentUploaded",
                    actionType = "RunFastApiInference",
                    status = "Active",
                    totalExecutions = 142
                ),
                WorkflowItem(
                    id = "wf-102",
                    name = "Anomaly Detection Alerting Workflow",
                    description = "Evaluates execution telemetry against ML model to flag system anomalies",
                    triggerEvent = "TelemetryReceived",
                    actionType = "DispatchSignalRAlert",
                    status = "Active",
                    totalExecutions = 89
                ),
                WorkflowItem(
                    id = "wf-103",
                    name = "PostgreSQL pgvector Embedding Sync",
                    description = "Synchronizes 1536-dim vector embeddings with pgvector HNSW index",
                    triggerEvent = "VectorSyncRequested",
                    actionType = "ReindexHnswVectorStore",
                    status = "Active",
                    totalExecutions = 64
                )
            )
        )
    }

    var showCreateDialog by remember { mutableStateOf(false) }
    var newWfName by remember { mutableStateOf("") }
    var newWfTrigger by remember { mutableStateOf("") }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateDialog = true },
                containerColor = Color(0xFF6366F1),
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create Workflow")
            }
        },
        containerColor = Color(0xFF020617)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                text = "Automation Workflows",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Manage event-driven workflow rules across .NET Core & FastAPI AI Engine",
                fontSize = 12.sp,
                color = Color(0xFF94A3B8),
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(workflows) { item ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(16.dp))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = item.name,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier.weight(1f)
                                )
                                Surface(
                                    color = Color(0xFF10B981).copy(alpha = 0.15f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = item.status,
                                        color = Color(0xFF10B981),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = item.description ?: "",
                                fontSize = 13.sp,
                                color = Color(0xFF94A3B8)
                            )

                            Spacer(modifier = Modifier.height(12.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Trigger: ${item.triggerEvent}",
                                    fontSize = 11.sp,
                                    color = Color(0xFF818CF8),
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "${item.totalExecutions} Executions",
                                    fontSize = 11.sp,
                                    color = Color(0xFF64748B)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text("Create New Workflow", color = Color.White) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newWfName,
                        onValueChange = { newWfName = it },
                        label = { Text("Workflow Name") }
                    )
                    OutlinedTextField(
                        value = newWfTrigger,
                        onValueChange = { newWfTrigger = it },
                        label = { Text("Trigger Event (e.g. TelemetryReceived)") }
                    )
                }
            },
            confirmButton = {
                Button(onClick = {
                    if (newWfName.isNotBlank()) {
                        workflows = workflows + WorkflowItem(
                            id = "wf-${System.currentTimeMillis()}",
                            name = newWfName,
                            description = "User created workflow via Android Client",
                            triggerEvent = if (newWfTrigger.isBlank()) "CustomTrigger" else newWfTrigger,
                            actionType = "DispatchAlert",
                            status = "Active",
                            totalExecutions = 0
                        )
                        newWfName = ""
                        newWfTrigger = ""
                        showCreateDialog = false
                    }
                }) {
                    Text("Create")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) {
                    Text("Cancel")
                }
            },
            containerColor = Color(0xFF0F172A)
        )
    }
}
