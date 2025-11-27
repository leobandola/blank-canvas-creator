"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { useRef } from "react"

type ResultData = {
  betId: string
  playerName: string
  betNumbers: number[]
  matchedNumbers: number[]
  matchesCount: number
}

type Props = {
  roundName: string
  drawNumber: number
  drawDate: string
  drawnNumbers: number[]
  results: ResultData[]
}

export function DetailedResultsReport({ roundName, drawNumber, drawDate, drawnNumbers, results }: Props) {
  const reportRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // Criar conteúdo HTML para o PDF
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Detalhado - ${roundName} - Sorteio #${drawNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; font-size: 24px; margin-bottom: 10px; }
          h2 { color: #374151; font-size: 18px; margin-bottom: 20px; }
          .info { margin-bottom: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .numbers { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
          .number { background: #2563eb; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-family: monospace; }
          .matched { background: #059669; }
          .not-matched { background: #e5e7eb; color: #374151; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background: #f3f4f6; font-weight: bold; }
          .player-row { background: #fafafa; }
          .bet-numbers { display: flex; gap: 4px; flex-wrap: wrap; }
          .bet-number { padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
          .acertos { font-weight: bold; color: #059669; }
          .zero-acertos { color: #9ca3af; }
          .summary { margin-top: 30px; padding: 15px; background: #ecfdf5; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Relatório Detalhado de Resultados</h1>
        <h2>${roundName} - Sorteio #${drawNumber}</h2>
        
        <div class="info">
          <p><strong>Data do Sorteio:</strong> ${new Date(drawDate).toLocaleDateString("pt-BR")}</p>
          <p><strong>Números Sorteados:</strong></p>
          <div class="numbers">
            ${drawnNumbers
              .sort((a, b) => a - b)
              .map((n) => `<span class="number">${n.toString().padStart(2, "0")}</span>`)
              .join("")}
          </div>
        </div>
        
        <h3>Resultados por Jogador</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 200px;">Jogador</th>
              <th>Números Apostados</th>
              <th style="width: 100px;">Acertos</th>
            </tr>
          </thead>
          <tbody>
            ${results
              .map(
                (result) => `
              <tr class="player-row">
                <td><strong>${result.playerName}</strong></td>
                <td>
                  <div class="bet-numbers">
                    ${result.betNumbers
                      .sort((a, b) => a - b)
                      .map((n) => {
                        const isMatched = result.matchedNumbers.includes(n)
                        return `<span class="bet-number ${isMatched ? "matched" : "not-matched"}">${n.toString().padStart(2, "0")}</span>`
                      })
                      .join("")}
                  </div>
                </td>
                <td class="${result.matchesCount > 0 ? "acertos" : "zero-acertos"}">
                  ${result.matchesCount} ${result.matchesCount === 1 ? "acerto" : "acertos"}
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="summary">
          <h4>Resumo</h4>
          <p>Total de apostas: ${results.length}</p>
          <p>Maior número de acertos: ${Math.max(...results.map((r) => r.matchesCount))}</p>
          <p>Apostas com acertos: ${results.filter((r) => r.matchesCount > 0).length}</p>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
          Relatório gerado em ${new Date().toLocaleString("pt-BR")}
        </p>
      </body>
      </html>
    `

    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    const printWindow = window.open(url, "_blank")
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }

    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // Agrupar resultados por jogador para exibição
  const groupedByPlayer = new Map<string, ResultData[]>()
  results.forEach((result) => {
    if (!groupedByPlayer.has(result.playerName)) {
      groupedByPlayer.set(result.playerName, [])
    }
    groupedByPlayer.get(result.playerName)!.push(result)
  })

  const sortedPlayers = Array.from(groupedByPlayer.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div>
      <div className="flex gap-2 mb-6 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
      </div>

      <div ref={reportRef}>
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Relatório Detalhado de Resultados</CardTitle>
            <p className="text-emerald-100">
              {roundName} - Sorteio #{drawNumber}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Data: {new Date(drawDate).toLocaleDateString("pt-BR")}
              </p>
              <p className="font-semibold mb-2">Números Sorteados:</p>
              <div className="flex flex-wrap gap-2">
                {drawnNumbers
                  .sort((a, b) => a - b)
                  .map((num) => (
                    <Badge key={num} className="bg-blue-600 text-lg px-3 py-1 font-mono">
                      {num.toString().padStart(2, "0")}
                    </Badge>
                  ))}
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4">Resultados por Jogador</h3>

            <div className="space-y-4">
              {sortedPlayers.map(([playerName, playerResults]) => (
                <div key={playerName} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 font-bold flex items-center justify-between">
                    <span>{playerName}</span>
                    <Badge variant="outline">
                      {playerResults.length} {playerResults.length === 1 ? "jogo" : "jogos"}
                    </Badge>
                  </div>
                  <div className="divide-y">
                    {playerResults.map((result, index) => (
                      <div
                        key={result.betId}
                        className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Jogo {index + 1}</p>
                          <div className="flex flex-wrap gap-1">
                            {result.betNumbers
                              .sort((a, b) => a - b)
                              .map((num) => {
                                const isMatched = result.matchedNumbers.includes(num)
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
                          {result.matchedNumbers.length > 0 && (
                            <p className="text-xs text-emerald-600 mt-2">
                              Números acertados:{" "}
                              {result.matchedNumbers
                                .sort((a, b) => a - b)
                                .map((n) => n.toString().padStart(2, "0"))
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={result.matchesCount > 0 ? "default" : "secondary"}
                          className={`text-base px-3 py-1 ${result.matchesCount > 0 ? "bg-emerald-600" : ""}`}
                        >
                          {result.matchesCount} {result.matchesCount === 1 ? "acerto" : "acertos"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-bold mb-2">Resumo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{results.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Jogos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{sortedPlayers.length}</p>
                  <p className="text-sm text-muted-foreground">Jogadores</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {Math.max(...results.map((r) => r.matchesCount))}
                  </p>
                  <p className="text-sm text-muted-foreground">Maior Acerto</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {results.filter((r) => r.matchesCount > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Com Acertos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
