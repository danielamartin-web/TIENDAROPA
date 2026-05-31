import { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Image,
  Video,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useProductStore } from '@/store/productStore';
import { formatPrice, ADMIN_CATEGORIES, AVAILABLE_SIZES } from '@/lib/adminUtils';
import type { Product } from '@/data/products';
import { Toaster, toast } from 'sonner';

const ITEMS_PER_PAGE = 8;

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: 0,
  originalPrice: null,
  category: 'hombre',
  sizes: [],
  images: [],
  video: undefined,
  inStock: true,
  badge: '',
};

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>({ ...emptyProduct });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...emptyProduct });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ ...product });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (form.price <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }
    if (editingProduct) {
      updateProduct(editingProduct.id, form);
      toast.success('Producto actualizado');
    } else {
      addProduct(form);
      toast.success('Producto creado');
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) {
      deleteProduct(id);
      setDeleteConfirm(null);
      toast.success('Producto eliminado');
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).map(() => {
      // In a real app, this would be a URL from the server
      return URL.createObjectURL(files[0]);
    });
    const unique = [...new Set([...form.images, ...newImages])].slice(0, 10);
    setForm((f) => ({ ...f, images: unique }));
    toast.success(`${newImages.length} imagen(es) agregada(s)`);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    const url = URL.createObjectURL(files[0]);
    setForm((f) => ({ ...f, video: url }));
    toast.success('Video agregado');
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const removeVideo = () => {
    setForm((f) => ({ ...f, video: undefined }));
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  };

  return (
    <AdminLayout title="Productos">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF' },
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="font-body text-[13px] text-[#6B6B6B] mt-1">
            {filtered.length} productos en total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] rounded-lg hover:bg-[#5A0E14] transition-colors"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar producto..."
            className="w-full h-[44px] pl-10 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors placeholder:text-[#6B6B6B]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          className="h-[44px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] appearance-none cursor-pointer"
        >
          <option value="all">Todas las categorias</option>
          {ADMIN_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">
                  Producto
                </th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium hidden sm:table-cell">
                  Categoria
                </th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">
                  Precio
                </th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium hidden md:table-cell">
                  Stock
                </th>
                <th className="text-right px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#222222] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#2A2A2A] overflow-hidden flex-shrink-0">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="font-body text-[13px] text-white truncate max-w-[160px] sm:max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="inline-block px-2 py-1 bg-[#2A2A2A] rounded font-body text-[11px] text-[#A1A1A1] capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-[13px] text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="font-mono text-[11px] text-[#6B6B6B] line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`font-mono text-[12px] ${
                        product.sizes.length < 3 ? 'text-[#EF4444]' : 'text-[#22C55E]'
                      }`}
                    >
                      {product.sizes.length} tallas
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 text-[#6B6B6B] hover:text-[#6F1219] hover:bg-[#6F1219]/10 rounded-lg transition-colors"
                        aria-label="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          deleteConfirm === product.id
                            ? 'text-[#EF4444] bg-[#EF4444]/20'
                            : 'text-[#6B6B6B] hover:text-[#EF4444] hover:bg-[#EF4444]/10'
                        }`}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Package className="mx-auto mb-3 text-[#2A2A2A]" size={40} />
                    <p className="font-body text-[14px] text-[#6B6B6B]">
                      No se encontraron productos
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 text-[#6B6B6B] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Pagina anterior"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-8 h-8 rounded-lg font-body text-[12px] transition-colors ${
                p === currentPage
                  ? 'bg-[#6F1219] text-white'
                  : 'text-[#6B6B6B] hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-[#6B6B6B] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Pagina siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto py-4 px-4">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl w-full max-w-[640px] my-4 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
              <h2 className="font-display text-lg text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-[#6B6B6B] hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
                  placeholder="Ej: Conjunto Lenceria Negra"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Descripcion
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full h-[80px] px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors resize-none"
                  placeholder="Descripcion del producto..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as 'hombre' | 'mujer' | 'accesorios' }))
                  }
                  className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] appearance-none cursor-pointer"
                >
                  {ADMIN_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Prices Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                    className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                    Precio original (tachado)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        originalPrice: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Stock
                </label>
                <input
                  type="number"
                  value={form.sizes.length}
                  readOnly
                  className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm cursor-default"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Tallas disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-2 rounded-lg font-body text-[12px] font-medium border transition-all ${
                        form.sizes.includes(size)
                          ? 'bg-[#6F1219] border-[#6F1219] text-white'
                          : 'bg-[#0F0F0F] border-[#2A2A2A] text-[#6B6B6B] hover:border-[#3A3A3A]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Images Upload */}
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Imagenes ({form.images.length}/10)
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden bg-[#0F0F0F] border border-[#2A2A2A]"
                    >
                      <img
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-[#EF4444] rounded-full flex items-center justify-center text-white hover:bg-[#DC2626] transition-colors"
                        aria-label="Eliminar imagen"
                      >
                        <X size={10} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#6F1219] rounded font-body text-[9px] text-white font-medium">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                  {form.images.length < 10 && (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-[#2A2A2A] flex flex-col items-center justify-center gap-1 hover:border-[#6F1219] hover:bg-[#6F1219]/5 transition-colors"
                    >
                      <Upload size={14} className="text-[#6B6B6B]" />
                      <span className="font-body text-[10px] text-[#6B6B6B]">Subir</span>
                    </button>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Video Upload */}
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Video (opcional, max 1)
                </label>
                {form.video ? (
                  <div className="relative rounded-lg overflow-hidden bg-[#0F0F0F] border border-[#2A2A2A]">
                    <video
                      src={form.video}
                      controls
                      className="w-full h-[160px] object-contain"
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-2 right-2 p-1.5 bg-[#EF4444] rounded-full text-white hover:bg-[#DC2626] transition-colors"
                      aria-label="Eliminar video"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-[80px] rounded-lg border-2 border-dashed border-[#2A2A2A] flex flex-col items-center justify-center gap-1 hover:border-[#6F1219] hover:bg-[#6F1219]/5 transition-colors"
                  >
                    <Video size={18} className="text-[#6B6B6B]" />
                    <span className="font-body text-[11px] text-[#6B6B6B]">
                      Subir video (max 50MB)
                    </span>
                  </button>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2A2A2A]">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 font-body text-sm text-[#A1A1A1] hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#6F1219] text-white font-body text-sm font-medium rounded-lg hover:bg-[#5A0E14] transition-colors"
              >
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Package(props: React.SVGAttributes<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
