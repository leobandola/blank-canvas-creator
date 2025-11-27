import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { DetailedResultsReport } from "@/components/detailed-results-report"

export default async function DetailedResultsPage({
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

  const { data: round } = await supabase.from("rounds").select("*").eq("id", roundId).single()

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

  // Preparar dados para o relatório
  const reportData =
    results
      ?.map((result, index) => ({
        betId: result.bet.id,
        playerName: result.bet.player.name,
        betNumbers: result.bet.numbers,
        matchedNumbers: result.matched_numbers || [],
        matchesCount: result.matches_count,
      }))
      .sort((a, b) => a.playerName.localeCompare(b.playerName)) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 print:hidden">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/draws/${roundId}/results/${drawId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Resultados
            </Link>
          </Button>
        </div>

        <DetailedResultsReport
          roundName={round?.name || ""}
          drawNumber={draw.draw_number}
          drawDate={draw.draw_date}
          drawnNumbers={draw.numbers}
          results={reportData}
        />
      </div>
    </div>
  )
}
