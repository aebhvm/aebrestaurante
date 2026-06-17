import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-x-0 top-0 h-32 border-b bg-card" />
      <div className="relative grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
        <section>
          <p className="text-sm font-semibold text-primary">BarOps SaaS</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-normal md:text-5xl">Gestao precisa para salao, bar e estoque.</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Controle tarefas, escalas, pracas, fichas tecnicas, noticias e pedidos de estoque com isolamento por perfil.
          </p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
