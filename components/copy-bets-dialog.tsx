"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Round = {
  id: string
  name: string
  lottery_type: string
  status: string
  start_date: string
  bet_value: number
}

type Bet = {
  player_id: string
  numbers: number[]
  player: {
    name: string
  }
}

export function CopyBetsDialog({
  currentRoundId,
  currentRoundName,
  lotteryType,
}: {
  currentRoundId: string
  currentRoundName: string
  lotteryType: string
}) {
  const [open, setOpen] = useState(false)
  const [selectedRoundId, setSelectedRoundId] = useState<string>("")
  const [rounds, setRounds] = useState<Round[]>([])
  const [betsPreview, setBetsPreview] = useState<Bet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [betValue, setBetValue] = useState<number>(5.0)
  const router = useRouter()
  const supabase = createClient()

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      await loadRounds()
      console.log("[v0] CopyBetsDialog opened, fetching bet_value for round:", currentRoundId)
      const { data: round, error } = await supabase.from("rounds").select("bet_value").eq("id", currentRoundId).single()

      console.log("[v0] Round data fetched:", round)
      console.log("[v0] Fetch error:", error)

      if (round?.bet_value) {
        console.log("[v0] Setting betValue to:", round.bet_value)
        setBetValue(round.bet_value)
      } else {
        console.log("[v0] No bet_value found, using default 5.0")
      }
    } else {
      setSelectedRoundId("")
      setBetsPreview([])
      setError(null)
    }
  }

  const loadRounds = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .eq("lottery_type", lotteryType)
        .neq("id", currentRoundId)
        .order("start_date", { ascending: false })

      if (error) throw error
      setRounds(data || [])
    } catch (err) {
      console.error("[v0] Error loading rounds:", err)
      setError("Erro ao carregar rodadas")
    } finally {
      setIsLoading(false)
    }
  }

  const loadBetsPreview = async (roundId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("bets")
        .select(`
          player_id,
          numbers,
          player:players(name)
        `)
        .eq("round_id", roundId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setBetsPreview(data || [])
    } catch (err) {
      console.error("[v0] Error loading bets preview:", err)
      setError("Erro ao carregar apostas")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoundSelect = (roundId: string) => {
    setSelectedRoundId(roundId)
    loadBetsPreview(roundId)
  }

  const handleCopyBets = async () => {
    if (!selectedRoundId || betsPreview.length === 0) return

    setIsCopying(true)
    setError(null)

    try {
      console.log("[v0] Starting to copy bets from round:", selectedRoundId, "to:", currentRoundId)
      console.log("[v0] Using bet_value for payments:", betValue)

      const { data: existingBets, error: checkError } = await supabase
        .from("bets")
        .select("id")
        .eq("round_id", currentRoundId)
        .limit(1)

      if (checkError) throw checkError

      if (existingBets && existingBets.length > 0) {
        const confirmOverwrite = window.confirm(
          "Já existem apostas nesta rodada. Deseja adicionar as apostas copiadas de qualquer forma?",
        )
        if (!confirmOverwrite) {
          setIsCopying(false)
          return
        }
      }

      const betsToInsert = betsPreview.map((bet) => ({
        round_id: currentRoundId,
        player_id: bet.player_id,
        numbers: bet.numbers,
      }))

      const { data: insertedBets, error: insertError } = await supabase.from("bets").insert(betsToInsert).select()

      if (insertError) throw insertError

      console.log("[v0] Successfully copied", insertedBets.length, "bets")

      const paymentsToInsert = insertedBets.map((bet) => ({
        bet_id: bet.id,
        status: "pending",
        amount: betValue,
      }))

      console.log("[v0] Creating payments with amount:", betValue, "for", paymentsToInsert.length, "bets")

      const { error: paymentsError } = await supabase.from("payments").insert(paymentsToInsert)

      if (paymentsError) {
        console.error("[v0] Error creating payments:", paymentsError)
      } else {
        console.log("[v0] Payments created successfully")
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error("[v0] Error copying bets:", err)
      setError("Erro ao copiar apostas. Tente novamente.")
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Copiar Apostas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copiar Apostas de Outra Rodada</DialogTitle>
          <DialogDescription>
            Selecione uma rodada anterior para copiar todas as apostas para "{currentRoundName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rodada de Origem</label>
            <Select value={selectedRoundId} onValueChange={handleRoundSelect} disabled={isLoading || isCopying}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma rodada" />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((round) => (
                  <SelectItem key={round.id} value={round.id}>
                    {round.name} - {new Date(round.start_date).toLocaleDateString("pt-BR")}
                    {round.status === "active" && " (Ativa)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>}

          {betsPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Apostas a serem copiadas ({betsPreview.length})</label>
              </div>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                {betsPreview.map((bet, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{bet.player.name}</span>
                    <div className="flex flex-wrap gap-1">
                      {bet.numbers
                        .sort((a, b) => a - b)
                        .map((num) => (
                          <Badge key={num} variant="outline" className="font-mono text-xs">
                            {num.toString().padStart(2, "0")}
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRoundId && !isLoading && betsPreview.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Nenhuma aposta encontrada nesta rodada</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCopying}>
            Cancelar
          </Button>
          <Button onClick={handleCopyBets} disabled={!selectedRoundId || betsPreview.length === 0 || isCopying}>
            {isCopying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Copiando...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar {betsPreview.length} {betsPreview.length === 1 ? "Aposta" : "Apostas"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
