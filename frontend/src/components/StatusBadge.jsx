import { Badge } from './ui/Badge'

/**
 * StatusBadge — renders a colored pill for Open / In Progress / Closed
 */
export function StatusBadge({ status }) {
  return <Badge status={status} />
}
