'use client';

import * as React from 'react';
import { User, Bell, Palette, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function SettingsSection({ title, description, icon: Icon, children }: { title: string, description: string, icon: React.ElementType, children: React.ReactNode }) {
    return (
        <Card className="bg-card/50 shadow-lg animate-fade-in-up">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="font-headline">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-4" />
                {children}
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
    const userName = "Alex Doe";

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <header className="mb-10 animate-fade-in-up">
                <h1 className="font-headline text-4xl font-bold text-primary">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account and preferences.</p>
            </header>

            <div className="space-y-8">
                <SettingsSection title="Profile" description="Update your personal information." icon={User}>
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage data-ai-hint={userAvatar?.imageHint} src={userAvatar?.imageUrl} />
                            <AvatarFallback className="text-3xl">{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" defaultValue={userName} />
                        </div>
                        <Button variant="outline">Change Photo</Button>
                    </div>
                </SettingsSection>

                <SettingsSection title="Notifications" description="Choose how you receive notifications." icon={Bell}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="email-notifications">Email Notifications</Label>
                                <p className="text-xs text-muted-foreground">Receive emails about your account activity and new features.</p>
                            </div>
                            <Switch id="email-notifications" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="push-notifications">Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">Get push notifications on your devices.</p>
                            </div>
                            <Switch id="push-notifications" />
                        </div>
                    </div>
                </SettingsSection>
                
                <SettingsSection title="Appearance" description="Customize the look and feel of the app." icon={Palette}>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                            <p className="text-xs text-muted-foreground">The app is currently in dark mode.</p>
                        </div>
                        <Switch id="dark-mode" checked disabled />
                    </div>
                </SettingsSection>
                
                <div className="flex justify-end pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Button size="lg">Save Changes</Button>
                </div>
            </div>
        </div>
    );
}
