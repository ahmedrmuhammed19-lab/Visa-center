'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function AdminLogin({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Reset on close
  useEffect(() => {
    if (!open) {
      setUsername('')
      setPassword('')
      setLoading(false)
    }
  }, [open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast({ title: 'Please fill in both fields', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }
      toast({ title: 'Welcome back, admin!' })
      onSuccess()
    } catch (err: any) {
      toast({ title: err.message || 'Login failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card rgb-border-card">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--brand-navy)] to-[var(--rgb-violet)] flex items-center justify-center shadow-lg glow-violet">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-gradient">Admin Login</DialogTitle>
              <DialogDescription className="font-mono text-xs">◆ Restricted access — Global EIS staff only.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider">Username</Label>
            <Input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              disabled={loading}
              required
              className="input-glow h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              required
              className="input-glow h-11"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-rgb">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login →'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
