"use client"

import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Sidebar, SidebarProvider, useSidebarContext } from '@/components/Sidebar'
import React from "react";
import TicketDetailPage from "@/components/ticket-detail-page";
import {TicketListPage} from "@/components/ticket-list-page";
import Component from '@/components/Demo';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Your App Name',
    description: 'Description of your app',
}

function MainContent() {
    const { expanded } = useSidebarContext();
    
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1">
                <Component expanded={expanded} />
            </main>
        </div>
    );
}

export default function RootLayout() {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SidebarProvider defaultExpanded={true}>
                        <MainContent />
                    </SidebarProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}