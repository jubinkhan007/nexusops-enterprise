package com.nexusops.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nexusops.model.RAGMatchItem
import com.nexusops.viewmodel.RAGSearchViewModel

@Composable
fun RAGSearchScreen(viewModel: RAGSearchViewModel = RAGSearchViewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
    ) {
        Text(
            text = "Gemini RAG Vector Search",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "1536-Dimensional pgvector HNSW Engine & Multi-Modal Document Upload",
            color = Color.Gray,
            fontSize = 11.sp,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // Attachment Section
        Column(modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
            Text(
                text = "Attach Context Document (PDF / JSON / Text)",
                color = Color.Gray,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))

            if (uiState.attachedFileName != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF3B82F6).copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp))
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = uiState.attachedFileName ?: "",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = { viewModel.removeAttachment() }) {
                        Text("Remove", color = Color(0xFFEF4444), fontSize = 11.sp)
                    }
                }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            viewModel.attachSampleDocument(
                                "Anomaly_Runbook_v2.pdf",
                                "IsolationForest threshold settings: set contamination score = 0.05. When anomaly score > 0.85, auto-trigger ASP.NET Webhook and SignalR alert."
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("+ Anomaly PDF", color = Color(0xFF818CF8), fontSize = 11.sp)
                    }

                    Button(
                        onClick = {
                            viewModel.attachSampleDocument(
                                "Telemetry_Schema.json",
                                "{ 'event_type': 'TelemetryReceived', 'latency_ms': 42.1, 'vector_dim': 1536, 'index': 'hnsw_cosine' }"
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("+ Telemetry JSON", color = Color(0xFF818CF8), fontSize = 11.sp)
                    }
                }
            }

            uiState.uploadMessage?.let { status ->
                Text(
                    text = status,
                    color = Color(0xFF10B981),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        // Query Bar & Search Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = uiState.query,
                onValueChange = { viewModel.updateQuery(it) },
                placeholder = { Text("Ask natural language query...", color = Color.Gray) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF3B82F6),
                    unfocusedBorderColor = Color(0xFF334155)
                ),
                modifier = Modifier.weight(1f)
            )

            Button(
                onClick = { viewModel.performSearch() },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(if (uiState.isLoading || uiState.isIndexing) "..." else "Search")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (uiState.isLoading || uiState.isIndexing) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (uiState.isIndexing) "Vectorizing & Indexing Document in pgvector..." else "Running Gemini RAG Cosine Retrieval...",
                    color = Color.Gray,
                    fontSize = 12.sp
                )
            }
        } else {
            uiState.ragResponse?.let { response ->
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        // AI Synthesis Banner
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF1E1B4B), shape = RoundedCornerShape(10.dp))
                                .padding(14.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "GEMINI AI SYNTHESIS",
                                    color = Color(0xFF818CF8),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "1536-dim Embeddings",
                                    color = Color.Gray,
                                    fontSize = 10.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = response.ai_synthesis,
                                color = Color.White,
                                fontSize = 13.sp
                            )
                        }
                    }

                    item {
                        Text(
                            text = "PostgreSQL Vector Matches (${response.top_matches.size})",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    items(response.top_matches) { match ->
                        RAGMatchCard(match = match)
                    }
                }
            }
        }
    }
}

@Composable
fun RAGMatchCard(match: RAGMatchItem) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF182234), shape = RoundedCornerShape(8.dp))
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = match.title, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Text(
                text = "${match.match_percentage}% Match",
                color = Color(0xFF10B981),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .background(Color(0xFF10B981).copy(alpha = 0.2f), shape = RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = match.category, color = Color.Gray, fontSize = 10.sp)
            Text(text = "Relevance: ${match.relevance_score}", color = Color.Gray, fontSize = 10.sp)
        }
        Text(text = match.snippet, color = Color.Gray, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
    }
}

