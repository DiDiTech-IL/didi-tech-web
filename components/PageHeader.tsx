import { ReactNode } from "react"
import Icon from "./Icon"

export function PageHeader({
  title,
  icon,
}: {
  title: string
  badge?: string
  icon: string
  children?: ReactNode
  className?: string
}) {

  return (
    <div className="flex items-center gap-4">
      <Icon name={icon} className="w-10 h-10 mr-2" />
      <h1 className="font-semibold text-2xl">{title}</h1>
    </div>
  )


}