'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Plus, Trash2 } from 'lucide-react'

interface SphModalProps {
  companyId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: any | null
}

export default function SphModal({ companyId, isOpen, onClose, onSuccess, editData }: SphModalProps) {
  const [sphNumber, setSphNumber] = useState('')
  const [perihal, setPerihal] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [signatory, setSignatory] = useState('Candra Eka Dharmawan')

  const [items, setItems] = useState([{ item_name: '', quantity: '' as string | number, price: '' as string | number }])
  const [savedCustomers, setSavedCustomers] = useState<{ name: string; address: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchExistingCustomers()
      if (editData) {
        setSphNumber(editData.sph_number)
        setDate(editData.date)
        setPerihal(editData.perihal)
        setClientName(editData.client_name)
        setClientAddress(editData.client_address)
        setSignatory(editData.signatory || 'Candra Eka Dharmawan')
        fetchSphItems(editData.id)
      } else {
        setClientName('')
        setClientAddress('')
        setPerihal('')
        setItems([{ item_name: '', quantity: '', price: '' }])
        setDate(new Date().toISOString().split('T')[0])
        generateAutoNumber()
      }
    }
  }, [isOpen, editData, companyId])

  const fetchSphItems = async (sphId: string) => {
    const { data } = await supabase.from('sph_items').select('*').eq('sph_id', sphId)
    if (data && data.length > 0) {
      setItems(data.map(i => ({ item_name: i.item_name, quantity: i.quantity, price: i.price })))
    }
  }

  const generateAutoNumber = async () => {
    const { count } = await supabase
      .from('sph')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const nextNumber = (count || 0) + 1
    const paddedNum = String(nextNumber).padStart(3, '0')

    const now = new Date()
    const monthNamesRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    const currentMonthRoman = monthNamesRoman[now.getMonth()]
    const currentYear = now.getFullYear()

    setSphNumber(`${paddedNum}/${currentMonthRoman}/SMG-IN/${currentYear}`)
  }

  const fetchExistingCustomers = async () => {
    const { data } = await supabase
      .from('sph')
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

    const { data: { user } } = await supabase.auth.getUser()
    const username = user?.email ? user.email.split('@')[0] : 'Admin'
    const nowIso = new Date().toISOString()

    if (editData) {
      const { error: updateError } = await supabase
        .from('sph')
        .update({
          perihal,
          date,
          client_name: clientName,
          client_address: clientAddress,
          signatory,
          updated_at: nowIso,
          updated_by: username,
        })
        .eq('id', editData.id)

      if (updateError) {
        alert('Gagal mengupdate SPH: ' + updateError.message)
        setLoading(false)
        return
      }

      await supabase.from('sph_items').delete().eq('sph_id', editData.id)

      const sphItems = items.map((item) => {
        const qty = Number(item.quantity) || 0
        const prc = Number(item.price) || 0
        return {
          sph_id: editData.id,
          item_name: item.item_name,
          quantity: qty,
          price: prc,
          total: qty * prc,
        }
      })
      await supabase.from('sph_items').insert(sphItems)

    } else {
      const { data: sphData, error: sphError } = await supabase
        .from('sph')
        .insert([
          {
            company_id: companyId,
            sph_number: sphNumber,
            perihal,
            date,
            client_name: clientName,
            client_address: clientAddress,
            signatory,
          },
        ])
        .select()
        .single()

      if (sphError || !sphData) {
        alert('Gagal menyimpan SPH: ' + sphError?.message)
        setLoading(false)
        return
      }

      const sphItems = items.map((item) => {
        const qty = Number(item.quantity) || 0
        const prc = Number(item.price) || 0
        return {
          sph_id: sphData.id,
          item_name: item.item_name,
          quantity: qty,
          price: prc,
          total: qty * prc,
        }
      })

      await supabase.from('sph_items').insert(sphItems)
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
          <h2 className="text-lg font-bold text-gray-800">{editData ? 'Edit Surat Penawaran Harga (SPH)' : 'Buat SPH Baru'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">No. SPH</label>
              <input
                type="text"
                disabled
                value={sphNumber}
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

          <div>
            <label className="block font-medium text-gray-700 mb-1">Perihal</label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Contoh: Penawaran Cetak Buku & Kalender..."
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Nama Customer</label>
              <input
                type="text"
                list="sph-customer-list"
                required
                value={clientName}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                placeholder="Ketik atau pilih customer..."
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              />
              <datalist id="sph-customer-list">
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
              {loading ? 'Menyimpan...' : editData ? 'Simpan Perubahan' : 'Simpan SPH'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}