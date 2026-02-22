import type { Metadata } from "next";
import { UiShell } from "@/components/ui-shell";
import { ShieldAlert, Fingerprint, Lock, ServerOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Política de Privacidade",
    description: "Saiba como o ImageStudio protege seus dados. Processamento 100% local, sem servidores e sem rastreio.",
    alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
    return (
        <UiShell>
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
                        <ShieldAlert className="h-10 w-10 text-primary" />
                        Política de Privacidade
                    </h1>
                    <p className="text-xl text-muted-foreground">O nosso compromisso com seus dados é que nós não temos seus dados.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <ServerOff className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-xl font-bold mb-2">Zero Servidores de Processamento</h3>
                            <p className="text-muted-foreground">
                                Toda modificação, conversão ou compressão ocorre puramente por meio de bibliotecas JavaScript direto no seu navegador. As imagens jamais trafegam por servidores externos.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <Fingerprint className="h-12 w-12 text-foreground mb-4" />
                            <h3 className="text-xl font-bold mb-2">Nenhum Rastreio Sensível</h3>
                            <p className="text-muted-foreground">
                                O ImageStudio opta por cookies e métricas estritamente necessárias apenas para tráfego anônimo global ou para manter sua preferência de Tema Escuro ou Histórico local na sua máquina.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <Lock className="h-12 w-12 text-foreground mb-4" />
                            <h3 className="text-xl font-bold mb-2">Histórico Puramente Local</h3>
                            <p className="text-muted-foreground">
                                Seu "Histórico de Conversões" fica salvo de modo isolado no Cache do Navegador (LocalStorage). Nem mesmo nós sabemos quais imagens você transformou na sessão de hoje.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h3>Nossa Promessa</h3>
                    <p>
                        Você pode desligar sua internet, carregar um arquivo altamente confidencial para o Conversor local, redimensioná-lo, alterar seu formato, comprimí-lo, baixar o ZIP gerado e então fechar o navegador sem jamais reacender a internet. Nenhum byte confidencial seria interceptado ou recolhido.
                    </p>

                    <h3>Alterações nesta Política</h3>
                    <p>
                        Ocasionalmente, manteremos este arquivo em sintonia com atualizações legais ou novas features implementadas, mas a premissa de que a aplicação é "Local, Segura e Privada" jamais se perderá.
                    </p>
                    <p>
                        <strong>Última atualização:</strong> Fevereiro de 2026.
                    </p>
                </div>
            </div>
        </UiShell>
    );
}
