export function Textarea({
  label,
  error,
  id,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-gray-950">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-950 shadow-xs
          outline-none transition-[border-color,box-shadow] duration-150 resize-y min-h-[100px] leading-relaxed
          placeholder:text-gray-400
          focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.25)]
          ${error ? 'border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.2)]' : 'border-gray-200'}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}
