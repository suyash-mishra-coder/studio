'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './icons';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="flex flex-col items-center gap-4"
        >
            <Logo />
            <div className="text-center">
                <h1 className="text-xl font-medium text-muted-foreground">
                    developed by
                </h1>
                <h2 className="text-3xl font-bold text-foreground">
                    suyash mishra
                </h2>
            </div>
      </motion.div>
    </motion.div>
  );
}
