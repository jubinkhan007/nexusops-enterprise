package com.nexusops.data

import com.nexusops.model.EventSeverity
import com.nexusops.model.TelemetryEvent
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*
import kotlin.random.Random

object RealtimeStreamService {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    private val _isConnected = MutableStateFlow(true)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _events = MutableStateFlow<List<TelemetryEvent>>(emptyList())
    val events: StateFlow<List<TelemetryEvent>> = _events.asStateFlow()

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    private var simulationJob: Job? = null

    init {
        startSimulationStream()
    }

    private fun startSimulationStream() {
        simulationJob?.cancel()
        simulationJob = scope.launch {
            val sampleEvents = listOf(
                Quadruple("FastAPI-AI", "IsolationForest", EventSeverity.INFO, "Anomaly model evaluated 128 telemetry vectors in 1.4ms."),
                Quadruple("SignalR-Hub", "Notification", EventSeverity.INFO, "Broadcasted system health metric (99.4%) to 4 active clients."),
                Quadruple("PGVector", "HNSW-Index", EventSeverity.INFO, "Cosine similarity search executed across 1536-dimensional embeddings."),
                Quadruple("DotNet-Api", "WorkflowExecution", EventSeverity.WARNING, "Pipeline 'Document Sentiment' retry attempt #1 triggered."),
                Quadruple("FastAPI-AI", "IsolationForest", EventSeverity.CRITICAL, "Telemetry threshold anomaly detected on node-us-east-2! Anomaly Score: 0.892.")
            )

            val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())

            while (isActive) {
                delay(4500)
                val sample = sampleEvents.random()
                val timestamp = sdf.format(Date())

                val newEvent = TelemetryEvent(
                    id = UUID.randomUUID().toString(),
                    timestamp = timestamp,
                    sourceComponent = sample.first,
                    category = sample.second,
                    severity = sample.third,
                    message = sample.fourth,
                    executionTimeMs = Random.nextDouble(0.5, 4.2)
                )

                val currentList = _events.value.toMutableList()
                currentList.add(0, newEvent)
                if (currentList.size > 50) {
                    currentList.removeAt(currentList.size - 1)
                }

                _events.value = currentList
                _unreadCount.value += 1
            }
        }
    }

    fun clearUnreadCount() {
        _unreadCount.value = 0
    }

    private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
}
