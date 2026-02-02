import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useVendor } from '../../contexts/VendorContext';

const DeleteProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { products, deleteProduct } = useVendor();

    const product = products.find(p => p.id === parseInt(productId));

    const handleConfirmDelete = () => {
        deleteProduct(parseInt(productId));
        navigate('/vendor/products');
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => navigate('/vendor/products')}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center border border-gray-100 animate-in zoom-in-95 duration-300 relative z-10" onClick={(e) => e.stopPropagation()}>
                {/* Icon */}
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={28} className="text-red-500" />
                </div>

                {/* Text */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Delete Product</h1>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-gray-800">"{product.name}"</span>? <br />
                    This action cannot be undone.
                </p>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/vendor/products')}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="flex-1 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-md shadow-red-200 transition-all hover:shadow-lg hover:shadow-red-200"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProductPage;
