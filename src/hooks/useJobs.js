
import { useState, useEffect } from 'react'

const useJobs = (query = 'React Developer') => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': '95fad8dd19mshfab31dbe0960749p1c436djsn9399bef73fb9',
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        })
        const data = await response.json()
        setJobs(data.data || [])
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [query])

  return { jobs, loading, error }
}

export default useJobs
