'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Building2, ArrowRight, LogOut } from 'lucide-react'

interface Company {
  id: string
  name: string
  address: string
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Cek sesi aktif saat halaman dimuat / direfresh
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      fetchCompanies()
    }

    checkUser()

    // Listener untuk memantau perubahan status Auth (misal token expired / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*')
    if (error) {
      console.error('Error fetching companies:', error.message)
    } else {
      setCompanies(data || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header Dashboard */}
        <div className="mb-8 flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pilih Perusahaan</h1>
            <p className="text-sm text-gray-500">Silakan pilih perusahaan untuk mengelola SPH & Invoice</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>

        {/* Daftar Kartu Perusahaan */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat data perusahaan...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => router.push(`/company/${company.id}/invoice`)}
                className="group cursor-pointer rounded-2xl bg-white p-8 shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 size={28} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{company.name}</h2>
                  <p className="text-sm text-gray-500">{company.address}</p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4 text-blue-600 font-medium text-sm">
                  <span>Kelola Dokumen</span>
                  <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}