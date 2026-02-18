import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { ReportContent } from "@/components/report-content";
import NotFoundPage from "./NotFoundPage";

export default function RoundReportPage() {
  const { id } = useParams<{ id: string }>();
  const [round, setRound] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: roundData, error } = await supabase.from("rounds").select("*").eq("id", id).single();
      if (error || !roundData) { setNotFound(true); setLoading(false); return; }
      setRound(roundData);

      const { data: betsData } = await supabase.from("bets").select("*, player:players(*), payments(*)").eq("round_id", id!);
      setBets(betsData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (notFound) return <NotFoundPage />;
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const totalBets = bets.length;
  const paidBets = bets.filter(b => b.payments?.[0]?.status === "paid").length;
  const pendingBets = totalBets - paidBets;
  const totalAmount = bets.reduce((s, b) => s + (b.payments?.[0]?.status === "paid" ? b.payments[0].amount : 0), 0);
  const pendingAmount = bets.reduce((s, b) => s + (b.payments?.[0]?.status !== "paid" && b.payments?.[0] ? b.payments[0].amount : 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between no-print">
        <Button asChild variant="ghost"><Link to={`/rounds/${id}`}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link></Button>
        <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700"><Download className="h-4 w-4 mr-2" />Baixar PDF</Button>
      </div>
      <ReportContent round={round} bets={bets} totalBets={totalBets} paidBets={paidBets} pendingBets={pendingBets} totalAmount={totalAmount} pendingAmount={pendingAmount} />
    </div>
  );
}
