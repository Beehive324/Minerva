"use client"

import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Info } from "lucide-react"

export function useNotification() {
  const { toast } = useToast()

  const showSuccess = (message: string) => {
    toast({
      description: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span>{message}</span>
        </div>
      ),
    })
  }

  const showError = (message: string) => {
    toast({
      description: (
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span>{message}</span>
        </div>
      ),
      variant: "destructive",
    })
  }

  const showInfo = (message: string) => {
    toast({
      description: (
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <span>{message}</span>
        </div>
      ),
    })
  }

  return { showSuccess, showError, showInfo }
}
