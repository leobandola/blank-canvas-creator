import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Trophy, Medal, Award, TrendingDown } from "lucide-react"
import { notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"

type BetLeaderboardEntry = {
  bet_id: string
  player_id: string
  player_name: string
  bet_number: number // Jogo 1, Jogo 2, etc do jogador
  accumulated_matches: number
  total_draws: number
}

export default async function PrizesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getUser()

  const { data: round } = await supabase.from("rounds").select("*").eq("id", id).single()

  if (!round) {
    notFound()
  }

  const { data: allResults } = await supabase
    .from("results")
    .select(`
      *,
      bet:bets(
        id,
        player_id,
        player:players(id, name)
      ),
      draw:draws(round_id)
    `)
    .eq("draw.round_id", id)

  const betAccumulatedMap = new Map<
    string,
    {
      betId: string
      playerId: string
      playerName: string
      totalMatches: number
      drawsParticipated: Set<string>
    }
  >()

  allResults?.forEach((result) => {
    const betId = result.bet.id
    const playerId = result.bet.player_id
    const playerName = result.bet.player.name

    if (!betAccumulatedMap.has(betId)) {
      betAccumulatedMap.set(betId, {
        betId,
        playerId,
        playerName,
        totalMatches: 0,
        drawsParticipated: new Set(),
      })
    }

    const entry = betAccumulatedMap.get(betId)!
    entry.totalMatches += result.matches_count
    entry.drawsParticipated.add(result.draw_id)
  })

  const playerBetsMap = new Map<string, string[]>()
  betAccumulatedMap.forEach((entry, betId) => {
    if (!playerBetsMap.has(entry.playerId)) {
      playerBetsMap.set(entry.playerId, [])
    }
    playerBetsMap.get(entry.playerId)!.push(betId)
  })

  const leaderboard: BetLeaderboardEntry[] = []
  betAccumulatedMap.forEach((entry) => {
    const playerBets = playerBetsMap.get(entry.playerId)!
    const betNumber = playerBets.indexOf(entry.betId) + 1

    leaderboard.push({
      bet_id: entry.betId,
      player_id: entry.playerId,
      player_name: entry.playerName,
      bet_number: betNumber,
      accumulated_matches: entry.totalMatches,
      total_draws: entry.drawsParticipated.size,
    })
  })

  // Ordenar por acertos acumulados
  leaderboard.sort((a, b) => b.accumulated_matches - a.accumulated_matches)

  const mainWinner = leaderboard.find((entry) => entry.accumulated_matches >= 10)
  const secondPlace = !mainWinner && leaderboard.length > 0 ? leaderboard[0] : null
  const zeroHitsWinner = leaderboard.find((entry) => entry.accumulated_matches === 0)
  const lowestHitsWinner = !zeroHitsWinner && leaderboard.length > 0 ? leaderboard[leaderboard.length - 1] : null

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .eq("round_id", id)
    .order("draw_number", { ascending: true })
    .limit(7)

  const dailyWinners = []
  for (const draw of draws || []) {
    const { data: dayResults } = await supabase
      .from("results")
      .select(`
        *,
        bet:bets(
          id,
          player:players(name)
        )
      `)
      .eq("draw_id", draw.id)
      .order("matches_count", { ascending: false })

    if (dayResults && dayResults.length > 0 && dayResults[0].matches_count > 0) {
      // Encontrar todas as apostas com o maior número de acertos
      const maxMatches = dayResults[0].matches_count
      const winners = dayResults.filter((r) => r.matches_count === maxMatches)

      dailyWinners.push({
        drawNumber: draw.draw_number,
        winners: winners.map((w) => ({
          playerName: w.bet.player.name,
          betId: w.bet.id,
        })),
        matches: maxMatches,
      })
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
              <p className="text-sm text-muted-foreground mt-2">
                Cada aposta é contada individualmente. Jogadores com múltiplas apostas têm cada jogo contabilizado
                separadamente.
              </p>
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
                  {playerBetsMap.get(mainWinner.player_id)!.length > 1 && (
                    <span className="text-lg font-normal ml-2">(Jogo {mainWinner.bet_number})</span>
                  )}
                </div>
                <div className="text-lg text-amber-800">
                  {mainWinner.accumulated_matches} acertos acumulados em {mainWinner.total_draws}{" "}
                  {mainWinner.total_draws === 1 ? "sorteio" : "sorteios"}
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
                  {playerBetsMap.get(secondPlace.player_id)!.length > 1 && (
                    <span className="text-lg font-normal ml-2">(Jogo {secondPlace.bet_number})</span>
                  )}
                </div>
                <div className="text-lg text-slate-800">
                  {secondPlace.accumulated_matches} acertos acumulados em {secondPlace.total_draws}{" "}
                  {secondPlace.total_draws === 1 ? "sorteio" : "sorteios"}
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
                  {(zeroHitsWinner || lowestHitsWinner) &&
                    playerBetsMap.get((zeroHitsWinner || lowestHitsWinner)!.player_id)!.length > 1 && (
                      <span className="text-lg font-normal ml-2">
                        (Jogo {(zeroHitsWinner || lowestHitsWinner)!.bet_number})
                      </span>
                    )}
                </div>
                <div className="text-lg text-blue-800">
                  {zeroHitsWinner
                    ? "0 acertos - Não acertou nenhum número!"
                    : `${lowestHitsWinner?.accumulated_matches} acertos - Menor número de acertos`}
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
                        <span className="font-semibold text-emerald-900">Sorteio #{winner.drawNumber}</span>
                        <span className="text-emerald-800 ml-2">
                          - {winner.winners.map((w) => w.playerName).join(", ")}
                        </span>
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
            <CardTitle className="text-2xl">Classificação Geral por Aposta</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cada linha representa uma aposta individual. Jogadores com múltiplos jogos aparecem várias vezes.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const hasMultipleBets = playerBetsMap.get(entry.player_id)!.length > 1
                return (
                  <div
                    key={entry.bet_id}
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
                      <div className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</div>
                      <div>
                        <p className="font-semibold text-lg">
                          {entry.player_name}
                          {hasMultipleBets && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Jogo {entry.bet_number}
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.total_draws} {entry.total_draws === 1 ? "sorteio" : "sorteios"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                      {entry.accumulated_matches} {entry.accumulated_matches === 1 ? "acerto" : "acertos"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
