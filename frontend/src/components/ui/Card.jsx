export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
