"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Round = {
  id: string
  name: string
  lottery_type: "quina" | "mega_sena"
  status: string
  payment_deadline?: string | null
  round_start_date?: string | null
  bet_value?: number
}

export function EditRoundDialog({ round }: { round: Round }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: round.name,
    status: round.status,
    payment_deadline: round.payment_deadline ? new Date(round.payment_deadline).toISOString().split("T")[0] : "",
    round_start_date: round.round_start_date ? new Date(round.round_start_date).toISOString().split("T")[0] : "",
    bet_value: round.bet_value || 5.0, // Added bet_value field with default
  })
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("[v0] Updating round with bet_value:", formData.bet_value)

    const { error } = await supabase
      .from("rounds")
      .update({
        name: formData.name,
        status: formData.status,
        payment_deadline: formData.payment_deadline || null,
        round_start_date: formData.round_start_date || null,
        bet_value: formData.bet_value,
      })
      .eq("id", round.id)

    if (error) {
      console.error("[v0] Error updating round:", error)
      alert("Erro ao atualizar rodada: " + error.message)
    } else {
      console.log("[v0] Round updated successfully with bet_value:", formData.bet_value)
      setOpen(false)
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Rodada</DialogTitle>
            <DialogDescription>Atualize os dados da rodada. O tipo de loteria não pode ser alterado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Rodada *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rodada Janeiro 2025"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lottery_type">Tipo de Loteria</Label>
              <Input
                value={round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">O tipo de loteria não pode ser alterado após a criação</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bet_value">Valor da Aposta (R$) *</Label>
              <Input
                id="bet_value"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.bet_value}
                onChange={(e) => setFormData({ ...formData, bet_value: Number.parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_deadline">Data Limite de Pagamento</Label>
              <Input
                id="payment_deadline"
                type="date"
                value={formData.payment_deadline}
                onChange={(e) => setFormData({ ...formData, payment_deadline: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="round_start_date">Data de Início da Rodada</Label>
              <Input
                id="round_start_date"
                type="date"
                value={formData.round_start_date}
                onChange={(e) => setFormData({ ...formData, round_start_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="finished">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
