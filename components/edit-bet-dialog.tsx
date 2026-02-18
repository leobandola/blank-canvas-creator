import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Bet = { id: string; numbers: number[]; player: { name: string } };

export function EditBetDialog({ bet, lotteryType, onSuccess }: { bet: Bet; lotteryType: "quina" | "mega_sena"; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(bet.numbers);
  const maxNumber = lotteryType === "quina" ? 80 : 60;
  const maxSelections = 10;

  useEffect(() => { if (open) setSelectedNumbers(bet.numbers); }, [open, bet.numbers]);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    else if (selectedNumbers.length < maxSelections) setSelectedNumbers([...selectedNumbers, num]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNumbers.length !== maxSelections) { toast.error(`Selecione exatamente ${maxSelections} números.`); return; }
    setIsLoading(true);
    const { error } = await supabase.from("bets").update({ numbers: selectedNumbers }).eq("id", bet.id);
    if (error) { toast.error("Erro: " + error.message); } else { toast.success("Aposta atualizada!"); setOpen(false); onSuccess?.(); }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Editar Aposta - {bet.player.name}</DialogTitle><DialogDescription>Escolha {maxSelections} números de 1 a {maxNumber}.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between"><Label>Números: {selectedNumbers.length}/{maxSelections}</Label>{selectedNumbers.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedNumbers([])}>Limpar</Button>}</div>
              <div className="flex flex-wrap gap-1 p-3 border rounded-md min-h-[60px] bg-muted/50">{selectedNumbers.sort((a, b) => a - b).map((num) => (<Badge key={num} variant="default" className="bg-amber-600">{num.toString().padStart(2, "0")}</Badge>))}</div>
              <div className="grid grid-cols-10 gap-1 p-3 border rounded-md max-h-[300px] overflow-y-auto">{Array.from({ length: maxNumber }, (_, i) => i + 1).map((num) => (<Button key={num} type="button" variant={selectedNumbers.includes(num) ? "default" : "outline"} size="sm" className={`h-9 w-full text-xs font-mono ${selectedNumbers.includes(num) ? "bg-amber-600 hover:bg-amber-700" : ""}`} onClick={() => toggleNumber(num)}>{num.toString().padStart(2, "0")}</Button>))}</div>
            </div>
          </div>
          <DialogFooter><Button type="submit" disabled={isLoading || selectedNumbers.length !== maxSelections}>{isLoading ? "Atualizando..." : "Atualizar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
