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
import { Plus } from 'lucide-react';
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

export function CreateRoundDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lottery_type: "quina" as "quina" | "mega_sena",
    payment_deadline: "",
    round_start_date: "",
    total_prize_pool: "",
    prize_10_hits: "",
    prize_2nd_place: "",
    prize_zero_hits: "",
    prize_per_draw: "",
    prize_indication: "",
  });
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.from("rounds").insert([
      {
        name: formData.name,
        lottery_type: formData.lottery_type,
        status: "active",
        start_date: new Date().toISOString(),
        payment_deadline: formData.payment_deadline || null,
        round_start_date: formData.round_start_date || null,
        total_prize_pool: formData.total_prize_pool ? parseFloat(formData.total_prize_pool) : null,
        prize_10_hits: formData.prize_10_hits ? parseFloat(formData.prize_10_hits) : null,
        prize_2nd_place: formData.prize_2nd_place ? parseFloat(formData.prize_2nd_place) : null,
        prize_zero_hits: formData.prize_zero_hits ? parseFloat(formData.prize_zero_hits) : null,
        prize_per_draw: formData.prize_per_draw ? parseFloat(formData.prize_per_draw) : null,
        prize_indication: formData.prize_indication ? parseFloat(formData.prize_indication) : null,
      },
    ]);

    if (error) {
      console.error("Error creating round:", error);
      alert("Erro ao criar rodada: " + error.message);
    } else {
      setFormData({ 
        name: "", 
        lottery_type: "quina", 
        payment_deadline: "", 
        round_start_date: "",
        total_prize_pool: "",
        prize_10_hits: "",
        prize_2nd_place: "",
        prize_zero_hits: "",
        prize_per_draw: "",
        prize_indication: "",
      });
      setOpen(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Rodada
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Rodada</DialogTitle>
            <DialogDescription>
              Crie uma nova rodada de apostas para o bolão.
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
                <Label htmlFor="lottery_type">Tipo de Loteria *</Label>
                <Select
                  value={formData.lottery_type}
                  onValueChange={(value: "quina" | "mega_sena") =>
                    setFormData({ ...formData, lottery_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quina">Quina (1-80)</SelectItem>
                    <SelectItem value="mega_sena">Mega Sena (1-60)</SelectItem>
                  </SelectContent>
                </Select>
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
              {isLoading ? "Criando..." : "Criar Rodada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
