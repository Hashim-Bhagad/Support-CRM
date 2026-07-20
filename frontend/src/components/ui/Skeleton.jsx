export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-shimmer rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:600px_100%] ${className}`}
    />
  )
}
