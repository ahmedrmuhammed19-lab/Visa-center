'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Plus, Pencil, Trash2, Building2, Globe, MapPin, Loader2, AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Flag } from '@/components/flag'

// ============================================================
// Types (must match the page.tsx types)
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
  branches?: Branch[]
  _count?: { branches: number }
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

// ============================================================
// Main Admin Panel
// ============================================================
export function AdminPanel({ onDataChanged }: { onDataChanged: () => Promise<void> | void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-gradient">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2 font-mono">
          ◍ Manage countries, branches, and head office info.
        </p>
      </div>

      <Tabs defaultValue="branches" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md glass-card">
          <TabsTrigger value="branches" className="tab-rgb-active data-[state=active]:text-white">Branches</TabsTrigger>
          <TabsTrigger value="countries" className="tab-rgb-active data-[state=active]:text-white">Countries</TabsTrigger>
          <TabsTrigger value="head-office" className="tab-rgb-active data-[state=active]:text-white">Head Office</TabsTrigger>
        </TabsList>

        <TabsContent value="branches">
          <BranchesManager onDataChanged={onDataChanged} />
        </TabsContent>

        <TabsContent value="countries">
          <CountriesManager onDataChanged={onDataChanged} />
        </TabsContent>

        <TabsContent value="head-office">
          <HeadOfficeManager onDataChanged={onDataChanged} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================
// Branches Manager
// ============================================================
function BranchesManager({ onDataChanged }: { onDataChanged: () => Promise<void> | void }) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCountryId, setFilterCountryId] = useState<string>('all')
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, cRes] = await Promise.all([
        fetch('/api/admin/branches', { cache: 'no-store' }),
        fetch('/api/admin/countries', { cache: 'no-store' }),
      ])
      if (!bRes.ok || !cRes.ok) throw new Error('Failed to load')
      const [bData, cData] = await Promise.all([bRes.json(), cRes.json()])
      setBranches(bData.branches || [])
      setCountries(cData.countries || [])
    } catch (e: any) {
      toast({ title: e.message || 'Load failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const filtered = filterCountryId === 'all'
    ? branches
    : branches.filter(b => b.countryId === filterCountryId)

  const handleDelete = async () => {
    if (!deletingBranch) return
    try {
      const res = await fetch(`/api/admin/branches/${deletingBranch.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Branch deleted' })
      setDeletingBranch(null)
      await load()
      await onDataChanged()
    } catch (e: any) {
      toast({ title: e.message || 'Delete failed', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Loading branches...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-xs font-mono uppercase text-muted-foreground">Filter</Label>
          <Select value={filterCountryId} onValueChange={setFilterCountryId}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2"><Flag country={c.name} code={c.code} flag={c.flag} size="sm" /> {c.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => { setEditingBranch(null); setShowForm(true) }}
          className="btn-rgb"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No branches found. Click "Add Branch" to create one.</p>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map(b => {
            const country = countries.find(c => c.id === b.countryId)
            return (
              <Card key={b.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="secondary" className="font-mono">
                        <Flag country={country?.name} code={country?.code} flag={country?.flag} size="sm" /> {country?.name || 'Unknown'}
                      </Badge>
                      <Badge variant="outline" className="font-mono">{b.visaCenter}</Badge>
                    </div>
                    <div className="font-medium text-sm truncate">{b.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {b.city} · {b.phone}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditingBranch(b); setShowForm(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingBranch(b)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Form dialog */}
      <BranchForm
        open={showForm}
        onOpenChange={setShowForm}
        branch={editingBranch}
        countries={countries}
        onSaved={async () => { await load(); await onDataChanged() }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deletingBranch} onOpenChange={(o) => !o && setDeletingBranch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingBranch?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================================
// Branch Form (Add/Edit)
// ============================================================
function BranchForm({
  open, onOpenChange, branch, countries, onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  branch: Branch | null
  countries: Country[]
  onSaved: () => Promise<void> | void
}) {
  const [form, setForm] = useState({
    countryId: '',
    name: '', city: '', address: '', phone: '', visaCenter: '',
    reference: '', mapLink: '', workingHours: '', submissionHours: '',
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (branch) {
      setForm({
        countryId: branch.countryId,
        name: branch.name, city: branch.city, address: branch.address,
        phone: branch.phone, visaCenter: branch.visaCenter,
        reference: branch.reference || '', mapLink: branch.mapLink || '',
        workingHours: branch.workingHours || '', submissionHours: branch.submissionHours || '',
      })
    } else {
      setForm({
        countryId: countries[0]?.id || '',
        name: '', city: '', address: '', phone: '', visaCenter: '',
        reference: '', mapLink: '', workingHours: '', submissionHours: '',
      })
    }
  }, [branch, countries, open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.countryId || !form.name || !form.city || !form.address || !form.phone || !form.visaCenter) {
      toast({ title: 'All required fields must be filled', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const url = branch ? `/api/admin/branches/${branch.id}` : '/api/admin/branches'
      const method = branch ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed')
      }
      toast({ title: branch ? 'Branch updated' : 'Branch created' })
      onOpenChange(false)
      await onSaved()
    } catch (e: any) {
      toast({ title: e.message || 'Save failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{branch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
          <DialogDescription>
            {branch ? 'Update branch details.' : 'Fill in the form to add a new branch.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Country <span className="text-destructive">*</span></Label>
              <Select value={form.countryId} onValueChange={v => setForm({ ...form, countryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.id} value={c.id}><span className="flex items-center gap-2"><Flag country={c.name} code={c.code} flag={c.flag} size="sm" /> {c.name}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visa Center <span className="text-destructive">*</span></Label>
              <Input
                value={form.visaCenter}
                onChange={e => setForm({ ...form, visaCenter: e.target.value })}
                placeholder="VFS GLOBAL, TLScontact, etc."
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Branch Name <span className="text-destructive">*</span></Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. France Visa Application Center - Cairo"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>City <span className="text-destructive">*</span></Label>
              <Input
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Cairo, Alexandria, etc."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone <span className="text-destructive">*</span></Label>
              <Input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="02 25356762"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Address <span className="text-destructive">*</span></Label>
            <Textarea
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Full address"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Google Maps Link</Label>
              <Input
                value={form.mapLink}
                onChange={e => setForm({ ...form, mapLink: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
                type="url"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reference Link</Label>
              <Input
                value={form.reference}
                onChange={e => setForm({ ...form, reference: e.target.value })}
                placeholder="https://visa.vfsglobal.com/..."
                type="url"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Working Hours</Label>
              <Input
                value={form.workingHours}
                onChange={e => setForm({ ...form, workingHours: e.target.value })}
                placeholder="Sun-Thu 09:00 AM to 04:00 PM"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Submission Hours (optional)</Label>
              <Input
                value={form.submissionHours}
                onChange={e => setForm({ ...form, submissionHours: e.target.value })}
                placeholder="Submission of applications: 9:00 AM to 12:00 PM"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-rgb">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {branch ? 'Save Changes' : 'Add Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Countries Manager
// ============================================================
function CountriesManager({ onDataChanged }: { onDataChanged: () => Promise<void> | void }) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Country | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Country | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/countries', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setCountries(data.countries || [])
    } catch (e: any) {
      toast({ title: e.message || 'Load failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!deleting) return
    try {
      const res = await fetch(`/api/admin/countries/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed')
      }
      toast({ title: 'Country deleted (and its branches)' })
      setDeleting(null)
      await load()
      await onDataChanged()
    } catch (e: any) {
      toast({ title: e.message || 'Delete failed', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{countries.length} countries</p>
        <Button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-rgb" size="sm">
          <Plus className="h-4 w-4" />
          Add Country
        </Button>
      </div>

      <div className="grid gap-2">
        {countries.map(c => (
          <Card key={c.id} className="p-4 hover:bg-accent/30 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Flag country={c.name} code={c.code} flag={c.flag} size="lg" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <span>{c.code || '—'}</span>
                    <span>·</span>
                    <span>{c._count?.branches ?? c.branches?.length ?? 0} branches</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(c); setShowForm(true) }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(c)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <CountryForm
        open={showForm}
        onOpenChange={setShowForm}
        country={editing}
        onSaved={async () => { await load(); await onDataChanged() }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>
                This will permanently delete <strong>{deleting?.name}</strong> and <strong>all its branches</strong> ({deleting?._count?.branches ?? 0}).
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Country
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CountryForm({
  open, onOpenChange, country, onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  country: Country | null
  onSaved: () => Promise<void> | void
}) {
  const [form, setForm] = useState({ name: '', code: '', flag: '🌍' })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (country) {
      setForm({ name: country.name, code: country.code || '', flag: country.flag || '🌍' })
    } else {
      setForm({ name: '', code: '', flag: '🌍' })
    }
  }, [country, open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast({ title: 'Name is required', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const url = country ? `/api/admin/countries/${country.id}` : '/api/admin/countries'
      const method = country ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed')
      }
      toast({ title: country ? 'Country updated' : 'Country created' })
      onOpenChange(false)
      await onSaved()
    } catch (e: any) {
      toast({ title: e.message || 'Save failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{country ? 'Edit Country' : 'Add Country'}</DialogTitle>
          <DialogDescription>
            {country ? 'Update country details.' : 'Add a new country to the directory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Country Name <span className="text-destructive">*</span></Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Russia"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>ISO Code</Label>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="RU"
                maxLength={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Flag (emoji)</Label>
              <Input
                value={form.flag}
                onChange={e => setForm({ ...form, flag: e.target.value })}
                placeholder="🇷🇺"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-rgb">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {country ? 'Save Changes' : 'Add Country'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Head Office Manager
// ============================================================
function HeadOfficeManager({ onDataChanged }: { onDataChanged: () => Promise<void> | void }) {
  const [offices, setOffices] = useState<HeadOffice[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<HeadOffice | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<HeadOffice | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/head-office', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setOffices(data.offices || [])
    } catch (e: any) {
      toast({ title: e.message || 'Load failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!deleting) return
    try {
      const res = await fetch(`/api/admin/head-office/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Head office deleted' })
      setDeleting(null)
      await load()
      await onDataChanged()
    } catch (e: any) {
      toast({ title: e.message || 'Delete failed', variant: 'destructive' })
    }
  }

  const toggleActive = async (office: HeadOffice) => {
    try {
      const res = await fetch(`/api/admin/head-office/${office.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !office.isActive }),
      })
      if (!res.ok) throw new Error('Failed')
      toast({ title: office.isActive ? 'Deactivated' : 'Activated' })
      await load()
      await onDataChanged()
    } catch (e: any) {
      toast({ title: e.message || 'Failed', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{offices.length} office(s)</p>
        <Button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-rgb" size="sm">
          <Plus className="h-4 w-4" />
          Add Head Office
        </Button>
      </div>

      {offices.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No head office yet. Add one to show on the public directory.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {offices.map(o => (
            <Card key={o.id} className={`p-4 ${o.isActive ? 'border-l-4 border-l-[var(--brand-gold)]' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{o.labelEn}</span>
                    {o.isActive && <Badge className="bg-green-600">Active</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="truncate">{o.addressEn}</div>
                    <div className="truncate font-mono">{o.hoursEn}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={o.isActive} onCheckedChange={() => toggleActive(o)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(o); setShowForm(true) }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(o)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <HeadOfficeForm
        open={showForm}
        onOpenChange={setShowForm}
        office={editing}
        onSaved={async () => { await load(); await onDataChanged() }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this head office?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleting?.labelEn}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function HeadOfficeForm({
  open, onOpenChange, office, onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  office: HeadOffice | null
  onSaved: () => Promise<void> | void
}) {
  const [form, setForm] = useState({
    labelAr: '', labelEn: '',
    addressAr: '', addressEn: '',
    hoursAr: '', hoursEn: '',
    mapLink: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (office) {
      setForm({
        labelAr: office.labelAr, labelEn: office.labelEn,
        addressAr: office.addressAr, addressEn: office.addressEn,
        hoursAr: office.hoursAr, hoursEn: office.hoursEn,
        mapLink: office.mapLink,
        isActive: office.isActive,
      })
    } else {
      setForm({
        labelAr: '', labelEn: '',
        addressAr: '', addressEn: '',
        hoursAr: '', hoursEn: '',
        mapLink: '',
        isActive: true,
      })
    }
  }, [office, open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const required = ['labelAr', 'labelEn', 'addressAr', 'addressEn', 'hoursAr', 'hoursEn', 'mapLink'] as const
    for (const k of required) {
      if (!form[k]) {
        toast({ title: 'All fields are required', variant: 'destructive' })
        return
      }
    }
    setLoading(true)
    try {
      const url = office ? `/api/admin/head-office/${office.id}` : '/api/admin/head-office'
      const method = office ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed')
      }
      toast({ title: office ? 'Head office updated' : 'Head office created' })
      onOpenChange(false)
      await onSaved()
    } catch (e: any) {
      toast({ title: e.message || 'Save failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{office ? 'Edit Head Office' : 'Add Head Office'}</DialogTitle>
          <DialogDescription>Bilingual (Arabic + English) info shown on the public directory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Label (Arabic) <span className="text-destructive">*</span></Label>
              <Input dir="rtl" value={form.labelAr} onChange={e => setForm({ ...form, labelAr: e.target.value })} placeholder="المقر الرئيسي" required />
            </div>
            <div className="space-y-1.5">
              <Label>Label (English) <span className="text-destructive">*</span></Label>
              <Input value={form.labelEn} onChange={e => setForm({ ...form, labelEn: e.target.value })} placeholder="Head Office" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Address (Arabic) <span className="text-destructive">*</span></Label>
            <Textarea dir="rtl" value={form.addressAr} onChange={e => setForm({ ...form, addressAr: e.target.value })} rows={2} required />
          </div>
          <div className="space-y-1.5">
            <Label>Address (English) <span className="text-destructive">*</span></Label>
            <Textarea value={form.addressEn} onChange={e => setForm({ ...form, addressEn: e.target.value })} rows={2} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Hours (Arabic) <span className="text-destructive">*</span></Label>
              <Input dir="rtl" value={form.hoursAr} onChange={e => setForm({ ...form, hoursAr: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Hours (English) <span className="text-destructive">*</span></Label>
              <Input value={form.hoursEn} onChange={e => setForm({ ...form, hoursEn: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Google Maps Link <span className="text-destructive">*</span></Label>
            <Input type="url" value={form.mapLink} onChange={e => setForm({ ...form, mapLink: e.target.value })} placeholder="https://maps.app.goo.gl/..." required />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} id="ho-active" />
            <Label htmlFor="ho-active">Set as active (will show on public directory)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-rgb">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {office ? 'Save Changes' : 'Add Head Office'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
