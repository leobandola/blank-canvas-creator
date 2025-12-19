"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DollarSign } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function MarkPaidDialog({ paymentId }: { paymentId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleMarkPaid = async () => {
    setIsLoading(true)
    console.log("[v0] Marking payment as paid:", paymentId)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("payments")
        .update({
          status: "paid",
          payment_date: new Date().toISOString(),
        })
        .eq("id", paymentId)

      if (error) {
        console.error("[v0] Error marking payment as paid:", error)
        alert("Erro ao marcar como pago: " + error.message)
      } else {
        console.log("[v0] Payment marked as paid successfully")
        setIsOpen(false)
        router.refresh()
      }
    } catch (err) {
      console.error("[v0] Exception marking payment as paid:", err)
      alert("Erro ao marcar como pago: " + (err instanceof Error ? err.message : "Erro desconhecido"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          <DollarSign className="h-4 w-4 mr-1" />
          Marcar como Pago
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja marcar este pagamento como pago? A data de pagamento será registrada como hoje.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button onClick={handleMarkPaid} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
            {isLoading ? "Marcando..." : "Confirmar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
