import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Loader2 } from "lucide-react";

export default function DrawsPage() {
  const { isAdmin } = useAuth();
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from("rounds").select("*, draws(count)").order("created_at", { ascending: false });
      setRounds(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Sorteios</h1>
          <p className="text-muted-foreground">Registre e confira os resultados dos sorteios</p>
        </div>
      </div>

      {rounds.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Nenhuma rodada cadastrada.</p><Button asChild className="mt-4"><Link to="/rounds">Criar Rodada</Link></Button></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {rounds.map((round: any) => (
            <Card key={round.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{round.name}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={round.status === "active" ? "default" : "secondary"} className={round.status === "active" ? "bg-blue-600" : ""}>
                        {round.status === "active" ? "Ativa" : "Finalizada"}
                      </Badge>
                      <Badge variant="outline">{round.lottery_type === "quina" ? "Quina" : "Mega Sena"}</Badge>
                      <Badge variant="outline">{round.draws?.[0]?.count || 0} sorteios</Badge>
                    </div>
                  </div>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link to={`/draws/${round.id}`}><TrendingUp className="h-4 w-4 mr-2" />{round.status === "active" && isAdmin ? "Gerenciar" : "Ver"} Sorteios</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
