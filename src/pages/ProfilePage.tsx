import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) {
    return <p className="text-sm text-slate-500">Cargando perfil...</p>;
  }
  return (
    <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#10192b]">
      <h1 className="text-2xl font-semibold">{user.firstName} {user.lastName}</h1>
      <p className="mt-2 text-sm text-slate-500">{user.email}</p>
      <p className="mt-4 text-sm text-slate-500">La sesión es tuya. Los portafolios, alertas e informes no se comparten con otra cuenta.</p>
    </section>
  );
}
