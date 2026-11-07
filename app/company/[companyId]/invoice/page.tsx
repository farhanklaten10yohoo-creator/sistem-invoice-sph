'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Plus, ArrowLeft, Building2, Pencil, Trash2 } from 'lucide-react'
import InvoiceModal from '@/components/InvoiceModal'
import InvoicePreview from '@/components/InvoicePreview'

export default function InvoicePage() {
  const params = useParams()
  const companyId = params?.companyId as string

  const [company, setCompany] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState<any[]>([])
  
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
      if (companyId) fetchCompanyAndInvoices()
    }
    checkAuth()
  }, [companyId, router])

  const fetchCompanyAndInvoices = async () => {
    setLoading(true)
    const { data: compData } = await supabase.from('companies').select('*').eq('id', companyId).single()
    if (compData) setCompany(compData)

    const { data: invData } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (invData) {
      setInvoices(invData)
      if (invData.length > 0) {
        const currentSelected = selectedInvoice ? invData.find(i => i.id === selectedInvoice.id) : invData[0]
        if (currentSelected) {
          selectInvoiceDetail(currentSelected.id, invData)
        }
      } else {
        setSelectedInvoice(null)
        setSelectedInvoiceItems([])
      }
    }
    setLoading(false)
  }

  const selectInvoiceDetail = async (invoiceId: string, list = invoices) => {
    const inv = list.find((i) => i.id === invoiceId)
    if (!inv) return

    const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', inv.id)
    setSelectedInvoice(inv)
    setSelectedInvoiceItems(items || [])
  }

  const handleDelete = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Apakah Anda yakin ingin menghapus invoice ini?')) return

    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId)

    if (error) {
      alert('Gagal menghapus: ' + error.message)
    } else {
      fetchCompanyAndInvoices()
    }
  }

  const handleOpenEdit = (inv: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditData(inv)
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
          <button className="bg-white text-blue-600 shadow-sm px-4 py-1.5 rounded-md font-semibold text-xs">
            Invoice
          </button>
          <button
            onClick={() => router.push(`/company/${companyId}/sph`)}
            className="text-gray-600 hover:text-gray-900 px-4 py-1.5 rounded-md font-semibold text-xs transition"
          >
            Surat Penawaran Harga (SPH)
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 p-6 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h2 className="font-bold text-gray-800 text-sm">Arsip Invoice</h2>
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
            ) : invoices.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada invoice</p>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => selectInvoiceDetail(inv.id)}
                  className={`cursor-pointer p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                    selectedInvoice?.id === inv.id
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex-1 truncate pr-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800">{inv.invoice_number}</span>
                      <span className="text-gray-500 text-[10px]">{inv.date}</span>
                    </div>
                    <p className="text-gray-600 truncate mb-1">{inv.client_name}</p>
                    {inv.updated_at && (
                      <p className="text-[9px] text-gray-400 italic">
                        Edited by {inv.updated_by} ({new Date(inv.updated_at).toLocaleDateString('id-ID')})
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(inv, e)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(inv.id, e)}
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
          {selectedInvoice ? (
            <InvoicePreview
              data={{
                ...selectedInvoice,
                company: company,
                items: selectedInvoiceItems,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-white rounded-xl border border-gray-200 p-12 text-gray-400 text-sm">
              Silakan pilih atau buat invoice terlebih dahulu.
            </div>
          )}
        </div>
      </div>

      <InvoiceModal
        companyId={companyId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCompanyAndInvoices}
        editData={editData}
      />
    </div>
  )
}