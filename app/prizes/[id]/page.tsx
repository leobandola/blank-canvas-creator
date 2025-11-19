import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal, Award, TrendingDown } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

type LeaderboardEntry = {
  player_id: string;
  player_name: string;
  accumulated_matches: number;
  total_draws: number;
};

export default async function PrizesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUser();

  const { data: round } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", id)
    .single();

  if (!round) {
    notFound();
  }

  const { data: allResults } = await supabase
    .from("results")
    .select(`
      *,
      bet:bets(
        player_id,
        player:players(id, name)
      ),
      draw:draws(round_id)
    `)
    .eq("draw.round_id", id);

  const leaderboardMap = new Map<string, { name: string; total: number; draws: Set<string> }>();
  
  allResults?.forEach((result) => {
    const playerId = result.bet.player_id;
    const playerName = result.bet.player.name;
    
    if (!leaderboardMap.has(playerId)) {
      leaderboardMap.set(playerId, { name: playerName, total: 0, draws: new Set() });
    }
    
    const entry = leaderboardMap.get(playerId)!;
    entry.total += result.matches_count;
    entry.draws.add(result.draw_id);
  });

  const leaderboard: LeaderboardEntry[] = Array.from(leaderboardMap.entries())
    .map(([player_id, data]) => ({
      player_id,
      player_name: data.name,
      accumulated_matches: data.total,
      total_draws: data.draws.size,
    }))
    .sort((a, b) => b.accumulated_matches - a.accumulated_matches);

  const mainWinner = leaderboard.find(entry => entry.accumulated_matches >= 10);
  const secondPlace = !mainWinner ? leaderboard[0] : null;
  const zeroHitsWinner = leaderboard.find(entry => entry.accumulated_matches === 0);
  const lowestHitsWinner = !zeroHitsWinner && leaderboard.length > 0 
    ? leaderboard[leaderboard.length - 1] 
    : null;

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .eq("round_id", id)
    .order("draw_number", { ascending: true })
    .limit(7);

  const dailyWinners = [];
  for (const draw of draws || []) {
    const { data: dayResults } = await supabase
      .from("results")
      .select(`
        *,
        bet:bets(
          player:players(name)
        )
      `)
      .eq("draw_id", draw.id)
      .order("matches_count", { ascending: false })
      .limit(1);

    if (dayResults && dayResults.length > 0 && dayResults[0].matches_count > 0) {
      dailyWinners.push({
        drawNumber: draw.draw_number,
        playerName: dayResults[0].bet.player.name,
        matches: dayResults[0].matches_count,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4">
            <UserNav user={user} />
          </div>
        )}

        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/prizes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Premiações
            </Link>
          </Button>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-3xl mb-3">{round.name}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={round.status === "active" ? "default" : "secondary"}
                  className={round.status === "active" ? "bg-purple-600" : ""}
                >
                  {round.status === "active" ? "Ativa" : "Finalizada"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {round.lottery_type === "quina" ? "Quina" : "Mega Sena"}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 mb-8">
          {mainWinner && (
            <Card className="bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-amber-900">
                  <Trophy className="h-8 w-8 text-amber-600" />
                  Prêmio Principal - 10 Acertos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-900 mb-2">
                  {mainWinner.player_name}
                </div>
                <div className="text-lg text-amber-800">
                  {mainWinner.accumulated_matches} acertos acumulados em{" "}
                  {mainWinner.total_draws} {mainWinner.total_draws === 1 ? "sorteio" : "sorteios"}
                </div>
              </CardContent>
            </Card>
          )}

          {secondPlace && !mainWinner && (
            <Card className="bg-gradient-to-r from-slate-100 to-gray-100 border-slate-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                  <Medal className="h-8 w-8 text-slate-600" />
                  2ª Colocação - Maior Número de Acertos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {secondPlace.player_name}
                </div>
                <div className="text-lg text-slate-800">
                  {secondPlace.accumulated_matches} acertos acumulados em{" "}
                  {secondPlace.total_draws} {secondPlace.total_draws === 1 ? "sorteio" : "sorteios"}
                </div>
              </CardContent>
            </Card>
          )}

          {(zeroHitsWinner || lowestHitsWinner) && (
            <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-blue-900">
                  <TrendingDown className="h-8 w-8 text-blue-600" />
                  Prêmio Zero Acerto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  {zeroHitsWinner?.player_name || lowestHitsWinner?.player_name}
                </div>
                <div className="text-lg text-blue-800">
                  {zeroHitsWinner 
                    ? "0 acertos - Não acertou nenhum número!"
                    : `${lowestHitsWinner?.accumulated_matches} acertos - Menor número de acertos`
                  }
                </div>
              </CardContent>
            </Card>
          )}

          {dailyWinners.length > 0 && (
            <Card className="bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-emerald-900">
                  <Award className="h-8 w-8 text-emerald-600" />
                  Resultado do Dia (Bônus) - Primeiros 7 Sorteios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyWinners.map((winner) => (
                    <div
                      key={winner.drawNumber}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200"
                    >
                      <div>
                        <span className="font-semibold text-emerald-900">
                          Sorteio #{winner.drawNumber}
                        </span>
                        <span className="text-emerald-800 ml-2">- {winner.playerName}</span>
                      </div>
                      <Badge className="bg-emerald-600 text-lg px-3 py-1">
                        {winner.matches} {winner.matches === 1 ? "acerto" : "acertos"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Classificação Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.player_id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0
                      ? "bg-amber-50 border-amber-200"
                      : index === 1
                      ? "bg-slate-50 border-slate-200"
                      : index === 2
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-muted-foreground w-8">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{entry.player_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.total_draws} {entry.total_draws === 1 ? "sorteio" : "sorteios"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                    {entry.accumulated_matches} {entry.accumulated_matches === 1 ? "acerto" : "acertos"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
