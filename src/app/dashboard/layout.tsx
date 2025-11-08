'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Settings, User } from 'lucide-react';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learning Hub', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar variant='sidebar' collapsible='icon'>
        <SidebarHeader>
           <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span className="text-lg">Mockview AI</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                 {navLinks.map(({ href, label, icon: Icon }) => (
                    <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === href}
                            tooltip={{
                                children: label,
                                side: "right",
                            }}
                        >
                            <Link href={href}>
                                <Icon/>
                                <span>{label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 ))}
            </SidebarMenu>
        </SidebarContent>
         <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/settings'}
                        tooltip={{
                            children: "Settings",
                            side: "right",
                        }}
                    >
                        <Link href="/settings">
                            <Settings/>
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
