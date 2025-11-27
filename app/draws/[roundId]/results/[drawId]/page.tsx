import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Trophy, Target, FileText } from "lucide-react"
import { notFound } from "next/navigation"

export default async function DrawResultsPage({
  params,
}: {
  params: Promise<{ roundId: string; drawId: string }>
}) {
  const { roundId, drawId } = await params
  const supabase = await createClient()

  const { data: draw } = await supabase.from("draws").select("*").eq("id", drawId).single()

  if (!draw) {
    notFound()
  }

  const { data: results } = await supabase
    .from("results")
    .select(`
      *,
      bet:bets(
        id,
        numbers,
        player:players(id, name)
      )
    `)
    .eq("draw_id", drawId)
    .order("matches_count", { ascending: false })

  const resultsByPlayer = new Map<
    string,
    Array<{
      betId: string
      betNumbers: number[]
      matchesCount: number
      matchedNumbers: number[]
      playerName: string
    }>
  >()

  results?.forEach((result) => {
    const playerId = result.bet.player.id
    const playerName = result.bet.player.name

    if (!resultsByPlayer.has(playerId)) {
      resultsByPlayer.set(playerId, [])
    }

    resultsByPlayer.get(playerId)!.push({
      betId: result.bet.id,
      betNumbers: result.bet.numbers,
      matchesCount: result.matches_count,
      matchedNumbers: result.matched_numbers || [],
      playerName: playerName,
    })
  })

  const sortedPlayers = Array.from(resultsByPlayer.entries())
    .map(([playerId, bets]) => {
      const maxMatches = Math.max(...bets.map((b) => b.matchesCount))
      return {
        playerId,
        playerName: bets[0].playerName,
        bets: bets.sort((a, b) => b.matchesCount - a.matchesCount),
        maxMatches,
      }
    })
    .sort((a, b) => b.maxMatches - a.maxMatches)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="ghost">
              <Link href={`/draws/${roundId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Sorteios
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/draws/${roundId}/results/${drawId}/detailed`}>
                <FileText className="h-4 w-4 mr-2" />
                Relatório Detalhado
              </Link>
            </Button>
          </div>

          <Card className="border-blue-200 bg-gradient-to-r from-blue-100 to-emerald-100">
            <CardHeader>
              <CardTitle className="text-3xl mb-3">Resultado do Sorteio #{draw.draw_number}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                {draw.numbers
                  .sort((a: number, b: number) => a - b)
                  .map((num: number) => (
                    <Badge key={num} variant="default" className="bg-blue-600 text-xl px-4 py-2 font-mono">
                      {num.toString().padStart(2, "0")}
                    </Badge>
                  ))}
              </div>
              <p className="text-muted-foreground">Data: {new Date(draw.draw_date).toLocaleDateString("pt-BR")}</p>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Resultados por Jogador e Aposta
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Cada aposta é contada separadamente. A pontuação é individual por jogo.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedPlayers.map((player, playerIndex) => (
                  <div
                    key={player.playerId}
                    className={`rounded-lg border p-4 ${
                      playerIndex === 0 && player.maxMatches > 0 ? "bg-amber-50 border-amber-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {playerIndex === 0 && player.maxMatches > 0 && <Trophy className="h-6 w-6 text-amber-600" />}
                      <h3 className="font-bold text-lg">{player.playerName}</h3>
                      <Badge variant="outline">
                        {player.bets.length} {player.bets.length === 1 ? "aposta" : "apostas"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {player.bets.map((bet, betIndex) => (
                        <div
                          key={bet.betId}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Jogo {betIndex + 1}</p>
                            <div className="flex flex-wrap gap-1">
                              {bet.betNumbers
                                .sort((a, b) => a - b)
                                .map((num) => {
                                  const isMatched = bet.matchedNumbers.includes(num)
                                  return (
                                    <Badge
                                      key={num}
                                      variant={isMatched ? "default" : "outline"}
                                      className={`font-mono text-xs ${isMatched ? "bg-emerald-600" : ""}`}
                                    >
                                      {num.toString().padStart(2, "0")}
                                    </Badge>
                                  )
                                })}
                            </div>
                          </div>
                          <Badge
                            variant={bet.matchesCount > 0 ? "default" : "secondary"}
                            className={`text-base px-3 py-1 ${bet.matchesCount > 0 ? "bg-emerald-600" : ""}`}
                          >
                            {bet.matchesCount} {bet.matchesCount === 1 ? "acerto" : "acertos"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
