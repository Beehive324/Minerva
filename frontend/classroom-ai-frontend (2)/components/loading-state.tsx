import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message: string
  submessage?: string
}

export function LoadingState({ message, submessage }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/20" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{message}</p>
        {submessage && <p className="text-sm text-muted-foreground">{submessage}</p>}
      </div>
    </div>
  )
}
