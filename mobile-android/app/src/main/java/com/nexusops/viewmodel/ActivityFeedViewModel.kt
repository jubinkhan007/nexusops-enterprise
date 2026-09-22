package com.nexusops.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusops.data.RealtimeStreamService
import com.nexusops.model.EventSeverity
import com.nexusops.model.TelemetryEvent
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ActivityFeedUiState(
    val events: List<TelemetryEvent> = emptyList(),
    val filteredEvents: List<TelemetryEvent> = emptyList(),
    val selectedSeverity: String = "All",
    val searchQuery: String = "",
    val isConnected: Boolean = true
)

class ActivityFeedViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ActivityFeedUiState())
    val uiState: StateFlow<ActivityFeedUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            RealtimeStreamService.events.collect { newEvents ->
                _uiState.value = _uiState.value.copy(events = newEvents)
                filterEvents()
            }
        }
        viewModelScope.launch {
            RealtimeStreamService.isConnected.collect { connected ->
                _uiState.value = _uiState.value.copy(isConnected = connected)
            }
        }
    }

    fun updateSeverityFilter(severity: String) {
        _uiState.value = _uiState.value.copy(selectedSeverity = severity)
        filterEvents()
    }

    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        filterEvents()
    }

    fun markRead() {
        RealtimeStreamService.clearUnreadCount()
    }

    private fun filterEvents() {
        var list = _uiState.value.events

        if (_uiState.value.selectedSeverity != "All") {
            list = list.filter { it.severity.label.equals(_uiState.value.selectedSeverity, ignoreCase = true) }
        }

        if (_uiState.value.searchQuery.isNotBlank()) {
            val q = _uiState.value.searchQuery.lowercase()
            list = list.filter {
                it.message.lowercase().contains(q) ||
                it.sourceComponent.lowercase().contains(q) ||
                it.category.lowercase().contains(q)
            }
        }

        _uiState.value = _uiState.value.copy(filteredEvents = list)
    }
}
