'use client'

import { Printer } from 'lucide-react'

interface SphItem {
  item_name: string
  quantity: number
  price: number
  total: number
}

interface SphData {
  sph_number: string
  perihal: string
  client_name: string
  client_address: string
  date: string
  signatory: string
  updated_at?: string
  updated_by?: string
  company: {
    name: string
    address: string
  }
  items: SphItem[]
}

export default function SphPreview({ data }: { data: SphData }) {
  const handlePrint = () => {
    window.print()
  }

  const grandTotal = data.items.reduce((acc, item) => acc + item.total, 0)

  const formattedDate = new Date(data.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formattedUpdateDate = data.updated_at
    ? new Date(data.updated_at).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  const isShafaCompany = data.company?.name?.toLowerCase().includes('shafa')

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 shadow-md rounded-xl print-area">
      <div className="mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
        >
          <Printer size={18} /> Cetak / Simpan PDF
        </button>
      </div>

      <div className="border border-gray-300 p-8 text-black text-sm font-serif">
        <div className="flex items-center gap-4 mb-6">
          {isShafaCompany && (
            <img
              src="/logo-shafa.png" 
              alt="Logo Shafa Marwa Ghani" 
              className="w-14 h-14 object-contain"
            />
          )}
          <div>
            <h1 className="text-sm font-bold tracking-wide">{data.company?.name}</h1>
            <p className="text-xs text-gray-700">{data.company?.address}</p>
          </div>
        </div>

        <hr className="border-t border-black mb-6" />

        <div className="text-center mb-6">
          <h2 className="text-base font-bold underline tracking-wider">SURAT PENAWARAN HARGA</h2>
        </div>

        <div className="mb-6 text-xs space-y-1">
          <p><span className="font-semibold">No</span> : {data.sph_number}</p>
          <p><span className="font-semibold">Perihal</span> : {data.perihal}</p>
        </div>

        <div className="mb-6 text-xs space-y-0.5">
          <p className="font-semibold">Kepada Yth,</p>
          <p>{data.client_name || '-'}</p>
          <p className="whitespace-pre-line">{data.client_address || 'Di Tempat'}</p>
        </div>

        <div className="mb-4 text-xs space-y-1">
          <p className="italic">Assalamu&apos;alaikum Wr Wb</p>
          <p>Berikut kami sampaikan penawaran harga untuk produk sebagai berikut :</p>
        </div>

        <table className="w-full border-collapse border border-black mb-6 text-xs">
          <thead>
            <tr className="bg-gray-100 text-center font-bold">
              <th className="border border-black py-2 px-2 w-12">No</th>
              <th className="border border-black py-2 px-4 text-left">Macam/Jenis Barang</th>
              <th className="border border-black py-2 px-2 w-20">Jumlah</th>
              <th className="border border-black py-2 px-4 text-right">Harga</th>
              <th className="border border-black py-2 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="h-8">
                <td className="border border-black text-center">{index + 1}</td>
                <td className="border border-black px-2">{item.item_name}</td>
                <td className="border border-black text-center">{item.quantity.toLocaleString('id-ID')}</td>
                <td className="border border-black px-2 text-right">Rp {item.price.toLocaleString('id-ID')},-</td>
                <td className="border border-black px-2 text-right">Rp {item.total.toLocaleString('id-ID')},-</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td colSpan={4} className="border border-black text-right px-4 py-2">Sub Total</td>
              <td className="border border-black px-2 text-right py-2">Rp {grandTotal.toLocaleString('id-ID')},-</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-12 text-xs space-y-4">
          <p>Demikian Penawaran harga ini kami buat, atas kerjasamanya kami haturkan terima kasih.</p>
          <p className="italic">Wassalamu&apos;alaikum Wr Wb</p>
        </div>

        <div className="flex justify-end text-xs">
          <div className="text-left w-48 flex flex-col items-start">
            <p className="mb-1">Klaten, {formattedDate}</p>
            <p className="mb-1 font-medium">Hormat Kami,</p>
            
            {/* Area Gambar Tanda Tangan SPH */}
            <div className="h-16 flex items-center justify-center my-1">
              <img
                src="/tanda-tangan.png"
                alt="Tanda Tangan"
                className="h-16 object-contain"
              />
            </div>

            <p className="font-bold underline">{data.signatory || 'Candra Eka Dharmawan'}</p>
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