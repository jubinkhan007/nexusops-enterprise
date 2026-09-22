package com.nexusops.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nexusops.model.WorkflowItem
import com.nexusops.viewmodel.DashboardViewModel

@Composable
fun DashboardScreen(viewModel: DashboardViewModel = DashboardViewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1E293B), shape = RoundedCornerShape(12.dp))
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "NexusOps Android",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Jetpack Compose Telemetry Client",
                    color = Color.Gray,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Metrics Row
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            MetricBox(
                title = "Active Workflows",
                value = "${uiState.activeWorkflowsCount}",
                color = Color(0xFF3B82F6),
                modifier = Modifier.weight(1f)
            )
            MetricBox(
                title = "System Health",
                value = "${uiState.systemHealthScore}%",
                color = Color(0xFF10B981),
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Active Workflows",
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (uiState.isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(uiState.workflows) { workflow ->
                    WorkflowCard(workflow = workflow)
                }
            }
        }
    }
}

@Composable
fun MetricBox(title: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .background(Color(0xFF1E293B), shape = RoundedCornerShape(10.dp))
            .padding(14.dp)
    ) {
        Text(text = title, color = Color.Gray, fontSize = 12.sp)
        Text(text = value, color = color, fontSize = 22.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun WorkflowCard(workflow: WorkflowItem) {
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
            Text(text = workflow.name, color = Color.White, fontWeight = FontWeight.SemiBold)
            Text(
                text = workflow.status,
                color = Color(0xFF10B981),
                fontSize = 11.sp,
                modifier = Modifier
                    .background(Color(0xFF10B981).copy(alpha = 0.2f), shape = RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
        Text(text = workflow.description, color = Color.Gray, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
    }
}
