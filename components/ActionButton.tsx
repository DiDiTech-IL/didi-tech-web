"use client"

import { actionToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import { ComponentPropsWithRef, ReactNode, useTransition } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import { Button } from "./ui/button"

export function ActionButton({
  action,
  requireAreYouSure = false,
  ...props
}: Omit<ComponentPropsWithRef<typeof Button>, "onClick"> & {
  action: () => Promise<{ error: boolean; message: string }>
  requireAreYouSure?: boolean
}) {
  {
    const [isLoading, startTransition] = useTransition()
    function performAction() {
      startTransition(async () => {
        const data = await action()
        actionToast({ actionData: data })
      })
    }

    if (requireAreYouSure) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button {...props} />
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                שים לב שייתכן ותצטרך לרענן את הדף בשביל לבצע את הפעולה שוב
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction disabled={isLoading} onClick={performAction}>
                <LoadingTextSwap isLoading={isLoading}>אישור</LoadingTextSwap>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    return (
      <Button {...props} disabled={isLoading} onClick={performAction}>
        <LoadingTextSwap isLoading={isLoading}>
          {props.children}
        </LoadingTextSwap>
      </Button>
    )
  }
}

function LoadingTextSwap({
  isLoading,
  children,
}: {
  isLoading: boolean
  children: ReactNode
}) {
  return (
    <div className="grid items-center justify-items-center">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2",
          isLoading ? "invisible" : "visible"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 text-center",
          isLoading ? "visible" : "invisible"
        )}
      >
        <Loader2Icon className="animate-spin" />
      </div>
    </div>
  )
}