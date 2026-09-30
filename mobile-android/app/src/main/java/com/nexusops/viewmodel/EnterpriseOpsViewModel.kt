package com.nexusops.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusops.data.NexusRepository
import com.nexusops.model.EnterpriseOpsSummary
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class EnterpriseOpsViewModel(private val repository: NexusRepository = NexusRepository()) : ViewModel() {
    private val _opsState = MutableStateFlow(EnterpriseOpsSummary())
    val opsState: StateFlow<EnterpriseOpsSummary> = _opsState.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    init {
        loadOpsSummary()
    }

    fun loadOpsSummary() {
        viewModelScope.launch {
            _isRefreshing.value = true
            _opsState.value = repository.getEnterpriseOpsSummary()
            _isRefreshing.value = false
        }
    }
}
