import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-stone-500 font-light">
        No products found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
