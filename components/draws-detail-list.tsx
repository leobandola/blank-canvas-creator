import { Draw } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, Target } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { EditDrawDialog } from "./edit-draw-dialog";

export function DrawsDetailList({ draws, roundId, lotteryType, isAuthenticated, onRefresh }: { draws: Draw[]; roundId: string; lotteryType: "quina" | "mega_sena"; isAuthenticated: boolean; onRefresh?: () => void }) {
  const [deleteDrawId, setDeleteDrawId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteDrawId) return;
    setIsDeleting(true);
    const { error } = await supabase.from("draws").delete().eq("id", deleteDrawId);
    if (error) { toast.error("Erro: " + error.message); } else { toast.success("Sorteio excluído!"); onRefresh?.(); }
    setIsDeleting(false);
    setDeleteDrawId(null);
  };

  if (draws.length === 0) {
    return (<Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Nenhum sorteio registrado ainda.</p></CardContent></Card>);
  }

  return (
    <>
      <div className="grid gap-4">
        {draws.map((draw) => (
          <Card key={draw.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    Sorteio #{draw.draw_number}
                    <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />{new Date(draw.draw_date).toLocaleDateString("pt-BR")}</Badge>
                  </CardTitle>
                  <div className="flex flex-wrap gap-1">{draw.numbers.sort((a, b) => a - b).map((num) => (<Badge key={num} variant="default" className="font-mono bg-blue-600 text-lg px-3 py-1">{num.toString().padStart(2, "0")}</Badge>))}</div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Link to={`/draws/${roundId}/results/${draw.id}`}><Target className="h-4 w-4 mr-1" />Ver Resultados</Link></Button>
                  {isAuthenticated && (
                    <>
                      <EditDrawDialog draw={draw} lotteryType={lotteryType} onSuccess={onRefresh} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteDrawId(draw.id)}><Trash2 className="h-4 w-4" /></Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <AlertDialog open={!!deleteDrawId} onOpenChange={(open) => !open && setDeleteDrawId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir Sorteio</AlertDialogTitle><AlertDialogDescription>Tem certeza? Todos os resultados serão removidos.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Excluindo..." : "Excluir"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
