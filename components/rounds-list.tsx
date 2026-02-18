import { Round } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Users, Trash2, Grid3x3, List, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { EditRoundDialog } from "./edit-round-dialog";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function RoundsList({ rounds, isAuthenticated, onRefresh }: { rounds: Round[]; isAuthenticated?: boolean; onRefresh?: () => void }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (roundId: string) => {
    setDeletingId(roundId);
    const { error } = await supabase.from("rounds").delete().eq("id", roundId);
    if (error) { toast.error("Erro ao excluir rodada: " + error.message); }
    else { toast.success("Rodada excluída!"); onRefresh?.(); }
    setDeletingId(null);
  };

  if (rounds.length === 0) {
    return (<Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Nenhuma rodada cadastrada ainda.</p></CardContent></Card>);
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}><Grid3x3 className="h-4 w-4" /></Button>
        <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
      </div>
      <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "grid gap-4"}>
        {rounds.map((round) => (
          <Card key={round.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className={viewMode === "grid" ? "text-lg mb-2" : "text-2xl mb-2"}>{round.name}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={round.status === "active" ? "default" : "secondary"} className={round.status === "active" ? "bg-emerald-600" : ""}>{round.status === "active" ? "Ativa" : "Finalizada"}</Badge>
                    <Badge variant="outline">{round.lottery_type === "quina" ? "Quina" : "Mega Sena"}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isAuthenticated && (
                    <>
                      <EditRoundDialog round={round} onSuccess={onRefresh} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Excluir "{round.name}"? Todas as apostas e sorteios serão removidos.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(round.id)} className="bg-destructive text-destructive-foreground" disabled={deletingId === round.id}>{deletingId === round.id ? "Excluindo..." : "Excluir"}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  <Button asChild size={viewMode === "grid" ? "sm" : "default"}><Link to={`/rounds/${round.id}`}><Users className="h-4 w-4 mr-2" />Ver Apostas</Link></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Criada: {new Date(round.start_date).toLocaleDateString("pt-BR")}</span></div>
                {round.payment_deadline && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span>Pagamento até: {new Date(round.payment_deadline).toLocaleDateString("pt-BR")}</span></div>}
                {round.round_start_date && <div className="flex items-center gap-2"><Trophy className="h-4 w-4" /><span>Início: {new Date(round.round_start_date).toLocaleDateString("pt-BR")}</span></div>}
                {round.end_date && <div className="flex items-center gap-2"><Trophy className="h-4 w-4" /><span>Fim: {new Date(round.end_date).toLocaleDateString("pt-BR")}</span></div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
