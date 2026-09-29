'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import {
  Search, MapPin, Phone, Clock, ExternalLink, Copy, Check,
  Building2, Send, ArrowRight, ChevronDown, Globe, Users,
  ShieldCheck, LogOut, Plus, Pencil, Trash2, X, Menu, Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { AdminLogin } from '@/components/admin-login'
import { AdminPanel } from '@/components/admin-panel'

// ============================================================
// Types
// ============================================================
type Branch = {
  id: string
  countryId: string
  name: string
  city: string
  address: string
  phone: string
  visaCenter: string
  reference: string | null
  mapLink: string | null
  workingHours: string | null
  submissionHours: string | null
  sortOrder: number
}

type Country = {
  id: string
  name: string
  code: string | null
  flag: string | null
  sortOrder: number
  branches: Branch[]
}

type HeadOffice = {
  id: string
  labelAr: string
  labelEn: string
  addressAr: string
  addressEn: string
  hoursAr: string
  hoursEn: string
  mapLink: string
  isActive: boolean
}

type DirectoryData = {
  countries: Country[]
  headOffice: HeadOffice | null
  stats: { countryCount: number; branchCount: number }
}

// ============================================================
// Helpers
// ============================================================
function isUrl(s?: string | null) {
  return /^https?:\/\//.test(s || '')
}

function buildWhatsAppMessage(country: Country, b: Branch, headOffice: HeadOffice | null) {
  const flag = country.flag || ''
  const lines = [
    `${flag} Global EIS — Visa Application Center`,
    ``,
    `🌍 Country: ${country.name}`,
    `🏢 Branch: ${b.name}`,
    `🏙️ City: ${b.city}`,
    `🛂 Provider: ${b.visaCenter}`,
    ``,
    `📍 Address: ${b.address}`,
    `🕙 Working Hours: ${b.workingHours || '—'}`,
  ]
  if (b.submissionHours) lines.push(`⏰ Submission Hours: ${b.submissionHours}`)
  lines.push(`📞 Phone: ${b.phone}`)
  lines.push(``)
  lines.push(`🗺️ Google Maps: ${b.mapLink || '—'}`)
  if (b.reference) lines.push(`🔗 Reference: ${b.reference}`)
  lines.push(``)
  lines.push(`— Sent via Global EIS Branch Directory`)
  return lines.join('\n')
}

function waLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

// ============================================================
// Animated counter
// ============================================================
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = display
    const diff = value - start
    if (diff === 0) return
    const duration = 800
    const startTime = performance.now()
    let raf: number
    const step = (t: number) => {
      const k = Math.min(1, (t - startTime) / duration)
      const eased = 1 - Math.pow(1 - k, 3)
      setDisplay(Math.round(start + diff * eased))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <>{display}</>
}

// ============================================================
// Copy button
// ============================================================
function CopyButton({ text, label = 'Copy', size = 'sm' }: { text: string; label?: string; size?: 'sm' | 'md' }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const onCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      toast({ title: 'Copied to clipboard' })
      setTimeout(() => setCopied(false), 1400)
    } catch (e) {
      toast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={onCopy}
      className="h-7 px-2.5 text-xs gap-1 font-mono"
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : label}
    </Button>
  )
}

// ============================================================
// Head Office Pill
// ============================================================
function HeadOfficePill({ office }: { office: HeadOffice }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const fullText = useMemo(() => {
    return `${office.labelAr} – Global EIS\n\n` +
      `📍 العنوان: ${office.addressAr}\n\n` +
      `🕙 مواعيد العمل: ${office.hoursAr}\n\n` +
      `📍 الموقع: ${office.mapLink}\n\n` +
      `ــــــــــــــــــــــ\n\n` +
      `Global EIS – ${office.labelEn}\n\n` +
      `📍 Address: ${office.addressEn}\n\n` +
      `🕙 Working Hours: ${office.hoursEn}\n\n` +
      `📍 Location: ${office.mapLink}`
  }, [office])

  const onCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullText)
      } else {
        const ta = document.createElement('textarea')
        ta.value = fullText
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      toast({ title: 'Head office info copied' })
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  return (
    <Card className="overflow-hidden border-l-4 border-l-[var(--brand-gold)] p-0">
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-navy)]/10">
          <Building2 className="h-6 w-6 text-[var(--brand-navy)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Headquarters
          </div>
          <div className="font-semibold text-foreground truncate">
            Global EIS – Nasr City, Cairo
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {office.hoursEn}
          </div>
        </div>
        <Button
          onClick={onCopy}
          className={`shrink-0 ${copied ? 'btn-gold' : 'btn-brand'}`}
          size="sm"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
    </Card>
  )
}

// ============================================================
// Branch Details Card
// ============================================================
function BranchDetails({ branch, country, headOffice }: {
  branch: Branch
  country: Country
  headOffice: HeadOffice | null
}) {
  const waText = useMemo(
    () => buildWhatsAppMessage(country, branch, headOffice),
    [country, branch, headOffice]
  )
  const waUrl = waLink(waText)

  const copyAllData = useMemo(() => {
    return `Address: ${branch.address}\n\nGoogle Maps: ${branch.mapLink || ''}\n\nWorking Hours:\n${branch.workingHours || ''}${branch.submissionHours ? '\n' + branch.submissionHours : ''}`
  }, [branch])

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Main branch card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[var(--brand-navy)] via-[var(--brand-gold)] to-[var(--brand-navy)]" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-navy)]/10 shrink-0">
              <Globe className="h-5 w-5 text-[var(--brand-navy)]" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">
              {branch.name}
            </h3>
          </div>

          <div className="space-y-3">
            {/* Country + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Country</div>
                <div className="font-medium">{country.flag} {country.name}</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">City</div>
                <div className="font-medium">{branch.city}</div>
              </div>
            </div>

            <Separator />

            {/* Visa Center */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Visa Center</div>
                <Badge variant="secondary" className="mt-1">{branch.visaCenter}</Badge>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Address</div>
              <div className="text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-[var(--brand-navy)] shrink-0" />
                <span>{branch.address}</span>
              </div>
            </div>

            {/* Map Link */}
            {isUrl(branch.mapLink) && (
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Google Maps</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={branch.mapLink!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--brand-navy)] dark:text-[var(--brand-gold-light)] hover:underline truncate max-w-full flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{branch.mapLink}</span>
                  </a>
                  <CopyButton text={branch.mapLink!} />
                </div>
              </div>
            )}

            {/* Working hours */}
            {branch.workingHours && (
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Working Hours</div>
                <div className="text-sm flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-[var(--brand-navy)] shrink-0" />
                  <div>
                    <div>{branch.workingHours}</div>
                    {branch.submissionHours && (
                      <div className="text-xs text-muted-foreground mt-0.5">{branch.submissionHours}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Phone */}
            {branch.phone && branch.phone.toLowerCase() !== 'not available' && (
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Phone</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-mono flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[var(--brand-navy)]" />
                    {branch.phone}
                  </div>
                  <CopyButton text={branch.phone} />
                  <a
                    href={waLink(`Phone: ${branch.phone}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-mono"
                  >
                    <Send className="h-3 w-3" />
                    WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Reference */}
            {isUrl(branch.reference) && (
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Reference</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={branch.reference!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--brand-navy)] dark:text-[var(--brand-gold-light)] hover:underline truncate max-w-full flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{branch.reference}</span>
                  </a>
                  <CopyButton text={branch.reference!} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Send to client card */}
      <Card className="overflow-hidden border-[var(--brand-gold)]/30 bg-gradient-to-br from-[var(--brand-gold)]/5 to-[var(--brand-navy)]/5">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Send className="h-4 w-4 text-[var(--brand-gold)]" />
            <h4 className="font-semibold text-foreground">Send to Client</h4>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <span>{branch.address}</span>
            </div>
            {isUrl(branch.mapLink) && (
              <div className="flex items-start gap-2">
                <ExternalLink className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <a href={branch.mapLink!} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-navy)] dark:text-[var(--brand-gold-light)] hover:underline break-all">
                  {branch.mapLink}
                </a>
              </div>
            )}
            {branch.workingHours && (
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <span>{branch.workingHours}</span>
              </div>
            )}
            {branch.submissionHours && (
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{branch.submissionHours}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <CopyButton text={copyAllData} label="Copy Address + Location" size="md" />
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full h-10 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium"
            >
              <Send className="h-4 w-4" />
              Send via WhatsApp
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Separator() {
  return <div className="h-px bg-border" />
}

// ============================================================
// Main Page Component
// ============================================================
export default function Home() {
  const [data, setData] = useState<DirectoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()

  // Load directory data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/branches', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setData(json)
    } catch (e) {
      toast({ title: 'Failed to load data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Check admin auth on mount
  useEffect(() => {
    fetch('/api/admin/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.authenticated) {
          setAdminMode(true)
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true))
  }, [])

  // Country suggestions
  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q || !data) return []
    return data.countries.filter(c => {
      const name = c.name.toLowerCase()
      const code = (c.code || '').toLowerCase()
      return name.includes(q) || code.startsWith(q) || code === q
    }).slice(0, 8)
  }, [searchQuery, data])

  const selectedBranch = useMemo(() => {
    if (!selectedCountry || !selectedBranchId) return null
    return selectedCountry.branches.find(b => b.id === selectedBranchId) || null
  }, [selectedCountry, selectedBranchId])

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country)
    setSelectedBranchId('')
    setSearchQuery(`${country.flag || ''} ${country.name}`.trim())
    setShowSuggestions(false)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAdminMode(false)
    setShowAdmin(false)
    toast({ title: 'Logged out' })
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          countryCount={0}
          branchCount={0}
          loading
          onAdminClick={() => {}}
          adminMode={false}
          onLogout={() => {}}
          authChecked={false}
        />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    )
  }

  // Admin mode
  if (adminMode && authChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          countryCount={data?.stats.countryCount || 0}
          branchCount={data?.stats.branchCount || 0}
          onAdminClick={() => setAdminMode(false)}
          adminMode
          onLogout={handleLogout}
          authChecked
        />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
          <AdminPanel onDataChanged={loadData} />
        </main>
        <footer className="border-t bg-card/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-muted-foreground font-mono">
            © 2026 Global EIS · Branch Directory · Admin Mode
          </div>
        </footer>
      </div>
    )
  }

  // Public mode
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        countryCount={data?.stats.countryCount || 0}
        branchCount={data?.stats.branchCount || 0}
        onAdminClick={() => setShowAdmin(true)}
        adminMode={false}
        onLogout={() => {}}
        authChecked={authChecked}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Head Office */}
        {data?.headOffice && (
          <div className="mb-6">
            <HeadOfficePill office={data.headOffice} />
          </div>
        )}

        {/* Section title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">
            Find a Branch
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Type a country name or code (e.g. FR, IT, JP)
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Type country name or code (e.g. FR)"
              className="pl-10 h-12 text-base"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCountry(null)
                  setSelectedBranchId('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute z-50 top-full mt-2 left-0 right-0 p-0 overflow-hidden animate-fade-in">
              <div className="max-h-72 overflow-y-auto">
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectCountry(c)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 text-left border-b last:border-b-0"
                  >
                    <span className="text-2xl">{c.flag || '🌍'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {c.code} · {c.branches.length} branch{c.branches.length !== 1 ? 'es' : ''}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Branch selector */}
        {selectedCountry && (
          <div className="mb-6 animate-fade-in-up">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
              Select a branch in {selectedCountry.name}
            </Label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="— Select a branch —" />
              </SelectTrigger>
              <SelectContent>
                {selectedCountry.branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Result */}
        {!selectedCountry && (
          <Card className="border-dashed">
            <div className="p-12 text-center text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Search for a country above to see branch details.</p>
            </div>
          </Card>
        )}

        {selectedCountry && !selectedBranch && (
          <Card className="border-dashed">
            <div className="p-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a branch above to see details.</p>
            </div>
          </Card>
        )}

        {selectedBranch && selectedCountry && data?.headOffice && (
          <BranchDetails
            branch={selectedBranch}
            country={selectedCountry}
            headOffice={data.headOffice}
          />
        )}
        {selectedBranch && selectedCountry && !data?.headOffice && (
          <BranchDetails
            branch={selectedBranch}
            country={selectedCountry}
            headOffice={null}
          />
        )}
      </main>

      <footer className="border-t bg-card/30 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-muted-foreground font-mono">
          © 2026 Global EIS · Branch Directory
        </div>
      </footer>

      {/* Admin login dialog */}
      <AdminLogin
        open={showAdmin}
        onOpenChange={setShowAdmin}
        onSuccess={() => {
          setAdminMode(true)
          setShowAdmin(false)
        }}
      />
    </div>
  )
}

// ============================================================
// Header
// ============================================================
function Header({
  countryCount, branchCount, loading, onAdminClick, adminMode, onLogout, authChecked,
}: {
  countryCount: number
  branchCount: number
  loading?: boolean
  onAdminClick: () => void
  adminMode: boolean
  onLogout: () => void
  authChecked: boolean
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-white p-1 shadow-sm">
              <Image
                src="/logo.png"
                alt="Global EIS"
                width={32}
                height={32}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block border-l pl-3">
              <h1 className="text-sm font-semibold leading-tight">Branch Directory</h1>
              <p className="text-[10px] text-muted-foreground font-mono leading-tight">
                Global EIS · Visa Application Centers
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--brand-navy)] dark:text-[var(--brand-gold-light)] font-mono">
                {loading ? <Skeleton className="h-5 w-8" /> : <AnimatedCounter value={countryCount} />}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                countries
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--brand-navy)] dark:text-[var(--brand-gold-light)] font-mono">
                {loading ? <Skeleton className="h-5 w-8" /> : <AnimatedCounter value={branchCount} />}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                branches
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {authChecked && (
              adminMode ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAdminClick}
                    className="hidden sm:flex gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    View Site
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    title="Logout"
                    className="h-9 w-9"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAdminClick}
                  title="Admin"
                  className="h-9 w-9"
                >
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
