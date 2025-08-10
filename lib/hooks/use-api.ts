"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()

      if (response.success) {
        setState({
          data: response.data || response,
          loading: false,
          error: null,
        })
        return response
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || "Unknown error occurred",
        })
        return response
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Specific hooks for common operations
export function usePersonaGeneration() {
  const { execute, ...state } = useApi()

  const generatePersonas = useCallback(
    (data: Parameters<typeof apiClient.generatePersonas>[0]) => {
      return execute(() => apiClient.generatePersonas(data))
    },
    [execute],
  )

  return {
    ...state,
    generatePersonas,
  }
}

export function usePersonaChat() {
  const { execute, ...state } = useApi()

  const sendMessage = useCallback(
    (data: Parameters<typeof apiClient.chatWithPersona>[0]) => {
      return execute(() => apiClient.chatWithPersona(data))
    },
    [execute],
  )

  return {
    ...state,
    sendMessage,
  }
}

export function usePersonaRefinement() {
  const { execute, ...state } = useApi()

  const refinePersonas = useCallback(
    (data: Parameters<typeof apiClient.refinePersonas>[0]) => {
      return execute(() => apiClient.refinePersonas(data))
    },
    [execute],
  )

  return {
    ...state,
    refinePersonas,
  }
}

export function useTrends() {
  const { execute, ...state } = useApi()

  const getTrends = useCallback(
    (params?: Parameters<typeof apiClient.getTrends>[0]) => {
      return execute(() => apiClient.getTrends(params))
    },
    [execute],
  )

  return {
    ...state,
    getTrends,
  }
}
