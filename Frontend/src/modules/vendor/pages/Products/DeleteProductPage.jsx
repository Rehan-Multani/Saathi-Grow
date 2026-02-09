import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, ArrowLeft, Package } from 'lucide-react';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency } from '../../utils/formatDate';

const DeleteProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { products, deleteProduct } = useVendor();

    const product = products.find(p => p.id === parseInt(productId));

    const handleConfirmDelete = () => {
        deleteProduct(parseInt(productId));
        navigate('/vendor/products');
    };

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Package size={48} className="text-gray-300 mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-2">Product not found</h2>
                <p className="text-sm text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/vendor/products')}
                    className="px-4 py-2 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19]"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/vendor/products')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Delete Product</h1>
                    <p className="text-sm text-gray-500">Confirm product deletion</p>
                </div>
            </div>

            {/* Confirmation Card */}
            <div className="premium-card p-6">
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                </div>

                {/* Product Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 p-2 flex-shrink-0">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                                <Package size={32} className="text-gray-300 mx-auto" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                                <span className="text-xs text-gray-500">Stock: {product.stock} units</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Message */}
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <Trash2 size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-red-900 mb-1">Are you sure you want to delete this product?</h3>
                            <p className="text-xs text-red-700 leading-relaxed">
                                This action is permanent and cannot be undone. The product will be removed from your inventory,
                                and all related data will be deleted.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/vendor/products')}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="flex-1 px-6 py-3 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProductPage;
