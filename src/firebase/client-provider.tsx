
'use client';

import { useMemo } from "react";
import { FirebaseProvider } from "./provider";
import { initializeFirebase } from ".";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ClientProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const { firebaseApp, auth, firestore } = useMemo(() => initializeFirebase(), []);
  
    return (
      <FirebaseProvider
        firebaseApp={firebaseApp}
        auth={auth}
        firestore={firestore}
      >
        <SidebarProvider>
          <div className="flex flex-col flex-1">
            {children}
          </div>
        </SidebarProvider>
      </FirebaseProvider>
    );
  }