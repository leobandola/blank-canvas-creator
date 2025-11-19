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
import { DollarSign, XCircle } from 'lucide-react';
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

export function MarkPaidDialog({ paymentId, isPaid = false }: { paymentId: string; isPaid?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleTogglePayment = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("payments")
      .update({
        status: isPaid ? "pending" : "paid",
        payment_date: isPaid ? null : new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) {
      console.error("Error updating payment:", error);
      alert("Erro ao atualizar pagamento: " + error.message);
    } else {
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {isPaid ? (
          <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar Pagamento
          </Button>
        ) : (
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <DollarSign className="h-4 w-4 mr-1" />
            Marcar como Pago
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPaid ? "Cancelar Confirmação de Pagamento" : "Confirmar Pagamento"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPaid 
              ? "Deseja cancelar a confirmação deste pagamento? O status voltará para pendente."
              : "Deseja marcar este pagamento como pago? A data de pagamento será registrada como hoje."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleTogglePayment}
            disabled={isLoading}
            className={isPaid ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
          >
            {isLoading ? "Processando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
