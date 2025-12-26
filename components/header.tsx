"use client"

import { useLanguage } from "@/components/language-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Calculator, History } from "lucide-react"
import { useState, useEffect } from "react"

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [view, setView] = useState<"calculator" | "history">("calculator")

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstallable(false)
    }

    setDeferredPrompt(null)
  }

  return (
    <header className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("appTitle")}</h1>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={language}
            onValueChange={(value) => value && setLanguage(value as "en" | "te")}
          >
            <ToggleGroupItem value="en" aria-label="English">
              EN
            </ToggleGroupItem>
            <ToggleGroupItem value="te" aria-label="Telugu">
              తెలుగు
            </ToggleGroupItem>
          </ToggleGroup>
          <ModeToggle />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => value && setView(value as "calculator" | "history")}
        >
          <ToggleGroupItem value="calculator" aria-label="Calculator">
            <Calculator className="h-4 w-4 mr-2" />
            {t("calculator")}
          </ToggleGroupItem>
          <ToggleGroupItem value="history" aria-label="History">
            <History className="h-4 w-4 mr-2" />
            {t("history")}
          </ToggleGroupItem>
        </ToggleGroup>

        {isInstallable && (
          <Button size="sm" onClick={handleInstall}>
            {t("installApp")}
          </Button>
        )}
      </div>
    </header>
  )
}
