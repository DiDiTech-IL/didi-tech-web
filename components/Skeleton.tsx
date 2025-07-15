import { cn } from "@/lib/utils"
import { buttonVariants } from "./ui/button"
import { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        buttonVariants({
          variant: "secondary",
          className: "pointer-events-none animate-pulse w-24",
        }),
        className
      )}
    />
  )
}

export function SkeletonArray({
  amount,
  children,
}: {
  amount: number
  children: ReactNode
}) {
  return Array.from({ length: amount }).map(() => children)
}

export function SkeletonText({
  rows = 1,
  size = "md",
  className,
}: {
  rows?: number
  size?: "md" | "lg"
  className?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <SkeletonArray amount={rows}>
        <div
          className={cn(
            "bg-secondary animate-pulse w-full rounded-sm",
            rows > 1 && "last:w-3/4",
            size === "md" && "h-3",
            size === "lg" && "h-5",
            className
          )}
        />
      </SkeletonArray>
    </div>
  )
}

export function CourseTableSkeleton({
  rows = 10, // Default to showing 10 skeleton rows
  columns = 5, // Default to 5 columns (adjust based on your table structure)
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="space-y-4">
      {/* Skeleton for filtering/controls */}
      <div className="flex items-center py-4">
        <SkeletonText className="h-10 w-64" /> {/* Using SkeletonText for the input */}
        <SkeletonButton className="h-10 w-24 ml-auto" /> {/* Using SkeletonButton for the dropdown */}
      </div>
      {/* Skeleton for the table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Skeleton for table headers */}
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index}><SkeletonText className="h-6 w-full" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Render skeleton rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {/* Skeleton for table cells */}
                {Array.from({ length: columns }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    {/* Use SkeletonText for cell content, adjust size/rows if needed */}
                    <SkeletonText className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Skeleton for pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <SkeletonButton className="h-8 w-20" /> {/* Using SkeletonButton for pagination buttons */}
        <SkeletonButton className="h-8 w-20" />
      </div>
    </div>
  );
}