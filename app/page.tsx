import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Trophy, DollarSign, TrendingUp, LogIn, Database } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex justify-end mb-4">
          {user ? (
            <UserNav user={user} />
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
          )}
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-900 mb-4 text-balance">
            Sistema de Gestão de Bolões
          </h1>
          <p className="text-xl text-muted-foreground text-balance">
            Gerencie seus bolões de Quina e Mega Sena com facilidade
          </p>
          {!user && (
            <p className="text-sm text-muted-foreground mt-2">
              Faça login para editar informações. Visitantes podem apenas visualizar.
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Users className="h-5 w-5" />
                Jogadores
              </CardTitle>
              <CardDescription>Cadastro e gerenciamento</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/players">Gerenciar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Trophy className="h-5 w-5" />
                Rodadas
              </CardTitle>
              <CardDescription>Apostas e rodadas ativas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link href="/rounds">Gerenciar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="h-5 w-5" />
                Sorteios
              </CardTitle>
              <CardDescription>Conferência de resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/draws">Conferir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <DollarSign className="h-5 w-5" />
                Premiações
              </CardTitle>
              <CardDescription>Vencedores e prêmios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/prizes">Ver</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Database className="h-5 w-5" />
                Backup
              </CardTitle>
              <CardDescription>Exportar/Importar dados</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gray-600 hover:bg-gray-700">
                <Link href="/backup">Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Regras do Bolão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Prêmio Principal - 10 Acertos</h3>
              <p className="text-emerald-50">Ganha quem primeiro completar os 10 acertos acumulativos.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Prêmio 2ª Colocação</h3>
              <p className="text-emerald-50">Ganha quem tiver 9 acertos; não havendo, 8 acertos e assim sucessivamente.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Prêmio Zero Acerto</h3>
              <p className="text-emerald-50">Ganha quem não acertou nenhum número; não havendo, ganha quem tiver o menor número de acertos.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Resultado do Dia (Bônus)</h3>
              <p className="text-emerald-50">Nos 7 primeiros sorteios, ganha quem fizer mais acertos no resultado do dia.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
