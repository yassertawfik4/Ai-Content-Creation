import { useEffect, useState } from 'react'

export function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) return undefined
    const timer = setInterval(() => setSeconds((current) => current - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  return {
    seconds,
    isRunning: seconds > 0,
    restart(seconds) {
      setSeconds(seconds)
    },
  }
}