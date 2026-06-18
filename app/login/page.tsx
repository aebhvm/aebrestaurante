import { LoginForm } from "@/components/login-form";
import { getLoginSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage() {
  const settings = await getLoginSettings();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-x-0 top-0 h-32 border-b bg-card" />
      <div className="relative grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
        <section>
          {settings.loginLogoUrl ? (
            <img src={settings.loginLogoUrl} alt="Logo" className="mb-5 h-16 w-auto rounded-md object-contain" />
          ) : (
            <div className="mb-5 flex size-14 items-center justify-center rounded-md bg-primary text-xl font-bold text-primary-foreground">A</div>
          )}
          <p className="text-sm font-semibold text-primary">{settings.loginEyebrow}</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-normal md:text-5xl">{settings.loginTitle}</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">{settings.loginSubtitle}</p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
