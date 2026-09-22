package com.nexusops.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusops.data.NexusRepository
import com.nexusops.model.WorkflowItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardUiState(
    val workflows: List<WorkflowItem> = emptyList(),
    val isLoading: Boolean = false,
    val systemHealthScore: Double = 99.4,
    val activeWorkflowsCount: Int = 14
)

class DashboardViewModel(private val repository: NexusRepository = NexusRepository()) : ViewModel() {
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val workflows = repository.getWorkflows()
            _uiState.value = _uiState.value.copy(
                workflows = workflows,
                isLoading = false
            )
        }
    }
}
