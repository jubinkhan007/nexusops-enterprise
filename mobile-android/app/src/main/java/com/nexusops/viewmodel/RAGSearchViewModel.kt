package com.nexusops.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusops.data.NexusRepository
import com.nexusops.model.RAGResponseItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RAGUiState(
    val query: String = "What is the SignalR reconnect timing?",
    val ragResponse: RAGResponseItem? = null,
    val isLoading: Boolean = false,
    val isIndexing: Boolean = false,
    val attachedFileName: String? = null,
    val attachedContent: String? = null,
    val uploadMessage: String? = null
)

class RAGSearchViewModel(private val repository: NexusRepository = NexusRepository()) : ViewModel() {
    private val _uiState = MutableStateFlow(RAGUiState())
    val uiState: StateFlow<RAGUiState> = _uiState.asStateFlow()

    init {
        performSearch(_uiState.value.query)
    }

    fun updateQuery(newQuery: String) {
        _uiState.value = _uiState.value.copy(query = newQuery)
    }

    fun attachSampleDocument(fileName: String, content: String) {
        _uiState.value = _uiState.value.copy(
            attachedFileName = fileName,
            attachedContent = content,
            uploadMessage = "Attached '$fileName' (${content.length} bytes). Ready for vector indexing."
        )
    }

    fun removeAttachment() {
        _uiState.value = _uiState.value.copy(
            attachedFileName = null,
            attachedContent = null,
            uploadMessage = null
        )
    }

    fun performSearch(queryToSearch: String = _uiState.value.query) {
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState.attachedFileName != null && currentState.attachedContent != null) {
                _uiState.value = _uiState.value.copy(isIndexing = true)
                val uploadResult = repository.uploadDocumentAndIndex(
                    currentState.attachedFileName,
                    currentState.attachedContent.toByteArray()
                )
                _uiState.value = _uiState.value.copy(
                    isIndexing = false,
                    uploadMessage = "Indexed '${uploadResult.filename}': ${uploadResult.chunks_created} chunks, ${uploadResult.vector_dimension}-dim"
                )
            }

            _uiState.value = _uiState.value.copy(isLoading = true)
            val result = repository.askGeminiRAG(queryToSearch)
            _uiState.value = _uiState.value.copy(
                ragResponse = result,
                isLoading = false
            )
        }
    }
}

