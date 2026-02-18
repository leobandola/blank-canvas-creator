import { Player } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Trash2, Calendar, Edit, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddPlayerDialog } from "./add-player-dialog";

export function PlayerList({ players, isAuthenticated, onRefresh }: { players: Player[]; isAuthenticated: boolean; onRefresh?: () => void }) {
  const [deletePlayerId, setDeletePlayerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMobilePhone = (phone: string) => phone.replace(/\D/g, "").length === 11;

  const handleDelete = async () => {
    if (!deletePlayerId) return;
    setIsDeleting(true);
    const { error } = await supabase.from("players").delete().eq("id", deletePlayerId);
    if (error) { toast.error("Erro ao excluir jogador: " + error.message); }
    else { toast.success("Jogador excluído!"); onRefresh?.(); }
    setIsDeleting(false);
    setDeletePlayerId(null);
  };

  if (players.length === 0) {
    return (<Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Nenhum jogador cadastrado ainda.</p></CardContent></Card>);
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{player.name}</CardTitle>
                {isAuthenticated && (
                  <div className="flex gap-1">
                    <AddPlayerDialog player={player} onSuccess={onRefresh} trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletePlayerId(player.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {player.email && (<div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /><span className="truncate">{player.email}</span></div>)}
              {player.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isMobilePhone(player.phone) ? (<><Smartphone className="h-4 w-4 text-emerald-600" /><span>{player.phone}</span><Badge variant="secondary" className="ml-auto text-xs">Celular</Badge></>) : (<><Phone className="h-4 w-4" /><span>{player.phone}</span></>)}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2"><Calendar className="h-4 w-4" /><span>Cadastrado em {new Date(player.created_at).toLocaleDateString("pt-BR")}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <AlertDialog open={!!deletePlayerId} onOpenChange={(open) => !open && setDeletePlayerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir Jogador</AlertDialogTitle><AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Excluindo..." : "Excluir"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
