"use client";

import { useEffect, useState, useCallback } from "react";
import type { Category } from "@/types/database";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) { setError("Failed to load"); return; }
      const data = await res.json();
      setCategories(data.categories || []);
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); }
    else { setForm({ name: "", description: "" }); setShowAdd(false); await load(); }
    setSubmitting(false);
  }

  async function handleEdit(id: string) {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); }
    else { setEditingId(null); await load(); }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); setError(d.error); }
    else { await load(); }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Categories</h1>
          <p className="text-gray-500 mt-1">Organize stories into categories.</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ name: "", description: "" }); }}
          className="px-4 py-2 bg-earth-amber text-earth-darkest rounded-lg text-sm font-medium hover:bg-earth-orange transition-colors"
        >
          {showAdd ? "Cancel" : "Add Category"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="mb-6 bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-earth-gold focus:border-earth-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-earth-gold focus:border-earth-gold"
            />
          </div>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 bg-earth-amber text-earth-darkest rounded-lg text-sm font-medium hover:bg-earth-orange disabled:opacity-50">
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No categories yet.</div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {categories.map((cat) => (
            <div key={cat.id} className="px-6 py-4">
              {editingId === cat.id ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text" value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-earth-gold focus:border-earth-gold"
                  />
                  <input
                    type="text" value={editForm.description} placeholder="Description"
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-earth-gold focus:border-earth-gold"
                  />
                  <button onClick={() => handleEdit(cat.id)} disabled={submitting}
                    className="text-sm text-earth-gold hover:text-earth-amber font-medium">Save</button>
                  <button onClick={() => setEditingId(null)}
                    className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, description: cat.description || "" }); setShowAdd(false); }}
                      className="text-sm text-earth-gold hover:text-earth-amber font-medium">Edit</button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
