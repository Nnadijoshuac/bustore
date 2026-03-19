export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-busha-slate to-busha-slate-mid flex items-center justify-center p-4">
      {children}
    </div>
  );
}
