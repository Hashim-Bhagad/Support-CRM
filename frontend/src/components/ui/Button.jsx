const variants = {
  primary:
    'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-700 shadow-xs',
  secondary:
    'bg-white text-gray-950 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 shadow-xs',
  ghost:
    'bg-transparent text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-950',
}

const sizes = {
  sm: 'h-[30px] px-3 text-xs',
  md: 'h-[34px] px-3.5 text-[13px]',
  lg: 'h-[38px] px-5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-lg border cursor-pointer
        transition-all duration-150 select-none
        active:translate-y-px active:scale-[0.985]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
