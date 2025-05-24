import { useState, useEffect } from 'react'

// Credenciales de la API
const API_CREDENTIALS = {
  key: '95fad8dd19mshfab31dbe0960749p1c436djsn9399bef73fb9',
  host: 'jsearch.p.rapidapi.com'
};

const BASE_URL = 'https://jsearch.p.rapidapi.com/search';

const useJobs = (initialQuery = '', page = 1, filters = {}) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)
  const [currentQuery, setCurrentQuery] = useState(initialQuery)

  const fetchJobs = async (searchQuery = currentQuery, pageNumber = page) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setError('Por favor ingresa un término de búsqueda')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      // Construir los parámetros de búsqueda
      const searchParams = new URLSearchParams({
        query: searchQuery.trim(),
        page: pageNumber.toString(),
        num_pages: '1',
        ...filters
      })

      const response = await fetch(`${BASE_URL}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CREDENTIALS.key,
          'X-RapidAPI-Host': API_CREDENTIALS.host
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Error en la búsqueda: ${response.status}`)
      }

      if (!data || !Array.isArray(data.data)) {
        throw new Error('No se encontraron resultados')
      }

      // Actualizar los trabajos según la página
      if (pageNumber === 1) {
        setJobs(data.data)
      } else {
        setJobs(prevJobs => [...prevJobs, ...data.data])
      }

      setTotalJobs(data.total || 0)
      setHasMore(data.data.length > 0)
      setCurrentQuery(searchQuery)
    } catch (err) {
      setError(err.message || 'Error al buscar empleos. Por favor intenta de nuevo.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar trabajos iniciales
  useEffect(() => {
    if (initialQuery) {
      fetchJobs(initialQuery, 1)
    } else {
      setLoading(false)
    }
  }, [initialQuery])

  const searchJobs = (query) => {
    fetchJobs(query, 1)
  }

  const loadMoreJobs = () => {
    if (!loading && hasMore) {
      fetchJobs(currentQuery, Math.ceil(jobs.length / 10) + 1)
    }
  }

  return {
    jobs,
    loading,
    error,
    hasMore,
    totalJobs,
    searchJobs,
    loadMoreJobs
  }
}

export default useJobs
