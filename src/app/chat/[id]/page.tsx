import { ChatWindow } from '@/components/chat/chat-window';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ExistingChatPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch existing messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  const formattedMessages = messages?.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
    attachments: m.metadata?.attachments || [],
    steps: m.metadata?.steps || []
  })) || [];

  return (
    <div className="flex-1 h-full relative">
      <ChatWindow userId={user.id} conversationId={params.id} initialMessages={formattedMessages as any} />
    </div>
  );
}
