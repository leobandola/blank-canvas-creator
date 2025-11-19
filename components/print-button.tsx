"use client";

import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      <Download className="h-4 w-4 mr-2" />
      Baixar PDF
    </Button>
  );
}
