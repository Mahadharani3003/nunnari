import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { redirect } from 'next/navigation';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} conversations={conversations || []} />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
