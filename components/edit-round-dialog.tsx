import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Round = { id: string; name: string; lottery_type: "quina" | "mega_sena"; status: string; payment_deadline?: string | null; round_start_date?: string | null };

export function EditRoundDialog({ round, onSuccess }: { round: Round; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: round.name, status: round.status,
    payment_deadline: round.payment_deadline ? new Date(round.payment_deadline).toISOString().split("T")[0] : "",
    round_start_date: round.round_start_date ? new Date(round.round_start_date).toISOString().split("T")[0] : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.from("rounds").update({ name: formData.name, status: formData.status, payment_deadline: formData.payment_deadline || null, round_start_date: formData.round_start_date || null }).eq("id", round.id);
    if (error) { toast.error("Erro: " + error.message); } else { toast.success("Rodada atualizada!"); setOpen(false); onSuccess?.(); }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Editar Rodada</DialogTitle><DialogDescription>Atualize os dados da rodada.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="grid gap-2"><Label>Tipo de Loteria</Label><Input value={round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"} disabled className="bg-muted" /></div>
            <div className="grid gap-2"><Label>Data Limite de Pagamento</Label><Input type="date" value={formData.payment_deadline} onChange={(e) => setFormData({ ...formData, payment_deadline: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Data de Início</Label><Input type="date" value={formData.round_start_date} onChange={(e) => setFormData({ ...formData, round_start_date: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Status *</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Ativa</SelectItem><SelectItem value="finished">Finalizada</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Atualizando..." : "Atualizar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
