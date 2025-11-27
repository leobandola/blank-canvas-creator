import { redirect } from "next/navigation"

export default async function DrawsRoundIdPage({
  params,
}: {
  params: Promise<{ roundId: string }>
}) {
  const { roundId } = await params
  redirect(`/draws/${roundId}`)
}
