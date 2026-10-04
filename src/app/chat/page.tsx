import { ChatWindow } from '@/components/chat/chat-window';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 h-full relative">
      <ChatWindow userId={user.id} />
    </div>
  );
}
