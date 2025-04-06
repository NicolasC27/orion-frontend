import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import {Sidebar} from '@/components/Sidebar'
import React from "react";
import TicketDetailPage from "@/components/ticket-detail-page";
import {TicketListPage} from "@/components/ticket-list-page";
import Component from '@/components/Demo';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Your App Name',
    description: 'Description of your app',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <div className="flex h-screen bg-white dark:bg-gray-900">
            <Sidebar/>
            <Component/>
        </div>
        </body>
        </html>
)
}