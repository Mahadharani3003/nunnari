"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, MessageSquare, MoreVertical, Search, Settings, User as UserIcon, LogOut, Menu, X, Archive, Trash, Pin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Sidebar({ user, conversations }: { user: any, conversations: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.archived
  );

  const pinned = filteredConversations.filter(c => c.pinned);
  const unpinned = filteredConversations.filter(c => !c.pinned);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border text-card-foreground w-64 md:w-72">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <Link href="/chat" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
          <span className="font-bold tracking-tight">NUNNARI AI</span>
        </Link>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-1 hover:bg-muted rounded-md">
          <X size={20} />
        </button>
      </div>

      <div className="p-3">
        <button 
          onClick={() => {
            router.push('/chat');
            setIsOpen(false);
          }}
          className="w-full flex items-center gap-2 bg-primary text-primary-foreground py-2.5 px-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {pinned.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">PINNED</h3>
            <div className="space-y-1">
              {pinned.map(chat => (
                <Link 
                  key={chat.id} 
                  href={`/chat/${chat.id}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm group",
                    pathname === `/chat/${chat.id}` && "bg-muted font-medium"
                  )}
                >
                  <Pin size={16} className="text-primary" />
                  <span className="truncate flex-1">{chat.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">RECENT</h3>
          <div className="space-y-1">
            {unpinned.map(chat => (
              <Link 
                key={chat.id} 
                href={`/chat/${chat.id}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm group",
                  pathname === `/chat/${chat.id}` && "bg-muted font-medium"
                )}
              >
                <MessageSquare size={16} className="text-muted-foreground" />
                <span className="truncate flex-1">{chat.title}</span>
              </Link>
            ))}
            {unpinned.length === 0 && (
              <div className="text-xs text-muted-foreground px-2 italic">No conversations</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-muted rounded-md cursor-pointer transition-colors">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        
        <div className="mt-2 space-y-1">
          <Link href="/settings" className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted rounded-md transition-colors">
            <Settings size={16} className="text-muted-foreground" />
            Settings
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-background border border-border rounded-md shadow-sm hover:bg-muted"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        {SidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative z-50 h-full w-64 md:w-72 flex bg-card">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
