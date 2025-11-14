
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, Settings, User, LogOut } from 'lucide-react';
import { Logo } from '@/components/icons';
import Header from '@/components/layout/header';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/layout/footer';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learning Hub', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const userName = user?.displayName || user?.email || 'Anonymous';
  const userEmail = user?.email || 'No email';
  
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  };


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
            <Separator className="my-2" />
             <div className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:-translate-x-1">
                <div className="flex items-center gap-3 p-2 rounded-md group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage data-ai-hint={userAvatar?.imageHint} src={user?.photoURL || userAvatar?.imageUrl} alt={userName} />
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium leading-none truncate">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                            {userEmail}
                        </p>
                    </div>
                </div>
            </div>
            <Separator className="my-2" />
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
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={handleLogout}
                        tooltip={{
                            children: "Logout",
                            side: "right",
                        }}
                    >
                        <LogOut/>
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out md:pl-[--sidebar-width-icon] group-data-[state=expanded]/sidebar-wrapper:md:pl-[--sidebar-width]">
        <Header />
        <div className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8">
            {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
