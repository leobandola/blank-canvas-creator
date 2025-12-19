"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function UpdatePaymentsValueButton({ roundId, betValue }: { roundId: string; betValue: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async () => {
    if (!confirm(`Deseja atualizar o valor de TODAS as apostas desta rodada para R$ ${betValue.toFixed(2)}?`)) {
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Updating all payment amounts to:", betValue)

      // Buscar todas as apostas da rodada
      const { data: bets, error: betsError } = await supabase.from("bets").select("id").eq("round_id", roundId)

      if (betsError) {
        console.error("[v0] Error fetching bets:", betsError)
        alert("Erro ao buscar apostas: " + betsError.message)
        return
      }

      if (!bets || bets.length === 0) {
        alert("Nenhuma aposta encontrada nesta rodada")
        return
      }

      const betIds = bets.map((bet) => bet.id)

      // Atualizar o valor de todos os pagamentos
      const { error: updateError } = await supabase.from("payments").update({ amount: betValue }).in("bet_id", betIds)

      if (updateError) {
        console.error("[v0] Error updating payments:", updateError)
        alert("Erro ao atualizar pagamentos: " + updateError.message)
        return
      }

      console.log("[v0] All payments updated successfully")
      alert(`Valores atualizados com sucesso! ${bets.length} apostas atualizadas.`)
      router.refresh()
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      alert("Erro inesperado ao atualizar valores")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleUpdate} disabled={isLoading} variant="outline" size="sm">
      <RefreshCw className="h-4 w-4 mr-2" />
      {isLoading ? "Atualizando..." : "Atualizar Valores das Apostas"}
    </Button>
  )
}
