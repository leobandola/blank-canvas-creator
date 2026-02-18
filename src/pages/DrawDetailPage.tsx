import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { DrawsDetailList } from "@/components/draws-detail-list";
import { AddDrawDialog } from "@/components/add-draw-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import NotFoundPage from "./NotFoundPage";

export default function DrawDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [round, setRound] = useState<any>(null);
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = async () => {
    const { data: roundData, error } = await supabase.from("rounds").select("*").eq("id", id).single();
    if (error || !roundData) { setNotFound(true); setLoading(false); return; }
    setRound(roundData);
    const { data: drawsData } = await supabase.from("draws").select("*").eq("round_id", id!).order("draw_number", { ascending: false });
    setDraws(drawsData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  if (notFound) return <NotFoundPage />;
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4"><Link to="/draws"><ArrowLeft className="h-4 w-4 mr-2" />Voltar para Sorteios</Link></Button>
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl mb-3">{round.name}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={round.status === "active" ? "default" : "secondary"} className={round.status === "active" ? "bg-blue-600" : ""}>{round.status === "active" ? "Ativa" : "Finalizada"}</Badge>
                  <Badge variant="outline">{round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"}</Badge>
                </div>
              </div>
              {user && round.status === "active" && (
                <AddDrawDialog roundId={id!} lotteryType={round.lottery_type} nextDrawNumber={(draws[0]?.draw_number || 0) + 1} onSuccess={fetchData} />
              )}
            </div>
          </CardHeader>
          <CardContent><p className="text-muted-foreground">{draws.length} {draws.length === 1 ? "sorteio realizado" : "sorteios realizados"}</p></CardContent>
        </Card>
      </div>
      <DrawsDetailList draws={draws} roundId={id!} lotteryType={round.lottery_type} isAuthenticated={!!user} onRefresh={fetchData} />
    </div>
  );
}
