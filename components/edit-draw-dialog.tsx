import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Draw = { id: string; draw_number: number; draw_date: string; numbers: number[] };

export function EditDrawDialog({ draw, lotteryType, onSuccess }: { draw: Draw; lotteryType: "quina" | "mega_sena"; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(draw.numbers);
  const [drawDate, setDrawDate] = useState("");
  const maxNumber = lotteryType === "quina" ? 80 : 60;
  const requiredNumbers = 5;

  useEffect(() => { if (open) { setSelectedNumbers(draw.numbers); setDrawDate(new Date(draw.draw_date).toISOString().split("T")[0]); } }, [open, draw]);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    else if (selectedNumbers.length < requiredNumbers) setSelectedNumbers([...selectedNumbers, num]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNumbers.length !== requiredNumbers) { toast.error(`Selecione exatamente ${requiredNumbers} números.`); return; }
    setIsLoading(true);
    const { error } = await supabase.from("draws").update({ numbers: selectedNumbers, draw_date: drawDate }).eq("id", draw.id);
    if (error) { toast.error("Erro: " + error.message); } else { toast.success("Sorteio atualizado!"); setOpen(false); onSuccess?.(); }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Editar Sorteio #{draw.draw_number}</DialogTitle><DialogDescription>Atualize a data e números.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Data do Sorteio *</Label><Input type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} required /></div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between"><Label>Números: {selectedNumbers.length}/{requiredNumbers}</Label>{selectedNumbers.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedNumbers([])}>Limpar</Button>}</div>
              <div className="flex flex-wrap gap-1 p-3 border rounded-md min-h-[60px] bg-muted/50">{selectedNumbers.sort((a, b) => a - b).map((num) => (<Badge key={num} variant="default" className="bg-blue-600 text-lg px-3 py-1">{num.toString().padStart(2, "0")}</Badge>))}</div>
              <div className="grid grid-cols-10 gap-1 p-3 border rounded-md max-h-[300px] overflow-y-auto">{Array.from({ length: maxNumber }, (_, i) => i + 1).map((num) => (<Button key={num} type="button" variant={selectedNumbers.includes(num) ? "default" : "outline"} size="sm" className={`h-9 w-full text-xs font-mono ${selectedNumbers.includes(num) ? "bg-blue-600 hover:bg-blue-700" : ""}`} onClick={() => toggleNumber(num)}>{num.toString().padStart(2, "0")}</Button>))}</div>
            </div>
          </div>
          <DialogFooter><Button type="submit" disabled={isLoading || selectedNumbers.length !== requiredNumbers}>{isLoading ? "Atualizando..." : "Atualizar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
