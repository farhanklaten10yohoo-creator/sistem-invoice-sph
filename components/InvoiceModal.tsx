'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Plus, Trash2 } from 'lucide-react'

interface InvoiceModalProps {
  companyId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: any | null // Data yang mau diedit (jika ada)
}

export default function InvoiceModal({ companyId, isOpen, onClose, onSuccess, editData }: InvoiceModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [useDp, setUseDp] = useState(false)
  const [notes, setNotes] = useState('')
  const [signatory, setSignatory] = useState('Candra Eka Dharmawan')
  
  const [items, setItems] = useState([{ item_name: '', quantity: '' as string | number, price: '' as string | number }])
  const [savedCustomers, setSavedCustomers] = useState<{ name: string; address: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchExistingCustomers()
      if (editData) {
        // Mode Edit: Isi form dengan data yang sudah ada
        setInvoiceNumber(editData.invoice_number)
        setDate(editData.date)
        setClientName(editData.client_name)
        setClientAddress(editData.client_address)
        setUseDp(editData.use_dp)
        setNotes(editData.notes || '')
        setSignatory(editData.signatory || 'Candra Eka Dharmawan')
        
        // Ambil item barang terkait invoice ini
        fetchInvoiceItems(editData.id)
      } else {
        // Mode Tambah Baru
        setClientName('')
        setClientAddress('')
        setNotes('')
        setUseDp(false)
        setItems([{ item_name: '', quantity: '', price: '' }])
        setDate(new Date().toISOString().split('T')[0])
        generateAutoNumber()
      }
    }
  }, [isOpen, editData, companyId])

  const fetchInvoiceItems = async (invoiceId: string) => {
    const { data } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId)
    if (data && data.length > 0) {
      setItems(data.map(i => ({ item_name: i.item_name, quantity: i.quantity, price: i.price })))
    }
  }

  const generateAutoNumber = async () => {
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const nextNumber = (count || 0) + 1
    const paddedNum = String(nextNumber).padStart(4, '0')
    const currentYear = new Date().getFullYear()
    setInvoiceNumber(`INV-${currentYear}-${paddedNum}`)
  }

  const fetchExistingCustomers = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('client_name, client_address')
      .eq('company_id', companyId)

    if (data) {
      const uniqueMap = new Map()
      data.forEach((item) => {
        if (item.client_name && !uniqueMap.has(item.client_name)) {
          uniqueMap.set(item.client_name, item.client_address)
        }
      })
      const list = Array.from(uniqueMap, ([name, address]) => ({ name, address }))
      setSavedCustomers(list)
    }
  }

  const handleCustomerSelect = (name: string) => {
    setClientName(name)
    const found = savedCustomers.find((c) => c.name === name)
    if (found) {
      setClientAddress(found.address)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { item_name: '', quantity: '', price: '' }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Dapatkan username yang sedang login (mengambil dari local/session user email)
    const { data: { user } } = await supabase.auth.getUser()
    const username = user?.email ? user.email.split('@')[0] : 'Admin'
    const nowIso = new Date().toISOString()

    if (editData) {
      // --- PROSES EDIT ---
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          date,
          client_name: clientName,
          client_address: clientAddress,
          use_dp: useDp,
          notes,
          signatory,
          updated_at: nowIso,
          updated_by: username,
        })
        .eq('id', editData.id)

      if (updateError) {
        alert('Gagal mengupdate invoice: ' + updateError.message)
        setLoading(false)
        return
      }

      // Hapus item lama, lalu masukkan item baru
      await supabase.from('invoice_items').delete().eq('invoice_id', editData.id)
      
      const invoiceItems = items.map((item) => {
        const qty = Number(item.quantity) || 0
        const prc = Number(item.price) || 0
        return {
          invoice_id: editData.id,
          item_name: item.item_name,
          quantity: qty,
          price: prc,
          total: qty * prc,
        }
      })
      await supabase.from('invoice_items').insert(invoiceItems)

    } else {
      // --- PROSES TAMBAH BARU ---
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert([
          {
            company_id: companyId,
            invoice_number: invoiceNumber,
            date,
            client_name: clientName,
            client_address: clientAddress,
            use_dp: useDp,
            notes,
            signatory,
          },
        ])
        .select()
        .single()

      if (invError || !invData) {
        alert('Gagal menyimpan invoice: ' + invError?.message)
        setLoading(false)
        return
      }

      const invoiceItems = items.map((item) => {
        const qty = Number(item.quantity) || 0
        const prc = Number(item.price) || 0
        return {
          invoice_id: invData.id,
          item_name: item.item_name,
          quantity: qty,
          price: prc,
          total: qty * prc,
        }
      })

      await supabase.from('invoice_items').insert(invoiceItems)
    }

    setLoading(false)
    onSuccess()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl relative my-8">
        <div className="flex justify-between items-center pb-4 border-b mb-4">
          <h2 className="text-lg font-bold text-gray-800">{editData ? 'Edit Invoice' : 'Buat Invoice Baru'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">No. Invoice</label>
              <input
                type="text"
                disabled
                value={invoiceNumber}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 text-gray-500 font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Nama Customer</label>
              <input
                type="text"
                list="customer-list"
                required
                value={clientName}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                placeholder="Ketik atau pilih customer..."
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              />
              <datalist id="customer-list">
                {savedCustomers.map((c, i) => (
                  <option key={i} value={c.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Alamat Customer</label>
              <textarea
                required
                rows={2}
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Alamat lengkap customer..."
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-gray-700">Rincian Barang</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} /> Tambah Barang
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Nama Barang"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Jumlah"
                    value={item.quantity}
                    onFocus={(e) => e.target.value === '0' && handleItemChange(index, 'quantity', '')}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-20 rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none text-center"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Harga Satuan"
                    value={item.price}
                    onFocus={(e) => e.target.value === '0' && handleItemChange(index, 'price', '')}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    className="w-28 rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none text-right"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="use_dp"
              checked={useDp}
              onChange={(e) => setUseDp(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="use_dp" className="font-medium text-gray-700 cursor-pointer">
              Gunakan Opsi DP 50% (Tampilkan Total DP & Kekurangan Bayar)
            </label>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Catatan Pembayaran</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pembayaran melalui Rekening BRI..."
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-600 hover:bg-gray-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : editData ? 'Simpan Perubahan' : 'Simpan Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}