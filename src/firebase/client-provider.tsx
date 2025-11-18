
'use client';

import { useMemo, useState, useEffect } from "react";
import { FirebaseProvider } from "./provider";
import { initializeFirebase } from ".";
import { SidebarProvider } from "@/components/ui/sidebar";
import SplashScreen from "@/components/SplashScreen";
import { AnimatePresence } from "framer-motion";

export default function ClientProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const { firebaseApp, auth, firestore } = useMemo(() => initializeFirebase(), []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); // Show splash screen for 2 seconds

        return () => clearTimeout(timer);
    }, []);
  
    return (
      <FirebaseProvider
        firebaseApp={firebaseApp}
        auth={auth}
        firestore={firestore}
      >
        <AnimatePresence>
            {loading && <SplashScreen />}
        </AnimatePresence>
        
        <SidebarProvider>
          <div className="flex flex-col flex-1">
            {children}
          </div>
        </SidebarProvider>

      </FirebaseProvider>
    );
  }
