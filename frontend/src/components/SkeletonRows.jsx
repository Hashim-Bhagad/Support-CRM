import { Skeleton } from './ui/Skeleton'

export function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="border-b border-gray-200 last:border-b-0">
      <td className="px-4 py-[15px]"><Skeleton className="h-3.5 w-[60px]" /></td>
      <td className="px-4 py-[15px]"><Skeleton className="h-3.5 w-[130px]" /></td>
      <td className="px-4 py-[15px]"><Skeleton className="h-3.5 w-[240px]" /></td>
      <td className="px-4 py-[15px]"><Skeleton className="h-5 w-[80px] rounded-full" /></td>
      <td className="px-4 py-[15px]"><Skeleton className="h-3.5 w-[90px]" /></td>
    </tr>
  ))
}
