import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MarkPaidDialog } from "@/components/mark-paid-dialog";
import { EditBetDialog } from "@/components/edit-bet-dialog";

type BetWithRelations = {
  id: string; round_id: string; player_id: string; numbers: number[]; created_at: string;
  player: { id: string; name: string; email: string };
  payments: Array<{ id: string; status: string; amount: number; payment_date: string }>;
};

export function BetsList({ bets, roundId, isAuthenticated, lotteryType, onRefresh }: { bets: BetWithRelations[]; roundId: string; isAuthenticated: boolean; lotteryType: "quina" | "mega_sena"; onRefresh?: () => void }) {
  const [deleteBetId, setDeleteBetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteBetId) return;
    setIsDeleting(true);
    const { error } = await supabase.from("bets").delete().eq("id", deleteBetId);
    if (error) { toast.error("Erro: " + error.message); } else { toast.success("Aposta excluída!"); onRefresh?.(); }
    setIsDeleting(false);
    setDeleteBetId(null);
  };

  const sortedBets = [...bets].sort((a, b) => a.player.name.localeCompare(b.player.name, "pt-BR"));

  if (sortedBets.length === 0) {
    return (<Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Nenhuma aposta cadastrada ainda.</p></CardContent></Card>);
  }

  return (
    <>
      <div className="grid gap-4">
        {sortedBets.map((bet) => {
          const payment = bet.payments?.[0];
          const isPaid = payment?.status === "paid";
          return (
            <Card key={bet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{bet.player.name}</CardTitle>
                    <div className="flex flex-wrap gap-1 mb-3">{bet.numbers.sort((a, b) => a - b).map((num) => (<Badge key={num} variant="outline" className="font-mono">{num.toString().padStart(2, "0")}</Badge>))}</div>
                    <div className="flex items-center gap-3">
                      {isPaid ? (<Badge className="bg-emerald-600"><DollarSign className="h-3 w-3 mr-1" />Pago - R$ {payment.amount.toFixed(2)}</Badge>) : (<Badge variant="destructive">Pagamento Pendente</Badge>)}
                      <span className="text-sm text-muted-foreground">{new Date(bet.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <EditBetDialog bet={bet} lotteryType={lotteryType} onSuccess={onRefresh} />
                      {!isPaid && payment && <MarkPaidDialog paymentId={payment.id} onSuccess={onRefresh} />}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteBetId(bet.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
      <AlertDialog open={!!deleteBetId} onOpenChange={(open) => !open && setDeleteBetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir Aposta</AlertDialogTitle><AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Excluindo..." : "Excluir"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
