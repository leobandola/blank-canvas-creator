import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Trophy, Medal, Award, TrendingDown } from "lucide-react"
import { notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"

type BetWithDetails = {
  bet_id: string
  player_id: string
  player_name: string
  numbers: number[]
  matched_numbers: number[] // Números que acertou (união de todos os sorteios)
  total_matches: number // Total de números únicos acertados
  draws_participated: number
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

  // Buscar todas as apostas da rodada com os números
  const { data: bets } = await supabase
    .from("bets")
    .select(`
      id,
      player_id,
      numbers,
      player:players(id, name)
    `)
    .eq("round_id", id)

  // Buscar todos os sorteios da rodada
  const { data: draws } = await supabase
    .from("draws")
    .select("id, draw_number, numbers")
    .eq("round_id", id)
    .order("draw_number", { ascending: true })

  // Calcular acertos por aposta - contando números únicos acertados
  const betsWithDetails: BetWithDetails[] = []

  bets?.forEach((bet) => {
    const betNumbers = bet.numbers as number[]
    const allMatchedNumbers = new Set<number>()
    let drawsParticipated = 0

    // Para cada sorteio, verificar quais números da aposta foram sorteados
    draws?.forEach((draw) => {
      const drawNumbers = draw.numbers as number[]
      const matchesInDraw = betNumbers.filter((n) => drawNumbers.includes(n))

      if (matchesInDraw.length > 0 || draws) {
        drawsParticipated++
      }

      // Adicionar números acertados ao set (não duplica)
      matchesInDraw.forEach((n) => allMatchedNumbers.add(n))
    })

    betsWithDetails.push({
      bet_id: bet.id,
      player_id: bet.player_id,
      player_name: (bet.player as any).name,
      numbers: betNumbers,
      matched_numbers: Array.from(allMatchedNumbers).sort((a, b) => a - b),
      total_matches: allMatchedNumbers.size,
      draws_participated: draws?.length || 0,
    })
  })

  // Ordenar por total de acertos (números únicos acertados)
  betsWithDetails.sort((a, b) => b.total_matches - a.total_matches)

  // Determinar vencedores
  const mainWinner = betsWithDetails.find((b) => b.total_matches >= 10)
  const secondPlace = !mainWinner && betsWithDetails.length > 0 ? betsWithDetails[0] : null
  const zeroHitsWinner = betsWithDetails.find((b) => b.total_matches === 0)
  const lowestHitsWinner =
    !zeroHitsWinner && betsWithDetails.length > 0 ? betsWithDetails[betsWithDetails.length - 1] : null

  // Calcular vencedores do dia (bonus dos primeiros 7 sorteios)
  const dailyWinners = []
  for (const draw of (draws || []).slice(0, 7)) {
    const drawNumbers = draw.numbers as number[]

    // Calcular acertos de cada aposta neste sorteio específico
    const drawResults =
      bets?.map((bet) => {
        const betNumbers = bet.numbers as number[]
        const matchesInDraw = betNumbers.filter((n) => drawNumbers.includes(n))
        return {
          betId: bet.id,
          playerName: (bet.player as any).name,
          matches: matchesInDraw.length,
          matchedNumbers: matchesInDraw,
        }
      }) || []

    // Ordenar por acertos e pegar o maior
    drawResults.sort((a, b) => b.matches - a.matches)

    if (drawResults.length > 0 && drawResults[0].matches > 0) {
      const maxMatches = drawResults[0].matches
      const winners = drawResults.filter((r) => r.matches === maxMatches)

      dailyWinners.push({
        drawNumber: draw.draw_number,
        winners: winners.map((w) => w.playerName),
        matches: maxMatches,
      })
    }
  }

  // Contar quantos jogos cada jogador tem
  const playerBetCount = new Map<string, number>()
  betsWithDetails.forEach((bet) => {
    const count = playerBetCount.get(bet.player_id) || 0
    playerBetCount.set(bet.player_id, count + 1)
  })

  // Atribuir número do jogo para cada aposta do jogador
  const playerBetIndex = new Map<string, number>()
  const getBetNumber = (playerId: string) => {
    const current = (playerBetIndex.get(playerId) || 0) + 1
    playerBetIndex.set(playerId, current)
    return current
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
                <Badge variant="outline">{draws?.length || 0} sorteios realizados</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                A pontuação é calculada contando os números únicos acertados de cada aposta ao longo de todos os
                sorteios. Cada número só conta uma vez, mesmo que seja sorteado múltiplas vezes.
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Prêmios */}
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
                <div className="text-3xl font-bold text-amber-900 mb-2">{mainWinner.player_name}</div>
                <div className="text-lg text-amber-800 mb-3">Completou os 10 números!</div>
                <div className="flex flex-wrap gap-2">
                  {mainWinner.numbers.map((num) => (
                    <span
                      key={num}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        mainWinner.matched_numbers.includes(num)
                          ? "bg-green-500 text-white"
                          : "bg-amber-200 text-amber-800"
                      }`}
                    >
                      {num.toString().padStart(2, "0")}
                    </span>
                  ))}
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
                <div className="text-3xl font-bold text-slate-900 mb-2">{secondPlace.player_name}</div>
                <div className="text-lg text-slate-800 mb-3">{secondPlace.total_matches} números acertados de 10</div>
                <div className="flex flex-wrap gap-2">
                  {secondPlace.numbers.map((num) => (
                    <span
                      key={num}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        secondPlace.matched_numbers.includes(num)
                          ? "bg-green-500 text-white"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {num.toString().padStart(2, "0")}
                    </span>
                  ))}
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
                <div className="text-lg text-blue-800 mb-3">
                  {zeroHitsWinner
                    ? "0 acertos - Não acertou nenhum número!"
                    : `${lowestHitsWinner?.total_matches} acertos - Menor número de acertos`}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(zeroHitsWinner || lowestHitsWinner)?.numbers.map((num) => (
                    <span
                      key={num}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        (zeroHitsWinner || lowestHitsWinner)?.matched_numbers.includes(num)
                          ? "bg-green-500 text-white"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {num.toString().padStart(2, "0")}
                    </span>
                  ))}
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
                        <span className="text-emerald-800 ml-2">- {winner.winners.join(", ")}</span>
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

        {/* Classificação Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Classificação Geral por Aposta</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cada aposta é mostrada individualmente com os números jogados.
              <span className="inline-flex items-center gap-1 ml-1">
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
                <span>= números acertados</span>
              </span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {betsWithDetails.map((entry, index) => {
                const betNumber = getBetNumber(entry.player_id)
                const hasMultipleBets = (playerBetCount.get(entry.player_id) || 0) > 1

                return (
                  <div
                    key={entry.bet_id}
                    className={`p-4 rounded-lg border ${
                      index === 0
                        ? "bg-amber-50 border-amber-200"
                        : index === 1
                          ? "bg-slate-50 border-slate-200"
                          : index === 2
                            ? "bg-orange-50 border-orange-200"
                            : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</div>
                        <div>
                          <p className="font-semibold text-lg">
                            {entry.player_name}
                            {hasMultipleBets && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Jogo {betNumber}
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.draws_participated} {entry.draws_participated === 1 ? "sorteio" : "sorteios"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-lg px-4 py-2 font-mono ${
                          entry.total_matches >= 10 ? "bg-green-100 border-green-500 text-green-700" : ""
                        }`}
                      >
                        {entry.total_matches}/10 acertos
                      </Badge>
                    </div>

                    {/* Números do jogo */}
                    <div className="flex flex-wrap gap-2 ml-12">
                      {entry.numbers
                        .sort((a, b) => a - b)
                        .map((num) => (
                          <span
                            key={num}
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                              entry.matched_numbers.includes(num)
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {num.toString().padStart(2, "0")}
                          </span>
                        ))}
                    </div>
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
