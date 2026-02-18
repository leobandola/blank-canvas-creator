import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BetsList } from "@/components/bets-list";
import { CreateBetDialog } from "@/components/create-bet-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, FileText, Loader2 } from "lucide-react";
import { Player } from "@/lib/types";
import NotFoundPage from "./NotFoundPage";

export default function RoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [round, setRound] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = async () => {
    const { data: roundData, error } = await supabase
      .from("rounds").select("*").eq("id", id).single();
    
    if (error || !roundData) { setNotFound(true); setLoading(false); return; }
    setRound(roundData);

    const [{ data: betsData }, { data: playersData }] = await Promise.all([
      supabase.from("bets").select("*, player:players(*), payments(*)").eq("round_id", id!).order("created_at", { ascending: false }),
      supabase.from("players").select("*").order("name", { ascending: true }),
    ]);
    setBets(betsData || []);
    setPlayers(playersData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  if (notFound) return <NotFoundPage />;
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/rounds"><ArrowLeft className="h-4 w-4 mr-2" />Voltar para Rodadas</Link>
        </Button>

        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl mb-3">{round.name}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={round.status === "active" ? "default" : "secondary"} className={round.status === "active" ? "bg-emerald-600" : ""}>
                    {round.status === "active" ? "Ativa" : "Finalizada"}
                  </Badge>
                  <Badge variant="outline">{round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"}</Badge>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/rounds/${id}/report`}><FileText className="h-4 w-4 mr-2" />Rel. Pagamentos</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/rounds/${id}/closure`}><FileText className="h-4 w-4 mr-2" />Rel. Fechamento</Link>
                </Button>
                {user && round.status === "active" && (
                  <CreateBetDialog roundId={id!} players={players} lotteryType={round.lottery_type} onSuccess={fetchData} />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{bets.length} {bets.length === 1 ? "aposta cadastrada" : "apostas cadastradas"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <BetsList bets={bets} roundId={id!} isAuthenticated={!!user} lotteryType={round.lottery_type} onRefresh={fetchData} />
    </div>
  );
}
