'use client'
import { useFormStatus } from 'react-dom'

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-4 w-full md:w-auto font-medium transition-colors">
      {pending ? 'Saving...' : label}
    </button>
  )
}

export default function AssetForm({ action, asset, categories, locations, submitLabel = 'Save Asset' }: any) {
  return (
    <form action={action} className="bg-white border rounded-xl p-5 space-y-4 shadow-sm max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">Asset Name *</label>
        <input name="name" required defaultValue={asset?.name || ''} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="E.g: Dell R740 Server" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="category_id" defaultValue={asset?.category_id || ''} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Category...</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Location (Rack)</label>
          <select name="location_id" defaultValue={asset?.location_id || ''} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Rack...</option>
            {locations.map((l: any) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <input name="brand" defaultValue={asset?.brand || ''} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="E.g: Dell" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input name="model" defaultValue={asset?.model || ''} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="E.g: PowerEdge" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" defaultValue={asset?.status || 'available'} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input name="quantity" type="number" min="1" defaultValue={asset?.quantity || 1} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      
      <SubmitBtn label={submitLabel} />
    </form>
  )
}