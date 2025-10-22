"use client";

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import QRCode from "qrcode"
import { useTelegramAuth } from "./hooks/use-telegram-auth"

export function AuthPage() {
  const qrRef = useRef<HTMLCanvasElement>(null)
  const { isLoading, telegramUrl, error, handleTelegramAuth } = useTelegramAuth()
  
  React.useEffect(() => {
    if (qrRef.current && telegramUrl) {
      QRCode.toCanvas(qrRef.current, telegramUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    }
  }, [telegramUrl])

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Ошибка авторизации
            </h1>
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        {/* Main heading */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Sign in with 1 click via Telegram
          </h1>
        </div>

        {/* Telegram Auth Button */}
        <div>
          <Button 
            onClick={handleTelegramAuth}
            disabled={isLoading || !telegramUrl}
            className="w-80 h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-xl transition-colors duration-200"
            size="default"
          >
            <LogIn className="w-5 h-5 mr-3" />
            {isLoading ? 'Loading...' : 'Authorization'}
          </Button>
        </div>

        {/* Accent text */}
        <div className="py-4">
          <p className="text-muted-foreground text-lg font-medium">
            No email and passwords required
          </p>
        </div>

        {/* QR Code Section — ONLY on desktop */}
        <div className="hidden md:block space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground mb-2">
              If on computer or laptop,
            </h2>
            <p className="text-lg font-medium text-foreground">
              scan QR code on smartphone
            </p>
          </div>

          <div className="flex justify-center">
            {telegramUrl && <canvas ref={qrRef} className="rounded-lg" />}
          </div>
        </div>
      </div>
    </div>
  )
}