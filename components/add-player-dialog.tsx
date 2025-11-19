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
import { Plus, Edit } from 'lucide-react';
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Player } from "@/lib/types";

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
}

export function AddPlayerDialog({ player, trigger }: { player?: Player, trigger?: React.ReactNode }) {
  const isEdit = !!player;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        email: player.email || "",
        phone: player.phone || "",
      });
    }
  }, [player]);

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: formatPhone(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.phone && !isValidPhone(formData.phone)) {
      alert("Por favor, insira um telefone válido com DDD");
      return;
    }

    setIsLoading(true);

    const playerData = {
      name: formData.name,
      ...(formData.email.trim() && { email: formData.email.trim() }),
      phone: formData.phone || null,
    };

    let error;
    
    if (isEdit) {
      const result = await supabase
        .from("players")
        .update(playerData)
        .eq("id", player.id);
      error = result.error;
    } else {
      // Create new player
      const result = await supabase.from("players").insert([playerData]);
      error = result.error;
    }

    if (error) {
      console.error(`Error ${isEdit ? 'updating' : 'adding'} player:`, error);
      alert(`Erro ao ${isEdit ? 'atualizar' : 'adicionar'} jogador: ` + error.message);
    } else {
      setFormData({ name: "", email: "", phone: "" });
      setOpen(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Jogador
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar' : 'Adicionar Novo'} Jogador</DialogTitle>
            <DialogDescription>
              Preencha os dados do jogador para {isEdit ? 'atualizar' : 'cadastrá-lo no'} sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="João Silva"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="joao@email.com"
              />
              <p className="text-xs text-muted-foreground">Opcional</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Celular/Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 98765-4321"
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                {formData.phone && isValidPhone(formData.phone) ? 
                  "✓ Número válido" : 
                  "Formato: (DD) XXXXX-XXXX"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEdit ? "Atualizando..." : "Adicionando...") : (isEdit ? "Atualizar" : "Adicionar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
