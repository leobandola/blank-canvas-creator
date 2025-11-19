"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DollarSign } from 'lucide-react';
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

export function MarkPaidDialog({ paymentId }: { paymentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleMarkPaid = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("payments")
      .update({
        status: "paid",
        payment_date: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) {
      console.error("Error marking payment as paid:", error);
      alert("Erro ao marcar como pago: " + error.message);
    } else {
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          <DollarSign className="h-4 w-4 mr-1" />
          Marcar como Pago
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja marcar este pagamento como pago? A data de pagamento será registrada como hoje.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleMarkPaid}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? "Marcando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
