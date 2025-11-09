import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <motion.footer 
            className="p-4 text-center text-xs text-muted-foreground sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            © 2024 Mockview AI. All Rights Reserved. Developed by Suyash Mishra.
        </motion.footer>
    )
}
