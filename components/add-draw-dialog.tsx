import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Info } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AddDrawDialog({ roundId, lotteryType, nextDrawNumber, onSuccess }: { roundId: string; lotteryType: "quina" | "mega_sena"; nextDrawNumber: number; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const maxNumber = lotteryType === "quina" ? 80 : 60;
  const drawSize = 5;

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    else if (selectedNumbers.length < drawSize) setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNumbers.length !== drawSize) { toast.error(`Selecione exatamente ${drawSize} números.`); return; }
    setIsLoading(true);

    const { data: draw, error: drawError } = await supabase.from("draws").insert([{ round_id: roundId, draw_number: nextDrawNumber, draw_date: drawDate, numbers: selectedNumbers }]).select().single();
    if (drawError) { toast.error("Erro: " + drawError.message); setIsLoading(false); return; }

    const { data: bets } = await supabase.from("bets").select("*").eq("round_id", roundId);
    if (bets) {
      const results = bets.map((bet: any) => {
        const matchedNumbers = bet.numbers.filter((num: number) => selectedNumbers.includes(num));
        return { bet_id: bet.id, draw_id: draw.id, matches_count: matchedNumbers.length, matched_numbers: matchedNumbers, accumulated_matches: 0 };
      });
      const { error: resultsError } = await supabase.from("results").insert(results);
      if (resultsError) toast.error("Erro ao calcular resultados: " + resultsError.message);
    }

    toast.success("Sorteio adicionado!"); setSelectedNumbers([]); setDrawDate(new Date().toISOString().split("T")[0]); setOpen(false); onSuccess?.();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Adicionar Sorteio</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Adicionar Sorteio #{nextDrawNumber}</DialogTitle><DialogDescription>Registre os {drawSize} números sorteados.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <Alert className="bg-blue-50 border-blue-200"><Info className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-900 text-sm">Os resultados serão calculados automaticamente.</AlertDescription></Alert>
            <div className="grid gap-2"><Label>Data do Sorteio *</Label><Input type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} required /></div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between"><Label>Números: {selectedNumbers.length}/{drawSize}</Label>{selectedNumbers.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedNumbers([])}>Limpar</Button>}</div>
              <div className="flex flex-wrap gap-1 p-3 border rounded-md min-h-[60px] bg-muted/50">{selectedNumbers.length === 0 ? <span className="text-sm text-muted-foreground">Selecione os números abaixo</span> : selectedNumbers.map((num) => (<Badge key={num} variant="default" className="bg-blue-600 text-lg px-3 py-1">{num.toString().padStart(2, "0")}</Badge>))}</div>
              <div className="grid grid-cols-10 gap-1 p-3 border rounded-md max-h-[300px] overflow-y-auto">{Array.from({ length: maxNumber }, (_, i) => i + 1).map((num) => (<Button key={num} type="button" variant={selectedNumbers.includes(num) ? "default" : "outline"} size="sm" className={`h-9 w-full text-xs font-mono ${selectedNumbers.includes(num) ? "bg-blue-600 hover:bg-blue-700" : ""}`} onClick={() => toggleNumber(num)}>{num.toString().padStart(2, "0")}</Button>))}</div>
            </div>
          </div>
          <DialogFooter><Button type="submit" disabled={isLoading || selectedNumbers.length !== drawSize}>{isLoading ? "Adicionando..." : "Adicionar e Calcular"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
