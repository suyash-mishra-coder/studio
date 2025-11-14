
'use client';

import * as React from 'react';
import { X, Monitor } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DesktopTip() {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = React.useState(true);
    
    React.useEffect(() => {
        const tipDismissed = localStorage.getItem('desktop-tip-dismissed');
        if (tipDismissed) {
            setIsOpen(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('desktop-tip-dismissed', 'true');
    };

    if (!isMobile || !isOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden animate-fade-in-up">
             <Alert className="flex items-center justify-between bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-primary"/>
                    <AlertDescription className="text-sm text-muted-foreground">
                        For a better experience, use a desktop browser.
                    </AlertDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDismiss}>
                    <X className="h-4 w-4"/>
                </Button>
            </Alert>
        </div>
    );
}
