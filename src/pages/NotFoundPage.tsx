import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-6">Página não encontrada</p>
      <Button asChild><Link to="/">Voltar ao Início</Link></Button>
    </div>
  );
}
