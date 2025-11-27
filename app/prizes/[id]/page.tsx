import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Medal, Award, TrendingDown, FileText, Download } from "lucide-react"

type BetResult = {
  bet_id: string
  player_id: string
  player_name: string
  bet_numbers: number[]
  matched_numbers: number[]
  total_matches: number
}

export default async function PrizesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: round } = await supabase.from("rounds").select("*").eq("id", id).single()

  if (!round) {
    notFound()
  }

  const { data: bets } = await supabase
    .from("bets")
    .select(`
      id,
      player_id,
      numbers,
      player:players(id, name)
    `)
    .eq("round_id", id)

  const { data: draws } = await supabase
    .from("draws")
    .select("id, draw_number, numbers, draw_date")
    .eq("round_id", id)
    .order("draw_number", { ascending: true })

  const allDrawnNumbers = new Set<number>()
  draws?.forEach((draw) => {
    const drawNumbers = draw.numbers as number[]
    drawNumbers.forEach((n) => allDrawnNumbers.add(n))
  })

  const betResults: BetResult[] = []

  bets?.forEach((bet) => {
    const betNumbers = bet.numbers as number[]
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

  betResults.sort((a, b) => {
    if (b.total_matches !== a.total_matches) {
      return b.total_matches - a.total_matches
    }
    return a.player_name.localeCompare(b.player_name)
  })

  const playerBetCount = new Map<string, number>()
  betResults.forEach((bet) => {
    playerBetCount.set(bet.player_id, (playerBetCount.get(bet.player_id) || 0) + 1)
  })

  const playerBetIndex = new Map<string, number>()
  const getBetNumber = (playerId: string) => {
    const current = (playerBetIndex.get(playerId) || 0) + 1
    playerBetIndex.set(playerId, current)
    return current
  }

  // Prêmio Principal: quem tem 10 acertos
  const winnersWithTen = betResults.filter((b) => b.total_matches === 10)

  // Se não há ninguém com 10, o prêmio principal vai para quem tem mais acertos
  const topScore = betResults.length > 0 ? betResults[0].total_matches : 0
  const topWinners = winnersWithTen.length > 0 ? winnersWithTen : betResults.filter((b) => b.total_matches === topScore)

  // Nesse caso, pega o segundo melhor score
  let secondPlaceWinners: BetResult[] = []
  if (winnersWithTen.length > 0) {
    const remainingBets = betResults.filter((b) => b.total_matches < 10)
    if (remainingBets.length > 0) {
      const secondScore = remainingBets[0].total_matches
      secondPlaceWinners = remainingBets.filter((b) => b.total_matches === secondScore)
    }
  }

  const bottomScore = betResults.length > 0 ? betResults[betResults.length - 1].total_matches : 0
  const bottomWinners = betResults.filter((b) => b.total_matches === bottomScore)

  const dailyWinners: { drawNumber: number; winners: { name: string; matches: number }[] }[] = []

  for (const draw of (draws || []).slice(0, 7)) {
    const drawNumbers = draw.numbers as number[]

    const drawResults =
      bets?.map((bet) => {
        const betNumbers = bet.numbers as number[]
        const matchesInDraw = betNumbers.filter((n) => drawNumbers.includes(n))
        return {
          playerName: (bet.player as any).name,
          matches: matchesInDraw.length,
        }
      }) || []

    drawResults.sort((a, b) => b.matches - a.matches)

    if (drawResults.length > 0 && drawResults[0].matches > 0) {
      const maxMatches = drawResults[0].matches
      const winners = drawResults.filter((r) => r.matches === maxMatches)

      dailyWinners.push({
        drawNumber: draw.draw_number,
        winners: winners.map((w) => ({ name: w.playerName, matches: w.matches })),
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/prizes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{round.name}</h1>
            <p className="text-gray-600">
              {round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"} • {draws?.length || 0} sorteios
              realizados
            </p>
          </div>
        </div>

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
              Premiação PDF
            </Link>
          </Button>
        </div>
      </div>

      {allDrawnNumbers.size > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Números Já Sorteados ({allDrawnNumbers.size})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(allDrawnNumbers)
                .sort((a, b) => a - b)
                .map((num) => (
                  <span
                    key={num}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
                  >
                    {num.toString().padStart(2, "0")}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 mb-8">
        {/* Prêmio Principal */}
        {topWinners.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-amber-900">
                <Trophy className="h-8 w-8 text-amber-600" />
                {winnersWithTen.length > 0
                  ? "Prêmio Principal - 10 Acertos"
                  : "Prêmio Principal - Maior Número de Acertos"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topWinners.map((winner, idx) => {
                  const betNumber = getBetNumber(winner.player_id)
                  const hasMultipleBets = (playerBetCount.get(winner.player_id) || 0) > 1

                  return (
                    <div key={winner.bet_id} className={idx > 0 ? "pt-4 border-t border-amber-300" : ""}>
                      <div className="text-3xl font-bold text-amber-900 mb-2">
                        {winner.player_name}
                        {hasMultipleBets && <span className="text-xl text-amber-700 ml-2">(Jogo {betNumber})</span>}
                      </div>
                      <div className="text-lg text-amber-800 mb-3">
                        {winner.total_matches === 10
                          ? "Completou os 10 números!"
                          : `${winner.total_matches} números acertados de 10`}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {winner.bet_numbers.map((num) => (
                          <span
                            key={num}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              winner.matched_numbers.includes(num)
                                ? "bg-green-500 text-white"
                                : "bg-amber-200 text-amber-800"
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
        )}

        {secondPlaceWinners.length > 0 && (
          <Card className="bg-gradient-to-r from-slate-100 to-gray-100 border-slate-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                <Medal className="h-8 w-8 text-slate-600" />
                2ª Colocação - {secondPlaceWinners[0].total_matches} Acertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {secondPlaceWinners.map((winner, idx) => {
                  const betNumber = getBetNumber(winner.player_id)
                  const hasMultipleBets = (playerBetCount.get(winner.player_id) || 0) > 1

                  return (
                    <div key={winner.bet_id} className={idx > 0 ? "pt-4 border-t border-slate-300" : ""}>
                      <div className="text-3xl font-bold text-slate-900 mb-2">
                        {winner.player_name}
                        {hasMultipleBets && <span className="text-xl text-slate-700 ml-2">(Jogo {betNumber})</span>}
                      </div>
                      <div className="text-lg text-slate-800 mb-3">{winner.total_matches} números acertados de 10</div>
                      <div className="flex flex-wrap gap-2">
                        {winner.bet_numbers.map((num) => (
                          <span
                            key={num}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              winner.matched_numbers.includes(num)
                                ? "bg-green-500 text-white"
                                : "bg-slate-200 text-slate-800"
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
        )}

        {bottomWinners.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-blue-900">
                <TrendingDown className="h-8 w-8 text-blue-600" />
                Prêmio Zero Acerto / Menor Pontuação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bottomWinners.map((winner, idx) => {
                  const betNumber = getBetNumber(winner.player_id)
                  const hasMultipleBets = (playerBetCount.get(winner.player_id) || 0) > 1

                  return (
                    <div key={winner.bet_id} className={idx > 0 ? "pt-4 border-t border-blue-300" : ""}>
                      <div className="text-3xl font-bold text-blue-900 mb-2">
                        {winner.player_name}
                        {hasMultipleBets && <span className="text-xl text-blue-700 ml-2">(Jogo {betNumber})</span>}
                      </div>
                      <div className="text-lg text-blue-800 mb-3">
                        {winner.total_matches === 0
                          ? "0 acertos - Não acertou nenhum número!"
                          : `${winner.total_matches} acertos - Menor número de acertos`}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {winner.bet_numbers.map((num) => (
                          <span
                            key={num}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              winner.matched_numbers.includes(num)
                                ? "bg-green-500 text-white"
                                : "bg-blue-200 text-blue-800"
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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Classificação Geral por Aposta</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Cada aposta de 10 números é avaliada individualmente. Verde = número acertado.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {betResults.map((result, index) => {
              playerBetIndex.set(result.player_id, 0) // Reset
            })}
            {betResults.map((result, index) => {
              const betNumber = getBetNumber(result.player_id)
              const hasMultipleBets = (playerBetCount.get(result.player_id) || 0) > 1

              return (
                <div
                  key={result.bet_id}
                  className={`p-4 rounded-lg border ${
                    index === 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400 w-8">{index + 1}º</span>
                      <div>
                        <span className="text-lg font-semibold">{result.player_name}</span>
                        {hasMultipleBets && <span className="text-sm text-gray-500 ml-2">(Jogo {betNumber})</span>}
                      </div>
                    </div>
                    <Badge variant={result.total_matches >= 10 ? "default" : "secondary"} className="text-lg px-4 py-1">
                      {result.total_matches}/10 acertos
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-11">
                    {result.bet_numbers.map((num) => (
                      <span
                        key={num}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          result.matched_numbers.includes(num) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
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
  )
}
