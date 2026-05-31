import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShopStore } from '@/store/shopStore';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const setCategory = useShopStore((s) => s.setCategory);

  useEffect(() => {
    if (category && ['hombre', 'mujer', 'accesorios'].includes(category)) {
      setCategory(category as 'hombre' | 'mujer' | 'accesorios');
    } else {
      setCategory('todos');
    }
  }, [category, setCategory]);

  return (
    <div className="pt-[72px] min-h-[100dvh]">
      <div className="content-max-width py-16">
        <h1 className="font-display text-h2 text-[#1A1A1A] mb-4">TIENDA</h1>
        <p className="font-body text-[#6B6B6B] mb-8">
          Explora nuestra coleccion de ropa interior, ropa juvenil y accesorios.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {useShopStore((s) => s.getFilteredProducts()).map((product) => (
            <div key={product.id} className="border border-[#F0F0F0] bg-white">
              <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F5]">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-body text-sm text-[#1A1A1A] mb-1">{product.name}</h3>
                <div className="flex items-center gap-2">
                  {product.originalPrice && (
                    <span className="font-body text-sm text-[#6B6B6B] line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="font-body text-base font-semibold text-[#6F1219]">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
