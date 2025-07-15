"use client"

import type React from "react"

import { ArrowRight } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShineButtonProps extends ButtonProps {
  iconPosition?: "left" | "right"
  showIconOnHover?: boolean
  icon?: React.ReactNode
}

export function ShineButton({
  children,
  className,
  iconPosition = "right",
  showIconOnHover = true,
  icon = <ArrowRight className="size-4" />,
  ...props
}: ShineButtonProps) {
  return (
    <Button className={cn("group relative overflow-hidden transition-all duration-500", className)} {...props}>
      {/* Shine effect */}
      <span className="absolute inset-0 z-0 translate-x-[-100%] transform bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-transform duration-[800ms] ease-in-out group-hover:translate-x-[100%] group-hover:opacity-100" />

      {/* Button content with conditional icon */}
      <span className="relative z-10 flex items-center">
        {iconPosition === "left" && showIconOnHover && (
          <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-6 group-hover:ml-2">
            {icon}
          </span>
        )}

        {iconPosition === "left" && !showIconOnHover && <span className="ml-2">{icon}</span>}

        <span>{children}</span>

        {iconPosition === "right" && showIconOnHover && (
          <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-6 group-hover:mr-2">
            {icon}
          </span>
        )}

        {iconPosition === "right" && !showIconOnHover && <span className="mr-2">{icon}</span>}
      </span>
    </Button>
  )
}
