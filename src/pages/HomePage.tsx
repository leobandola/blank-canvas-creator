import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ players: 0, rounds: 0, draws: 0, winners: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: playersCount },
        { count: roundsCount },
        { count: drawsCount },
        { count: winnersCount },
      ] = await Promise.all([
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.from("rounds").select("*", { count: "exact", head: true }),
        supabase.from("draws").select("*", { count: "exact", head: true }),
        supabase.from("winners").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        players: playersCount || 0,
        rounds: roundsCount || 0,
        draws: drawsCount || 0,
        winners: winnersCount || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          Sistema de Gestão de Bolões
        </h1>
        <p className="text-lg text-muted-foreground">
          Gerencie seus bolões de Quina e Mega Sena com facilidade
        </p>
        {!user && (
          <p className="text-sm text-muted-foreground mt-2">
            Faça login para editar informações. Visitantes podem apenas visualizar.
          </p>
        )}
      </div>

      {/* Dashboard stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <Link to="/players">
          <Card className="hover:shadow-lg transition-shadow border-emerald-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jogadores</CardTitle>
              <Users className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{stats.players}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">cadastrados</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/rounds">
          <Card className="hover:shadow-lg transition-shadow border-amber-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rodadas</CardTitle>
              <Trophy className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{stats.rounds}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">criadas</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/draws">
          <Card className="hover:shadow-lg transition-shadow border-blue-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sorteios</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{stats.draws}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">realizados</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/prizes">
          <Card className="hover:shadow-lg transition-shadow border-purple-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Premiações</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{stats.winners}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">distribuídas</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Rules */}
      <Card className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Regras do Bolão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">Prêmio Principal - 10 Acertos</h3>
            <p className="text-emerald-50">Ganha quem primeiro completar os 10 acertos acumulativos.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Prêmio 2ª Colocação</h3>
            <p className="text-emerald-50">Ganha quem tiver 9 acertos; não havendo, 8 e assim por diante.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Prêmio Zero Acerto</h3>
            <p className="text-emerald-50">Ganha quem não acertou nenhum número; não havendo, o menor número de acertos.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Resultado do Dia (Bônus)</h3>
            <p className="text-emerald-50">Nos 7 primeiros sorteios, ganha quem fizer mais acertos no resultado do dia.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
