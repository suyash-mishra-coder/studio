
'use client';

import * as React from 'react';
import { User, Bell, Palette, Shield, CreditCard, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

function SettingsSection({ title, description, icon: Icon, children, delay = 0 }: { title: string, description: string, icon: React.ElementType, children: React.ReactNode, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function SettingsPage() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
    const [name, setName] = React.useState("Alex Doe");
    const [avatar, setAvatar] = React.useState(userAvatar?.imageUrl);
    const { toast } = useToast();

    const handleSaveChanges = () => {
        toast({
            title: 'Settings Saved',
            description: 'Your changes have been successfully saved.',
        });
    };
    
    const handlePhotoChange = () => {
        // This is a mock function. In a real app, this would open a file picker.
        toast({
            title: 'Feature Coming Soon!',
            description: 'The ability to upload custom avatars is on its way.',
        });
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <header className="mb-10 animate-fade-in-up">
                <h1 className="font-headline text-4xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account and preferences.</p>
            </header>

            <div className="space-y-8">
                <SettingsSection title="Profile" description="Update your personal information." icon={User} delay={0.1}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border">
                                    <AvatarImage data-ai-hint={userAvatar?.imageHint} src={avatar} />
                                    <AvatarFallback className="text-3xl">{name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 bg-background rounded-full h-8 w-8" onClick={handlePhotoChange}>
                                    <Upload className="h-4 w-4 text-primary" />
                                </Button>
                            </div>
                            <div className="grid gap-2 flex-1">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-lg" />
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Notifications" description="Choose how you receive notifications." icon={Bell} delay={0.2}>
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
                                <p className="text-xs text-muted-foreground">Get push notifications for interview reminders.</p>
                            </div>
                            <Switch id="push-notifications" />
                        </div>
                    </div>
                </SettingsSection>
                
                <SettingsSection title="Appearance" description="Customize the look and feel of the app." icon={Palette} delay={0.3}>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                            <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
                        </div>
                        <Switch id="dark-mode" onCheckedChange={() => document.documentElement.classList.toggle('dark')} />
                    </div>
                </SettingsSection>

                <SettingsSection title="Security" description="Manage your account's security." icon={Shield} delay={0.4}>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>Password</Label>
                            <p className="text-xs text-muted-foreground">It's a good idea to use a strong password that you're not using elsewhere.</p>
                        </div>
                        <Button variant="outline">Change Password</Button>
                    </div>
                </SettingsSection>

                <SettingsSection title="Billing" description="Manage your subscription and payment methods." icon={CreditCard} delay={0.5}>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>Plan</Label>
                            <p className="text-xs text-muted-foreground">You are currently on the <span className="text-primary font-bold">Pro</span> plan.</p>
                        </div>
                        <Button variant="outline">Manage Subscription</Button>
                    </div>
                </SettingsSection>
                
                <div className="flex justify-end pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <Button size="lg" onClick={handleSaveChanges}>Save Changes</Button>
                </div>
            </div>
        </div>
    );
}
