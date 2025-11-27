import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PrizeReportContent } from "@/components/prize-report-content"

export default async function PrizeReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  type BetWithDetails = {
    bet_id: string
    player_id: string
    player_name: string
    numbers: number[]
    matched_numbers: number[]
    total_matches: number
  }

  const betsWithDetails: BetWithDetails[] = []

  bets?.forEach((bet) => {
    const betNumbers = bet.numbers as number[]
    const allMatchedNumbers = new Set<number>()

    draws?.forEach((draw) => {
      const drawNumbers = draw.numbers as number[]
      const matchesInDraw = betNumbers.filter((n) => drawNumbers.includes(n))
      matchesInDraw.forEach((n) => allMatchedNumbers.add(n))
    })

    betsWithDetails.push({
      bet_id: bet.id,
      player_id: bet.player_id,
      player_name: (bet.player as any).name,
      numbers: betNumbers,
      matched_numbers: Array.from(allMatchedNumbers).sort((a, b) => a - b),
      total_matches: allMatchedNumbers.size,
    })
  })

  betsWithDetails.sort((a, b) => {
    if (b.total_matches !== a.total_matches) {
      return b.total_matches - a.total_matches
    }
    return a.player_name.localeCompare(b.player_name)
  })

  // Calcular vencedores
  const mainWinner = betsWithDetails.find((b) => b.total_matches >= 10)
  const secondPlace = !mainWinner && betsWithDetails.length > 0 ? betsWithDetails[0] : null
  const zeroHitsWinner = betsWithDetails.find((b) => b.total_matches === 0)
  const lowestHitsWinner =
    !zeroHitsWinner && betsWithDetails.length > 0 ? betsWithDetails[betsWithDetails.length - 1] : null

  // Vencedores do dia
  const dailyWinners: { drawNumber: number; drawDate: string; winners: string[]; matches: number }[] = []
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
        drawDate: draw.draw_date,
        winners: winners.map((w) => w.playerName),
        matches: maxMatches,
      })
    }
  }

  return (
    <PrizeReportContent
      round={round}
      betsWithDetails={betsWithDetails}
      draws={draws || []}
      mainWinner={mainWinner || null}
      secondPlace={secondPlace}
      zeroHitsWinner={zeroHitsWinner || null}
      lowestHitsWinner={lowestHitsWinner || null}
      dailyWinners={dailyWinners}
    />
  )
}
