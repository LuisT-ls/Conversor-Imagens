"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
    Menu, Moon, Sun, Image as ImageIcon, SlidersHorizontal, Minimize, LayoutDashboard, History, Settings, FileText, HelpCircle, ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const routes = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/conversor", label: "Conversor", icon: ImageIcon },
    { href: "/editor", label: "Editor", icon: SlidersHorizontal },
    { href: "/compressor", label: "Compressor", icon: Minimize },
    { href: "/historico", label: "Histórico", icon: History },
];

const secondaryRoutes = [
    { href: "/documentacao", label: "Documentação", icon: FileText },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/privacidade", label: "Privacidade", icon: ShieldAlert },
];

export function UiShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { setTheme, theme } = useTheme();
    // isMounted evita hydration mismatch no ícone de tema
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/20">
            {/* Header Mobile / Desktop Superior */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] overflow-y-auto">
                        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                        <SheetDescription className="sr-only">Navegue pelas ferramentas do ImageStudio</SheetDescription>
                        <nav className="grid gap-6 text-lg font-medium mt-6">
                            <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <ImageIcon className="h-5 w-5" />
                                </div>
                                <span>ImageStudio</span>
                            </Link>
                            <div className="flex flex-col gap-2">
                                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ferramentas</p>
                                {routes.map((route) => {
                                    const Icon = route.icon;
                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            className={`flex items-center gap-4 px-2.5 py-2 rounded-lg ${pathname === route.href
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {route.label}
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="flex flex-col gap-2 mt-4">
                                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informações</p>
                                {secondaryRoutes.map((route) => {
                                    const Icon = route.icon;
                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            className={`flex items-center gap-4 px-2.5 py-2 rounded-lg text-sm ${pathname === route.href
                                                ? "text-primary font-medium"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {route.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                        <div className="mt-8">
                            <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Privacidade 100%</p>
                                Todo processamento é feito localmente no seu browser.
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex w-full items-center justify-between md:hidden">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <span>ImageStudio</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                        {isMounted ? (theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />) : <div className="h-5 w-5" />}
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 flex-col md:pl-64">
                {/* Sidebar Desktop */}
                <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background/50 backdrop-blur-xl md:flex">
                    <div className="flex h-16 items-center border-b px-6 justify-between">
                        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
                            <ImageIcon className="h-5 w-5 text-primary" />
                            <span>ImageStudio</span>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                            {isMounted ? (theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />) : <div className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto overflow-x-hidden">
                        <nav className="flex flex-col gap-2 px-4 py-6">
                            <p className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Ferramentas</p>
                            {routes.map((route) => {
                                const Icon = route.icon;
                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname === route.href
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {route.label}
                                    </Link>
                                );
                            })}

                            <Separator className="my-4" />

                            <p className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Informações</p>
                            {secondaryRoutes.map((route) => {
                                const Icon = route.icon;
                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${pathname === route.href
                                            ? "text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {route.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t">
                        <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldAlert className="h-4 w-4 text-primary" />
                                <p className="font-medium text-foreground">Privacidade 100%</p>
                            </div>
                            Seus arquivos não saem do seu computador. Todo processamento é local.
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
                    <div className="mx-auto max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
