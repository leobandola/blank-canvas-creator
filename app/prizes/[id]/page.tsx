import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Trophy, Medal, Award, TrendingDown, FileText, Download } from "lucide-react"
import { notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"

type BetResult = {
  bet_id: string
  player_id: string
  player_name: string
  bet_numbers: number[]
  matched_numbers: number[]
  total_matches: number
}

export default async function PrizesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getUser()

  const { data: round } = await supabase.from("rounds").select("*").eq("id", id).single()

  if (!round) {
    notFound()
  }

  // Buscar todas as apostas da rodada
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

  // Coletar todos os números que já foram sorteados
  const allDrawnNumbers = new Set<number>()
  draws?.forEach((draw) => {
    const drawNumbers = draw.numbers as number[]
    drawNumbers.forEach((n) => allDrawnNumbers.add(n))
  })

  // Calcular resultado de CADA APOSTA INDIVIDUALMENTE
  const betResults: BetResult[] = []

  bets?.forEach((bet) => {
    const betNumbers = bet.numbers as number[]
    // Números acertados = interseção entre números apostados e todos os números sorteados
    const matchedNumbers = betNumbers.filter((n) => allDrawnNumbers.has(n))

    betResults.push({
      bet_id: bet.id,
      player_id: bet.player_id,
      player_name: (bet.player as any).name,
      bet_numbers: betNumbers.sort((a, b) => a - b),
      matched_numbers: matchedNumbers.sort((a, b) => a - b),
      total_matches: matchedNumbers.length,
    })
  })

  // Ordenar por número de acertos (maior para menor), depois por nome
  betResults.sort((a, b) => {
    if (b.total_matches !== a.total_matches) {
      return b.total_matches - a.total_matches
    }
    return a.player_name.localeCompare(b.player_name)
  })

  // Contar quantas apostas cada jogador tem
  const playerBetCount = new Map<string, number>()
  const playerBetIndex = new Map<string, number>()
  betResults.forEach((bet) => {
    playerBetCount.set(bet.player_id, (playerBetCount.get(bet.player_id) || 0) + 1)
  })

  const getBetNumber = (playerId: string) => {
    const current = (playerBetIndex.get(playerId) || 0) + 1
    playerBetIndex.set(playerId, current)
    return current
  }

  // Determinar vencedores
  const mainWinner = betResults.find((b) => b.total_matches >= 10)
  const topBet = betResults.length > 0 ? betResults[0] : null
  const bottomBet = betResults.length > 0 ? betResults[betResults.length - 1] : null
  const zeroHitsBet = betResults.find((b) => b.total_matches === 0)

  // Vencedores diários (primeiros 7 sorteios)
  const dailyWinners: { drawNumber: number; winners: { name: string; matches: number; matchedNumbers: number[] }[] }[] =
    []

  for (const draw of (draws || []).slice(0, 7)) {
    const drawNumbers = draw.numbers as number[]

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

    drawResults.sort((a, b) => b.matches - a.matches)

    if (drawResults.length > 0 && drawResults[0].matches > 0) {
      const maxMatches = drawResults[0].matches
      const winners = drawResults.filter((r) => r.matches === maxMatches)

      dailyWinners.push({
        drawNumber: draw.draw_number,
        winners: winners.map((w) => ({
          name: w.playerName,
          matches: w.matches,
          matchedNumbers: w.matchedNumbers,
        })),
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <Button asChild variant="ghost">
              <Link href="/prizes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Premiações
              </Link>
            </Button>

            {/* Botões de Relatório */}
            <div className="flex gap-2 flex-wrap">
              <Button asChild variant="outline" size="sm">
                <Link href={`/rounds/${id}/report`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Pagamentos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/rounds/${id}/closure`}>
                  <Download className="h-4 w-4 mr-2" />
                  Fechamento
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Link href={`/prizes/${id}/report`}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Premiação
                </Link>
              </Button>
            </div>
          </div>

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
                  {round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"}
                </Badge>
                <Badge variant="outline">{draws?.length || 0} sorteios realizados</Badge>
                <Badge variant="outline">{betResults.length} apostas</Badge>
              </div>

              {/* Números já sorteados */}
              {allDrawnNumbers.size > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Números sorteados até agora ({allDrawnNumbers.size} números únicos):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(allDrawnNumbers)
                      .sort((a, b) => a - b)
                      .map((num) => (
                        <span
                          key={num}
                          className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs"
                        >
                          {num.toString().padStart(2, "0")}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Prêmios */}
        <div className="grid gap-6 mb-8">
          {/* Prêmio Principal - 10 Acertos */}
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
                  {mainWinner.bet_numbers.map((num) => (
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

          {/* 2ª Colocação */}
          {topBet && !mainWinner && (
            <Card className="bg-gradient-to-r from-slate-100 to-gray-100 border-slate-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                  <Medal className="h-8 w-8 text-slate-600" />
                  2ª Colocação - Maior Número de Acertos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-2">{topBet.player_name}</div>
                <div className="text-lg text-slate-800 mb-3">{topBet.total_matches} números acertados de 10</div>
                <div className="flex flex-wrap gap-2">
                  {topBet.bet_numbers.map((num) => (
                    <span
                      key={num}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        topBet.matched_numbers.includes(num) ? "bg-green-500 text-white" : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {num.toString().padStart(2, "0")}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prêmio Zero Acerto */}
          {(zeroHitsBet || bottomBet) && (
            <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-blue-900">
                  <TrendingDown className="h-8 w-8 text-blue-600" />
                  Prêmio Zero Acerto / Menor Pontuação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  {zeroHitsBet?.player_name || bottomBet?.player_name}
                </div>
                <div className="text-lg text-blue-800 mb-3">
                  {zeroHitsBet
                    ? "0 acertos - Não acertou nenhum número!"
                    : `${bottomBet?.total_matches} acertos - Menor número de acertos`}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(zeroHitsBet || bottomBet)?.bet_numbers.map((num) => (
                    <span
                      key={num}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        (zeroHitsBet || bottomBet)?.matched_numbers.includes(num)
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

          {/* Bônus Diários */}
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
                        <span className="text-emerald-800 ml-2">- {winner.winners.map((w) => w.name).join(", ")}</span>
                      </div>
                      <Badge className="bg-emerald-600 text-lg px-3 py-1">
                        {winner.winners[0].matches} {winner.winners[0].matches === 1 ? "acerto" : "acertos"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Classificação Geral por APOSTA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Classificação Geral por Aposta</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cada aposta de 10 números é avaliada individualmente.
              <span className="inline-flex items-center gap-1 ml-2">
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
                <span>= número acertado</span>
              </span>
              <span className="inline-flex items-center gap-1 ml-2">
                <span className="w-4 h-4 rounded-full bg-gray-200 border border-gray-300"></span>
                <span>= não sorteado</span>
              </span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {betResults.map((bet, index) => {
                const betNumber = getBetNumber(bet.player_id)
                const hasMultipleBets = (playerBetCount.get(bet.player_id) || 0) > 1

                return (
                  <div
                    key={bet.bet_id}
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
                        <div
                          className={`text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-amber-500 text-white"
                              : index === 1
                                ? "bg-slate-400 text-white"
                                : index === 2
                                  ? "bg-orange-400 text-white"
                                  : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {bet.player_name}
                            {hasMultipleBets && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Jogo {betNumber}
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-lg px-4 py-2 font-mono ${
                          bet.total_matches >= 10
                            ? "bg-green-100 border-green-500 text-green-700"
                            : bet.total_matches >= 7
                              ? "bg-amber-100 border-amber-500 text-amber-700"
                              : ""
                        }`}
                      >
                        {bet.total_matches}/10
                      </Badge>
                    </div>

                    {/* Números do jogo */}
                    <div className="flex flex-wrap gap-2 ml-14">
                      {bet.bet_numbers.map((num) => (
                        <span
                          key={num}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            bet.matched_numbers.includes(num)
                              ? "bg-green-500 text-white shadow-md ring-2 ring-green-300"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {num.toString().padStart(2, "0")}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}

              {betResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Nenhuma aposta cadastrada nesta rodada.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
