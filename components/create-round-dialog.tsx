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

export function CreateRoundDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lottery_type: "quina" as "quina" | "mega_sena",
    payment_deadline: "",
    round_start_date: "",
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
      },
    ]);

    if (error) {
      console.error("Error creating round:", error);
      alert("Erro ao criar rodada: " + error.message);
    } else {
      setFormData({ name: "", lottery_type: "quina", payment_deadline: "", round_start_date: "" });
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Rodada</DialogTitle>
            <DialogDescription>
              Crie uma nova rodada de apostas para o bolão.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
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
