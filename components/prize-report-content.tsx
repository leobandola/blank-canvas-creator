"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Printer, Trophy, Medal, Award, TrendingDown } from "lucide-react"
import { useRef, useState } from "react"

type BetWithDetails = {
  bet_id: string
  player_id: string
  player_name: string
  numbers: number[]
  matched_numbers: number[]
  total_matches: number
}

type Draw = {
  id: string
  draw_number: number
  numbers: number[]
  draw_date: string
}

type DailyWinner = {
  drawNumber: number
  drawDate: string
  winners: string[]
  matches: number
}

interface PrizeReportContentProps {
  round: any
  betsWithDetails: BetWithDetails[]
  draws: Draw[]
  mainWinner: BetWithDetails | null
  secondPlace: BetWithDetails | null
  zeroHitsWinner: BetWithDetails | null
  lowestHitsWinner: BetWithDetails | null
  dailyWinners: DailyWinner[]
}

export function PrizeReportContent({
  round,
  betsWithDetails,
  draws,
  mainWinner,
  secondPlace,
  zeroHitsWinner,
  lowestHitsWinner,
  dailyWinners,
}: PrizeReportContentProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const playerBetCount = new Map<string, number>()
  betsWithDetails.forEach((bet) => {
    const count = playerBetCount.get(bet.player_id) || 0
    playerBetCount.set(bet.player_id, count + 1)
  })

  const playerBetIndex = new Map<string, number>()
  const getBetNumber = (playerId: string) => {
    const current = (playerBetIndex.get(playerId) || 0) + 1
    playerBetIndex.set(playerId, current)
    return current
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button asChild variant="ghost">
            <Link href={`/prizes/${round.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Relatório
          </Button>
        </div>

        <div ref={reportRef} className="bg-white p-6 space-y-6">
          <div className="text-center border-b-2 border-purple-600 pb-4">
            <h1 className="text-3xl font-bold text-purple-900">RELATÓRIO DE PREMIAÇÃO</h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">{round.name}</h2>
            <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
              <span>{round.lottery_type === "quina" ? "Quina" : "Mega Sena"}</span>
              <span>|</span>
              <span>{draws.length} sorteios realizados</span>
              <span>|</span>
              <span>{betsWithDetails.length} apostas</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gerado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-sm">S</span>
              Números Sorteados
            </h3>
            <div className="space-y-2">
              {draws.map((draw) => (
                <div key={draw.id} className="flex items-center gap-3 text-sm">
                  <span className="font-medium w-24">Sorteio #{draw.draw_number}</span>
                  <span className="text-gray-500 w-24">{new Date(draw.draw_date).toLocaleDateString("pt-BR")}</span>
                  <div className="flex gap-1">
                    {(draw.numbers as number[])
                      .sort((a, b) => a - b)
                      .map((num) => (
                        <span
                          key={num}
                          className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                        >
                          {num.toString().padStart(2, "0")}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {mainWinner && (
              <div className="border-2 border-amber-400 bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-6 w-6 text-amber-600" />
                  <span className="font-bold text-lg text-amber-900">PRÊMIO PRINCIPAL - 10 ACERTOS</span>
                </div>
                <p className="text-2xl font-bold text-amber-800">{mainWinner.player_name}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {mainWinner.numbers
                    .sort((a, b) => a - b)
                    .map((num) => (
                      <span
                        key={num}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          mainWinner.matched_numbers.includes(num)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {num.toString().padStart(2, "0")}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {secondPlace && !mainWinner && (
              <div className="border-2 border-slate-400 bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Medal className="h-6 w-6 text-slate-600" />
                  <span className="font-bold text-lg text-slate-900">
                    2ª COLOCAÇÃO - {secondPlace.total_matches} ACERTOS
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{secondPlace.player_name}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {secondPlace.numbers
                    .sort((a, b) => a - b)
                    .map((num) => (
                      <span
                        key={num}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          secondPlace.matched_numbers.includes(num)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {num.toString().padStart(2, "0")}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {(zeroHitsWinner || lowestHitsWinner) && (
              <div className="border-2 border-blue-400 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-6 w-6 text-blue-600" />
                  <span className="font-bold text-lg text-blue-900">
                    PRÊMIO ZERO ACERTO {!zeroHitsWinner && `(${lowestHitsWinner?.total_matches} ACERTOS)`}
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {zeroHitsWinner?.player_name || lowestHitsWinner?.player_name}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(zeroHitsWinner || lowestHitsWinner)?.numbers
                    .sort((a, b) => a - b)
                    .map((num) => (
                      <span
                        key={num}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          (zeroHitsWinner || lowestHitsWinner)?.matched_numbers.includes(num)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {num.toString().padStart(2, "0")}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {dailyWinners.length > 0 && (
              <div className="border-2 border-emerald-400 bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <span className="font-bold text-lg text-emerald-900">BÔNUS DIÁRIO - PRIMEIROS 7 SORTEIOS</span>
                </div>
                <div className="space-y-2">
                  {dailyWinners.map((winner) => (
                    <div
                      key={winner.drawNumber}
                      className="flex items-center justify-between text-sm bg-white p-2 rounded"
                    >
                      <span>
                        <span className="font-semibold">Sorteio #{winner.drawNumber}</span>
                        <span className="text-gray-500 ml-2">
                          ({new Date(winner.drawDate).toLocaleDateString("pt-BR")})
                        </span>
                      </span>
                      <span className="font-medium">
                        {winner.winners.join(", ")} - {winner.matches} acertos
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4">CLASSIFICAÇÃO GERAL POR APOSTA</h3>
            <p className="text-xs text-gray-600 mb-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-green-500"></span> = números acertados
              </span>
            </p>
            <div className="space-y-3">
              {betsWithDetails.map((entry, index) => {
                const betNumber = getBetNumber(entry.player_id)
                const hasMultipleBets = (playerBetCount.get(entry.player_id) || 0) > 1

                return (
                  <div
                    key={entry.bet_id}
                    className={`p-3 rounded border ${index === 0 ? "bg-amber-50 border-amber-200" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-400 w-8">{index + 1}</span>
                        <span className="font-semibold">
                          {entry.player_name}
                          {hasMultipleBets && <span className="text-xs text-gray-500 ml-2">(Jogo {betNumber})</span>}
                        </span>
                      </div>
                      <span className={`font-bold ${entry.total_matches >= 10 ? "text-green-600" : "text-gray-700"}`}>
                        {entry.total_matches}/10 acertos
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-11">
                      {entry.numbers
                        .sort((a, b) => a - b)
                        .map((num) => (
                          <span
                            key={num}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              entry.matched_numbers.includes(num)
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 text-gray-500"
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
          </div>

          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>Sistema de Gerenciamento de Bolões</p>
          </div>
        </div>
      </div>
    </div>
  )
}
