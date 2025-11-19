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
import { Player } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function CreateBetDialog({
  roundId,
  players,
  lotteryType,
}: {
  roundId: string;
  players: Player[];
  lotteryType: "quina" | "mega_sena";
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const maxNumber = lotteryType === "quina" ? 80 : 60;
  const maxSelections = 10;

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < maxSelections) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedNumbers.length !== maxSelections) {
      alert(`Você deve selecionar exatamente ${maxSelections} números.`);
      return;
    }

    setIsLoading(true);

    const { data: bet, error: betError } = await supabase
      .from("bets")
      .insert([
        {
          round_id: roundId,
          player_id: selectedPlayer,
          numbers: selectedNumbers,
        },
      ])
      .select()
      .single();

    if (betError) {
      console.error("Error creating bet:", betError);
      alert("Erro ao criar aposta: " + betError.message);
      setIsLoading(false);
      return;
    }

    const { error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          bet_id: bet.id,
          amount: 20.00,
          status: "pending",
        },
      ]);

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
    }

    setSelectedPlayer("");
    setSelectedNumbers([]);
    setOpen(false);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Aposta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Aposta</DialogTitle>
            <DialogDescription>
              Selecione o jogador e escolha {maxSelections} números de 1 a {maxNumber}.
              <br />
              <span className="text-xs text-muted-foreground">
                Cada jogador pode ter múltiplas apostas na mesma rodada.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="player">Jogador *</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um jogador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>
                  Números Selecionados: {selectedNumbers.length}/{maxSelections}
                </Label>
                {selectedNumbers.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNumbers([])}
                  >
                    Limpar
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 p-3 border rounded-md min-h-[60px] bg-muted/50">
                {selectedNumbers.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Selecione os números abaixo
                  </span>
                ) : (
                  selectedNumbers.sort((a, b) => a - b).map((num) => (
                    <Badge key={num} variant="default" className="bg-amber-600">
                      {num.toString().padStart(2, "0")}
                    </Badge>
                  ))
                )}
              </div>

              <div className="grid grid-cols-10 gap-1 p-3 border rounded-md max-h-[300px] overflow-y-auto">
                {Array.from({ length: maxNumber }, (_, i) => i + 1).map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={selectedNumbers.includes(num) ? "default" : "outline"}
                    size="sm"
                    className={`h-9 w-full text-xs font-mono ${
                      selectedNumbers.includes(num)
                        ? "bg-amber-600 hover:bg-amber-700"
                        : ""
                    }`}
                    onClick={() => toggleNumber(num)}
                  >
                    {num.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || selectedNumbers.length !== maxSelections || !selectedPlayer}
            >
              {isLoading ? "Criando..." : "Criar Aposta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
