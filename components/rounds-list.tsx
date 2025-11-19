"use client";

import { Round } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Users, Trash2, Grid3x3, List, DollarSign } from 'lucide-react';
import Link from "next/link";
import { EditRoundDialog } from "./edit-round-dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function RoundsList({ rounds, isAuthenticated }: { rounds: Round[], isAuthenticated?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (roundId: string) => {
    setDeletingId(roundId);
    const { error } = await supabase.from("rounds").delete().eq("id", roundId);
    
    if (error) {
      console.error("Error deleting round:", error);
      alert("Erro ao excluir rodada: " + error.message);
    } else {
      router.refresh();
    }
    setDeletingId(null);
  };

  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma rodada cadastrada ainda. Clique em "Nova Rodada" para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid gap-4'}>
        {rounds.map((round) => (
          <Card key={round.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className={viewMode === 'grid' ? 'text-lg mb-2' : 'text-2xl mb-2'}>{round.name}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={round.status === "active" ? "default" : "secondary"}
                      className={round.status === "active" ? "bg-emerald-600" : ""}
                    >
                      {round.status === "active" ? "Ativa" : "Finalizada"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {round.lottery_type === "quina" ? "Quina" : "Mega Sena"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isAuthenticated && (
                    <>
                      <EditRoundDialog round={round} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a rodada "{round.name}"? Esta ação não pode ser desfeita e todas as apostas, sorteios e resultados associados serão excluídos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(round.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingId === round.id}
                            >
                              {deletingId === round.id ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  <Button asChild size={viewMode === 'grid' ? 'sm' : 'default'}>
                    <Link href={`/rounds/${round.id}`}>
                      <Users className="h-4 w-4 mr-2" />
                      Ver Apostas
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Criada: {new Date(round.start_date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {round.payment_deadline && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      Pagamento até: {new Date(round.payment_deadline).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {round.round_start_date && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>
                      Início: {new Date(round.round_start_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {round.end_date && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>
                      Fim: {new Date(round.end_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
