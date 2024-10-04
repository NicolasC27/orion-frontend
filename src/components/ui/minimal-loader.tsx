import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

interface MinimalLoaderProps {
    isLoading: boolean
    className?: string
}

export default function MinimalLoader({ isLoading, className }: MinimalLoaderProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (isLoading) {
            setProgress(0)
            const timer = setInterval(() => {
                setProgress((oldProgress) => {
                    if (oldProgress === 100) {
                        clearInterval(timer)
                        return 100
                    }
                    const diff = Math.random() * 10
                    return Math.min(oldProgress + diff, 99.9)
                })
            }, 50)

            return () => {
                clearInterval(timer)
            }
        } else {
            setProgress(100)
        }
    }, [isLoading])

    return (
        <motion.div
            className={cn(
                "fixed top-0 left-0 right-0 h-0.5 bg-primary z-50",
                className
            )}
            style={{
                scaleX: progress / 100,
                transformOrigin: "0%",
            }}
            animate={{
                scaleX: progress / 100,
            }}
            transition={{
                duration: 0.3,
            }}
        />
    )
}