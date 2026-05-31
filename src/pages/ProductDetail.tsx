import { useParams, Link } from 'react-router-dom';
import { getProductById } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(Number(id));
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState('');

  if (!product) {
    return (
      <div className="pt-[72px] min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-h2 text-[#1A1A1A] mb-4">Producto no encontrado</h1>
          <Link to="/shop" className="text-[#6F1219] font-body hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.images[0],
    });
  };

  return (
    <div className="pt-[72px] min-h-[100dvh]">
      <div className="content-max-width py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="font-display text-h3 text-[#1A1A1A] mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              {product.originalPrice && (
                <span className="font-body text-lg text-[#6B6B6B] line-through">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="font-body text-2xl font-semibold text-[#6F1219]">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="bg-[#6F1219] text-white text-xs font-body font-medium px-2 py-1">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>
            <p className="font-body text-[#6B6B6B] mb-6">{product.description}</p>

            {/* Size selector */}
            <div className="mb-6">
              <label className="font-body text-sm font-medium text-[#1A1A1A] mb-2 block">
                TALLE
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border font-body text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-[#6F1219] bg-[#6F1219] text-white'
                        : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-[#6F1219]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="w-full h-[52px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              AGREGAR AL CARRITO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
