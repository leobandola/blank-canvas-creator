import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Award, TrendingDown, Gift, FileText, Download } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PrizesPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  console.log("[v0] Loading prizes page for round:", params.id)

  // Buscar rodada
  const { data: round } = await supabase.from("rounds").select("*").eq("id", params.id).single()

  if (!round) {
    return <div>Rodada não encontrada</div>
  }

  // Buscar todas as apostas da rodada
  const { data: bets } = await supabase
    .from("bets")
    .select("*, players(name)")
    .eq("round_id", params.id)
    .order("created_at")

  // Buscar todos os sorteios da rodada
  const { data: draws } = await supabase.from("draws").select("*").eq("round_id", params.id).order("draw_date")

  if (!bets || !draws) {
    return <div>Erro ao carregar dados</div>
  }

  console.log("[v0] Total bets:", bets.length)
  console.log("[v0] Total draws:", draws.length)

  // Todos os números sorteados até agora (únicos)
  const allDrawnNumbers = Array.from(new Set(draws.flatMap((d) => d.numbers))).sort((a, b) => a - b)

  console.log("[v0] All drawn numbers:", allDrawnNumbers)

  // Calcular acertos para cada aposta individualmente
  const betResults = bets.map((bet) => {
    const betNumbers = bet.numbers as number[]
    const matchedNumbers = betNumbers.filter((num) => allDrawnNumbers.includes(num))
    const matchCount = matchedNumbers.length

    console.log("[v0] Bet:", bet.players.name, "Numbers:", betNumbers, "Matches:", matchCount)

    return {
      betId: bet.id,
      playerName: bet.players.name,
      betNumbers,
      matchedNumbers,
      matchCount,
    }
  })

  // Ordenar por número de acertos (maior para menor)
  const sortedResults = [...betResults].sort((a, b) => b.matchCount - a.matchCount)

  console.log(
    "[v0] Sorted results:",
    sortedResults.map((r) => ({ name: r.playerName, matches: r.matchCount })),
  )

  // 🏆 PRÊMIO PRINCIPAL (10 acertos)
  const mainWinners = betResults.filter((bet) => bet.matchCount === 10)

  console.log("[v0] Main winners (10 matches):", mainWinners.length)

  // 🥈 2ª COLOCAÇÃO
  // Se há vencedor com 10 acertos, a 2ª colocação é quem tem o maior número de acertos abaixo de 10
  // Se NÃO há vencedor com 10 acertos, NÃO há 2ª colocação (o melhor vai para Prêmio Principal)
  let secondPlaceWinners: typeof betResults = []

  if (mainWinners.length > 0) {
    // Há vencedor com 10 acertos
    const belowTenResults = betResults.filter((bet) => bet.matchCount < 10)
    if (belowTenResults.length > 0) {
      const maxBelow10 = Math.max(...belowTenResults.map((b) => b.matchCount))
      secondPlaceWinners = belowTenResults.filter((bet) => bet.matchCount === maxBelow10)
    }
  }

  console.log("[v0] Second place winners:", secondPlaceWinners.length)

  // 🥉 PRÊMIO ZERO/MENOR PONTUAÇÃO
  const minMatches = Math.min(...betResults.map((b) => b.matchCount))
  const lowestScorers = betResults.filter((bet) => bet.matchCount === minMatches)

  console.log("[v0] Lowest scorers (", minMatches, "matches):", lowestScorers.length)

  // 🎁 BÔNUS DIÁRIO (primeiros 7 sorteios)
  const dailyWinners: { draw: any; winners: typeof betResults }[] = []

  for (let i = 0; i < Math.min(7, draws.length); i++) {
    const draw = draws[i]
    const drawNumbers = draw.numbers as number[]

    // Para cada aposta, calcular acertos APENAS neste sorteio
    const drawResults = bets.map((bet) => {
      const betNumbers = bet.numbers as number[]
      const matchedInDraw = betNumbers.filter((num) => drawNumbers.includes(num))
      return {
        betId: bet.id,
        playerName: bet.players.name,
        betNumbers,
        matchedNumbers: matchedInDraw,
        matchCount: matchedInDraw.length,
      }
    })

    // Encontrar o maior número de acertos neste sorteio
    const maxMatches = Math.max(...drawResults.map((r) => r.matchCount))
    const winners = drawResults.filter((r) => r.matchCount === maxMatches)

    dailyWinners.push({ draw, winners })
  }

  console.log("[v0] Daily winners:", dailyWinners.length)

  // Função para renderizar números com destaque
  const renderNumbers = (betNumbers: number[], matchedNumbers: number[]) => {
    return betNumbers.map((num) => {
      const isMatched = matchedNumbers.includes(num)
      return (
        <Badge
          key={num}
          variant={isMatched ? "default" : "outline"}
          className={isMatched ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-600"}
        >
          {num.toString().padStart(2, "0")}
        </Badge>
      )
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Premiação - {round.name}</h1>
          <p className="text-muted-foreground mt-1">
            {round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"} • {draws.length} sorteio(s)
            realizado(s)
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/rounds/${params.id}/report`}>
              <FileText className="mr-2 h-4 w-4" />
              Relatório Pagamentos
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/rounds/${params.id}/closure`}>
              <FileText className="mr-2 h-4 w-4" />
              Relatório Fechamento
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/prizes/${params.id}/report`}>
              <Download className="mr-2 h-4 w-4" />
              Relatório PDF Premiação
            </Link>
          </Button>
        </div>
      </div>

      {/* Números Sorteados */}
      <Card>
        <CardHeader>
          <CardTitle>Números Sorteados até Agora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allDrawnNumbers.map((num) => (
              <Badge key={num} className="bg-blue-600 text-white">
                {num.toString().padStart(2, "0")}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PRÊMIO PRINCIPAL */}
      <Card className="border-yellow-400 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Prêmio Principal - 10 Acertos
          </CardTitle>
          <CardDescription>
            {mainWinners.length > 0
              ? "Completou os 10 acertos!"
              : `Melhor resultado: ${sortedResults[0]?.matchCount || 0} números`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mainWinners.length > 0 ? (
            mainWinners.map((winner) => (
              <div key={winner.betId} className="space-y-2">
                <h3 className="text-lg font-semibold">{winner.playerName}</h3>
                <p className="text-sm text-muted-foreground">10 acertos em uma única aposta! Parabéns!</p>
                <div className="flex flex-wrap gap-2">{renderNumbers(winner.betNumbers, winner.matchedNumbers)}</div>
              </div>
            ))
          ) : sortedResults.length > 0 ? (
            sortedResults
              .filter((r) => r.matchCount === sortedResults[0].matchCount)
              .map((winner) => (
                <div key={winner.betId} className="space-y-2">
                  <h3 className="text-lg font-semibold">{winner.playerName}</h3>
                  <p className="text-sm text-muted-foreground">{winner.matchCount} acertos nesta aposta</p>
                  <div className="flex flex-wrap gap-2">{renderNumbers(winner.betNumbers, winner.matchedNumbers)}</div>
                </div>
              ))
          ) : (
            <p className="text-muted-foreground">Nenhum vencedor ainda</p>
          )}
        </CardContent>
      </Card>

      {/* 2ª COLOCAÇÃO - Só aparece se há vencedor com 10 acertos */}
      {secondPlaceWinners.length > 0 && (
        <Card className="border-gray-400 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-gray-600" />
              2ª Colocação
            </CardTitle>
            <CardDescription>{secondPlaceWinners[0].matchCount} acertos nesta aposta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {secondPlaceWinners.map((winner) => (
              <div key={winner.betId} className="space-y-2">
                <h3 className="text-lg font-semibold">{winner.playerName}</h3>
                <p className="text-sm text-muted-foreground">{winner.matchCount} acertos nesta aposta</p>
                <div className="flex flex-wrap gap-2">{renderNumbers(winner.betNumbers, winner.matchedNumbers)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PRÊMIO ZERO/MENOR PONTUAÇÃO */}
      <Card className="border-blue-400 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-blue-600" />
            Prêmio Zero Acerto
          </CardTitle>
          <CardDescription>
            {lowestScorers[0].matchCount === 0
              ? "Não acertou nenhum número!"
              : `Pior resultado: ${lowestScorers[0].matchCount} acertos`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lowestScorers.map((winner) => (
            <div key={winner.betId} className="space-y-2">
              <h3 className="text-lg font-semibold">{winner.playerName}</h3>
              <p className="text-sm text-muted-foreground">
                {winner.matchCount} acerto{winner.matchCount !== 1 ? "s" : ""} nesta aposta
              </p>
              <div className="flex flex-wrap gap-2">{renderNumbers(winner.betNumbers, winner.matchedNumbers)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* BÔNUS DIÁRIOS */}
      {dailyWinners.length > 0 && (
        <Card className="border-green-400 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-green-600" />
              Resultado do Dia (Bônus) - Primeiros 7 Sorteios
            </CardTitle>
            <CardDescription>Melhor aposta em cada sorteio individual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dailyWinners.map(({ draw, winners }, index) => (
              <div key={draw.id} className="space-y-3 border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Sorteio #{index + 1}</h4>
                  <div className="flex gap-1">
                    {(draw.numbers as number[]).map((num) => (
                      <Badge key={num} variant="secondary" className="text-xs">
                        {num.toString().padStart(2, "0")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {winners.map((winner) => (
                    <div key={winner.betId} className="flex items-center justify-between">
                      <span className="font-medium">{winner.playerName}</span>
                      <Badge variant="default" className="bg-green-600">
                        {winner.matchCount} acertos
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CLASSIFICAÇÃO GERAL */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação Geral</CardTitle>
          <CardDescription>Todas as apostas individuais ordenadas por acertos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedResults.map((result, index) => (
              <div
                key={result.betId}
                className={`p-4 rounded-lg border ${
                  index === 0
                    ? "bg-yellow-50 border-yellow-400"
                    : index === 1
                      ? "bg-gray-50 border-gray-300"
                      : index === 2
                        ? "bg-orange-50 border-orange-300"
                        : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-muted-foreground">{index + 1}</span>
                      <h3 className="text-lg font-semibold">{result.playerName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Aposta individual</p>
                  </div>
                  <Badge variant="outline" className="text-lg font-bold">
                    {result.matchCount} acertos
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">{renderNumbers(result.betNumbers, result.matchedNumbers)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
