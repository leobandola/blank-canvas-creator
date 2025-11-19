"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from 'lucide-react';
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Round = {
  id: string;
  name: string;
  lottery_type: "quina" | "mega_sena";
  status: string;
  payment_deadline?: string | null;
  round_start_date?: string | null;
  prize_10_hits?: number | null;
  prize_2nd_place?: number | null;
  prize_zero_hits?: number | null;
  prize_per_draw?: number | null;
  prize_indication?: number | null;
  total_prize_pool?: number | null;
};

export function EditRoundDialog({ round }: { round: Round }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: round.name,
    status: round.status,
    payment_deadline: round.payment_deadline ? new Date(round.payment_deadline).toISOString().split('T')[0] : "",
    round_start_date: round.round_start_date ? new Date(round.round_start_date).toISOString().split('T')[0] : "",
    total_prize_pool: round.total_prize_pool?.toString() || "",
    prize_10_hits: round.prize_10_hits?.toString() || "",
    prize_2nd_place: round.prize_2nd_place?.toString() || "",
    prize_zero_hits: round.prize_zero_hits?.toString() || "",
    prize_per_draw: round.prize_per_draw?.toString() || "",
    prize_indication: round.prize_indication?.toString() || "",
  });
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("rounds")
      .update({
        name: formData.name,
        status: formData.status,
        payment_deadline: formData.payment_deadline || null,
        round_start_date: formData.round_start_date || null,
        total_prize_pool: formData.total_prize_pool ? parseFloat(formData.total_prize_pool) : null,
        prize_10_hits: formData.prize_10_hits ? parseFloat(formData.prize_10_hits) : null,
        prize_2nd_place: formData.prize_2nd_place ? parseFloat(formData.prize_2nd_place) : null,
        prize_zero_hits: formData.prize_zero_hits ? parseFloat(formData.prize_zero_hits) : null,
        prize_per_draw: formData.prize_per_draw ? parseFloat(formData.prize_per_draw) : null,
        prize_indication: formData.prize_indication ? parseFloat(formData.prize_indication) : null,
      })
      .eq("id", round.id);

    if (error) {
      console.error("Error updating round:", error);
      alert("Erro ao atualizar rodada: " + error.message);
    } else {
      setOpen(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Rodada</DialogTitle>
            <DialogDescription>
              Atualize os dados da rodada. O tipo de loteria não pode ser alterado.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="py-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="prizes">Premiações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Rodada *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                <p className="text-xs text-muted-foreground">
                  O tipo de loteria não pode ser alterado após a criação
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment_deadline">Data Limite de Pagamento</Label>
                <Input
                  id="payment_deadline"
                  type="date"
                  value={formData.payment_deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_deadline: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="round_start_date">Data de Início da Rodada</Label>
                <Input
                  id="round_start_date"
                  type="date"
                  value={formData.round_start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, round_start_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="finished">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="prizes" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="total_prize_pool">Premiação Total (R$)</Label>
                <Input
                  id="total_prize_pool"
                  type="number"
                  step="0.01"
                  value={formData.total_prize_pool}
                  onChange={(e) =>
                    setFormData({ ...formData, total_prize_pool: e.target.value })
                  }
                  placeholder="155328.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize_10_hits">Prêmio 10 Acertos (R$)</Label>
                <Input
                  id="prize_10_hits"
                  type="number"
                  step="0.01"
                  value={formData.prize_10_hits}
                  onChange={(e) =>
                    setFormData({ ...formData, prize_10_hits: e.target.value })
                  }
                  placeholder="85430.40"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize_2nd_place">Prêmio 2ª Colocação (R$)</Label>
                <Input
                  id="prize_2nd_place"
                  type="number"
                  step="0.01"
                  value={formData.prize_2nd_place}
                  onChange={(e) =>
                    setFormData({ ...formData, prize_2nd_place: e.target.value })
                  }
                  placeholder="23299.20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize_zero_hits">Prêmio Zero Acertos (R$)</Label>
                <Input
                  id="prize_zero_hits"
                  type="number"
                  step="0.01"
                  value={formData.prize_zero_hits}
                  onChange={(e) =>
                    setFormData({ ...formData, prize_zero_hits: e.target.value })
                  }
                  placeholder="10872.96"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize_per_draw">Prêmio por Acertos em Sorteio (R$)</Label>
                <Input
                  id="prize_per_draw"
                  type="number"
                  step="0.01"
                  value={formData.prize_per_draw}
                  onChange={(e) =>
                    setFormData({ ...formData, prize_per_draw: e.target.value })
                  }
                  placeholder="4659.84"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize_indication">Prêmio Indicação (R$)</Label>
                <Input
                  id="prize_indication"
                  type="number"
                  step="0.01"
                  value={formData.prize_indication}
                  onChange={(e) =>
                    setFormData({ ...formData, prize_indication: e.target.value })
                  }
                  placeholder="3106.56"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
