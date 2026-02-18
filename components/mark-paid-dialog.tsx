import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function MarkPaidDialog({ paymentId, onSuccess }: { paymentId: string; onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkPaid = async () => {
    setIsLoading(true);
    const { error } = await supabase.from("payments").update({ status: "paid", payment_date: new Date().toISOString() }).eq("id", paymentId);
    if (error) { toast.error("Erro: " + error.message); } else { toast.success("Pagamento confirmado!"); onSuccess?.(); }
    setIsLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"><DollarSign className="h-4 w-4 mr-1" />Marcar como Pago</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle><AlertDialogDescription>Marcar como pago? A data de pagamento será registrada como hoje.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleMarkPaid} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">{isLoading ? "Marcando..." : "Confirmar"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
