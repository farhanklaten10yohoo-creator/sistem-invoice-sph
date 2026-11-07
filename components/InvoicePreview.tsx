'use client'

import { Printer } from 'lucide-react'

interface InvoiceItem {
  item_name: string
  quantity: number
  price: number
  total: number
}

interface InvoiceData {
  invoice_number: string
  client_name: string
  client_address: string
  date: string
  use_dp: boolean
  notes: string
  signatory: string
  updated_at?: string
  updated_by?: string
  company: {
    name: string
    address: string
  }
  items: InvoiceItem[]
}

export default function InvoicePreview({ data }: { data: InvoiceData }) {
  const handlePrint = () => {
    window.print()
  }

  const subTotal = data.items.reduce((acc, item) => acc + item.total, 0)
  const dpAmount = data.use_dp ? subTotal * 0.5 : 0
  const remainingAmount = data.use_dp ? subTotal - dpAmount : 0

  const formattedUpdateDate = data.updated_at
    ? new Date(data.updated_at).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 shadow-md rounded-xl print-area">
      <div className="mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-blueBerikut adalah kode keseluruhan file **`components/InvoicePreview.tsx`** yang sudah diperbarui secara lengkap, di mana seluruh bagian judul kolom pada tabel (`NO.`, `NAMA BARANG`, `JML`, `HARGA`, dan `TOTAL`) dipastikan menggunakan kelas **`text-center`** agar posisinya berada tepat di tengah:

```tsx
'use client'

import { Printer } from 'lucide-react'

interface InvoiceItem {
  item_name: string
  quantity: number
  price: number
  total: number
}

interface InvoiceData {
  invoice_number: string
  client_name: string
  client_address: string
  date: string
  use_dp: boolean
  notes: string
  signatory: string
  updated_at?: string
  updated_by?: string
  company: {
    name: string
    address: string
  }
  items: InvoiceItem[]
}

export default function InvoicePreview({ data }: { data: InvoiceData }) {
  const handlePrint = () => {
    window.print()
  }

  const subTotal = data.items.reduce((acc, item) => acc + item.total, 0)
  const dpAmount = data.use_dp ? subTotal * 0.5 : 0
  const remainingAmount = data.use_dp ? subTotal - dpAmount : 0

  const formattedUpdateDate = data.updated_at
    ? new Date(data.updated_at).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 shadow-md rounded-xl print-area">
      <div className="mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
        >
          <Printer size="{18}"/> Cetak / Simpan PDF
        </button>
      </div>

      <div className="border border-gray-300 p-8 text-black text-sm">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-wide">{data.company?.name}</h1>
            <p className="text-xs uppercase text-gray-700">{data.company?.address}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black tracking-widest text-black">INVOICE</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-600">Kepada Yth,</p>
            <p className="font-semibold text-gray-900">{data.client_name || '-'}</p>
            <p className="text-xs text-gray-700 whitespace-pre-line">{data.client_address || '-'}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs"><span className="font-semibold">No. Invoice :</span> {data.invoice_number}</p>
            <p className="text-xs"><span className="font-semibold">Tanggal :</span> {data.date}</p>
          </div>
        </div>

        <div className="mb-4 text-xs space-y-1">
          <p className="italic">Assalamu&apos;alaikum Wr Wb</p>
          <p>Terima kasih atas kepercayaannya, mohon dibayarkan tagihan sebagai berikut :</p>
        </div>

        <table className="w-full border-collapse border border-black mb-4 text-xs">
          <thead>
            <tr className="bg-blue-600 text-white font-bold">
              <th className="border border-black py-2 px-2 w-10 text-center">NO.</th>
              <th className="border border-black py-2 px-4 text-center">NAMA BARANG</th>
              <th className="border border-black py-2 px-2 w-16 text-center">JML</th>
              <th className="border border-black py-2 px-4 text-center">HARGA</th>
              <th className="border border-black py-2 px-4 text-center">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="h-8">
                <td className="border border-black text-center font-medium">{index + 1}</td>
                <td className="border border-black px-2">{item.item_name}</td>
                <td className="border border-black text-center">{item.quantity.toLocaleString('id-ID')}</td>
                <td className="border border-black px-2 text-right">Rp {item.price.toLocaleString('id-ID')}</td>
                <td className="border border-black px-2 text-right">Rp {item.total.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-72 border border-black text-xs">
            <div className="flex justify-between bg-blue-600 text-white font-bold p-2">
              <span>SUB TOTAL</span>
              <span>Rp {subTotal.toLocaleString('id-ID')}</span>
            </div>
            {data.use_dp && (
              <>
                <div className="flex justify-between bg-gray-100 p-2 border-t border-black font-semibold">
                  <span>DP 50%</span>
                  <span>Rp {dpAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between bg-yellow-50 p-2 border-t border-black font-bold text-red-600">
                  <span>KEKURANGAN BAYAR</span>
                  <span>Rp {remainingAmount.toLocaleString('id-ID')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-6 text-xs space-y-1">
          <p>Demikian Invoice ini kami buat, atas kerjasamanya kami ucapkan terima kasih.</p>
          <p className="italic">Wassalamu&apos;alaikum Wr Wb</p>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <p className="text-xs font-semibold mb-1">Catatan/Keterangan Pembayaran</p>
            <div className="border border-black p-3 h-24 rounded text-xs whitespace-pre-line bg-gray-50">
              {data.notes || 'Silakan transfer melalui rekening perusahaan.'}
            </div>
          </div>
          <div className="text-center relative flex flex-col items-center">
            <p className="text-xs mb-1 font-medium">Hormat Kami,</p>
            
            <div className="h-16 flex items-center justify-center my-1">
              <img
                src="/tanda-tangan.png"
                alt="Tanda Tangan"
                className="h-16 object-contain"
              />
            </div>

            <p className="font-bold text-xs border-t border-black pt-1 inline-block px-4">{data.signatory || 'Candra Eka Dharmawan'}</p>
          </div>
        </div>

        {formattedUpdateDate && (
          <div className="mt-8 pt-4 border-t border-gray-200 text-[10px] text-gray-400 italic">
            Last edited by {data.updated_by} on {formattedUpdateDate}
          </div>
        )}
      </div>
    </div>
  )
}