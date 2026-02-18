import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Player } from "@/lib/types";

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length === 10 || numbers.length === 11;
}

export function AddPlayerDialog({ player, trigger, onSuccess }: { player?: Player; trigger?: React.ReactNode; onSuccess?: () => void }) {
  const isEdit = !!player;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (player) setFormData({ name: player.name, email: player.email || "", phone: player.phone || "" });
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone && !isValidPhone(formData.phone)) { toast.error("Telefone inválido"); return; }
    setIsLoading(true);
    const playerData = { name: formData.name, ...(formData.email.trim() && { email: formData.email.trim() }), phone: formData.phone || null };
    const { error } = isEdit ? await supabase.from("players").update(playerData).eq("id", player!.id) : await supabase.from("players").insert([playerData]);
    if (error) { toast.error(`Erro ao ${isEdit ? "atualizar" : "adicionar"} jogador: ${error.message}`); }
    else { toast.success(`Jogador ${isEdit ? "atualizado" : "adicionado"}!`); setFormData({ name: "", email: "", phone: "" }); setOpen(false); onSuccess?.(); }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || (<Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-2" />Adicionar Jogador</Button>)}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>{isEdit ? "Editar" : "Adicionar Novo"} Jogador</DialogTitle><DialogDescription>Preencha os dados do jogador.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="name">Nome *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="João Silva" required /></div>
            <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="joao@email.com" /><p className="text-xs text-muted-foreground">Opcional</p></div>
            <div className="grid gap-2"><Label htmlFor="phone">Celular/Telefone</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} placeholder="(11) 98765-4321" maxLength={15} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Salvando..." : isEdit ? "Atualizar" : "Adicionar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
