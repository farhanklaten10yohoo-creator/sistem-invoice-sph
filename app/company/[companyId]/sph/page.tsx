'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Plus, ArrowLeft, Building2, Pencil, Trash2 } from 'lucide-react'
import SphModal from '@/components/SphModal'
import SphPreview from '@/components/SphPreview'

// Komponen utama yang menggunakan useParams dibungkus di sini
function SphContent() {
  const params = useParams()
  const companyId = params?.companyId as string

  const [company, setCompany] = useState<any>(null)
  const [sphList, setSphList] = useState<any[]>([])
  const [selectedSph, setSelectedSph] = useState<any | null>(null)
  const [selectedSphItems, setSelectedSphItems] = useState<any[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      if (companyId) fetchCompanyAndSph()
    }
    checkAuth()
  }, [companyId, router])

  const fetchCompanyAndSph = async () => {
    setLoading(true)
    const { data: compData } = await supabase.from('companies').select('*').eq('id', companyId).single()
    if (compData) setCompany(compData)

    const { data: sphData } = await supabase
      .from('sph')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (sphData) {
      setSphList(sphData)
      if (sphData.length > 0) {
        const currentSelected = selectedSph ? sphData.find(s => s.id === selectedSph.id) : sphData[0]
        if (currentSelected) {
          selectSphDetail(currentSelected.id, sphData)
        }
      } else {
        setSelectedSph(null)
        setSelectedSphItems([])
      }
    }
    setLoading(false)
  }

  const selectSphDetail = async (sphId: string, list = sphList) => {
    const sph = list.find((s) => s.id === sphId)
    if (!sph) return

    const { data: items } = await supabase.from('sph_items').select('*').eq('sph_id', sph.id)
    setSelectedSph(sph)
    setSelectedSphItems(items || [])
  }

  const handleDelete = async (sphId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Apakah Anda yakin ingin menghapus SPH ini?')) return

    await supabase.from('sph_items').delete().eq('sph_id', sphId)
    const { error } = await supabase.from('sph').delete().eq('id', sphId)

    if (error) {
      alert('Gagal menghapus: ' + error.message)
    } else {
      fetchCompanyAndSph()
    }
  }

  const handleOpenEdit = (sph: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditData(sph)
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditData(null)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={16} /> Ganti Perusahaan
          </button>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            <h1 className="font-bold text-gray-800">{company?.name || 'Memuat...'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => router.push(`/company/${companyId}/invoice`)}
            className="text-gray-600 hover:text-gray-900 px-4 py-1.5 rounded-md font-semibold text-xs transition"
          >
            Invoice
          </button>
          <button className="bg-white text-blue-600 shadow-sm px-4 py-1.5 rounded-md font-semibold text-xs">
            Surat Penawaran Harga (SPH)
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 p-6 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h2 className="font-bold text-gray-800 text-sm">Arsip SPH</h2>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition"
            >
              <Plus size={14} /> Buat Baru
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">Memuat data...</p>
            ) : sphList.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada SPH</p>
            ) : (
              sphList.map((sph) => (
                <div
                  key={sph.id}
                  onClick={() => selectSphDetail(sph.id)}
                  className={`cursor-pointer p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                    selectedSph?.id === sph.id
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex-1 truncate pr-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800">{sph.sph_number}</span>
                      <span className="text-gray-500 text-[10px]">{sph.date}</span>
                    </div>
                    <p className="text-gray-600 truncate mb-1">{sph.client_name}</p>
                    {sph.updated_at && (
                      <p className="text-[9px] text-gray-400 italic">
                        Edited by {sph.updated_by} ({new Date(sph.updated_at).toLocaleDateString('id-ID')})
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(sph, e)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(sph.id, e)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-3 overflow-y-auto">
          {selectedSph ? (
            <SphPreview
              data={{
                ...selectedSph,
                company: company,
                items: selectedSphItems,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-white rounded-xl border border-gray-200 p-12 text-gray-400 text-sm">
              Silakan pilih atau buat SPH terlebih dahulu.
            </div>
          )}
        </div>
      </div>

      <SphModal
        companyId={companyId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCompanyAndSph}
        editData={editData}
      />
    </div>
  )
}

// Wrapper utama dengan Suspense untuk memenuhi aturan Next.js 16
export default function SphPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">Memuat halaman SPH...</div>}>
      <SphContent />
    </Suspense>
  )
}