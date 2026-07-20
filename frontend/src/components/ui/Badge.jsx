const statusStyles = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Closed: 'bg-gray-100 text-gray-600 border-gray-300',
}

const dotColors = {
  Open: 'bg-blue-600',
  'In Progress': 'bg-amber-600',
  Closed: 'bg-gray-500',
}

export function Badge({ status }) {
  const style = statusStyles[status] || statusStyles.Closed
  const dot = dotColors[status] || dotColors.Closed

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap tracking-wide ${style}`}
    >
      <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  )
}
