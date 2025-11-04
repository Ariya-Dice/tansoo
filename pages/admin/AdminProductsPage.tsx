import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Product } from '../../types';
import { CATEGORIES, COLORS, PRODUCT_TYPES, STYLES } from '../../constants';
import { fileToBase64 } from '../../db/ImageDB';

const AdminProductsPage: React.FC = () => {
    const { products, setProducts, showToast } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const openModalForNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (productId: number) => {
        if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
            setProducts(prev => prev.filter(p => p.id !== productId));
            showToast('محصول با موفقیت حذف شد.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-light-text">مدیریت محصولات</h1>
                <button onClick={openModalForNew} className="px-4 py-2 bg-brand-neon-blue text-brand-dark-blue font-semibold rounded-md hover:bg-opacity-80 transition-colors">
                    افزودن محصول جدید
                </button>
            </div>
            <div className="bg-brand-surface shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-right text-brand-muted-text">
                    <thead className="text-xs text-brand-muted-text uppercase bg-brand-dark-blue">
                        <tr>
                            <th scope="col" className="px-6 py-3">شناسه</th>
                            <th scope="col" className="px-6 py-3">نام</th>
                            <th scope="col" className="px-6 py-3">دسته بندی</th>
                            <th scope="col" className="px-6 py-3">قیمت</th>
                            <th scope="col" className="px-6 py-3 text-left">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="bg-brand-surface border-b border-brand-neon-blue/20 hover:bg-brand-dark-blue">
                                <td className="px-6 py-4 font-medium text-brand-light-text">{product.id}</td>
                                <td className="px-6 py-4 text-brand-light-text">{product.name}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">{product.price.toLocaleString('fa-IR')} تومان</td>
                                <td className="px-6 py-4 text-left space-x-2">
                                    <button onClick={() => openModalForEdit(product)} className="font-medium text-blue-400 hover:underline">ویرایش</button>
                                    <button onClick={() => handleDelete(product.id)} className="font-medium text-red-400 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

// --- ProductFormModal Component ---
interface ProductFormModalProps {
    product: Product | null;
    onClose: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose }) => {
    const { products, setProducts, showToast, addImage, getImage } = useAppContext();
    const initialProductState: Product = product || {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: '', 
        category: CATEGORIES[0].name, 
        type: PRODUCT_TYPES[0].name, 
        price: 0, 
        description: '', 
        specs: { 'جنس': '', 'پوشش': '', 'گارانتی': '', 'سبک': STYLES[0] }, 
        images: COLORS.reduce((acc, color) => ({...acc, [color.name]: ''}), {}),
    };
    const [formData, setFormData] = useState<Product>(initialProductState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };

    const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, specs: {...prev.specs, [name]: value }}));
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, color: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToBase64(file);
                const sanitizedName = formData.name.toLowerCase().replace(/\s+/g, '-');
                if(!sanitizedName) {
                    showToast('لطفا ابتدا نام محصول را وارد کنید.');
                    e.target.value = ''; // Reset file input
                    return;
                }
                const newImageId = `${sanitizedName}-${color}-${Date.now()}`;
                addImage(newImageId, base64);
                
                setFormData(prev => ({
                    ...prev,
                    images: { ...prev.images, [color]: newImageId, }
                }));
                showToast(`تصویر برای رنگ ${color} آپلود شد.`);
            } catch (error) {
                console.error("Error converting file to base64", error);
                showToast('خطا در آپلود تصویر.');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product) {
            setProducts(prev => prev.map(p => p.id === product.id ? formData : p));
            showToast('محصول با موفقیت به‌روزرسانی شد.');
        } else {
            setProducts(prev => [...prev, formData]);
            showToast('محصول با موفقیت اضافه شد.');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-brand-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 text-right">
                        <h2 className="text-2xl font-bold mb-4 text-brand-light-text">{product ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="نام" name="name" value={formData.name} onChange={handleChange} required />
                            <InputField label="قیمت (تومان)" name="price" type="number" value={String(formData.price)} onChange={handleChange} required />
                            <SelectField label="دسته بندی" name="category" value={formData.category} onChange={handleChange} options={CATEGORIES.map(c => c.name)} />
                            <SelectField label="نوع" name="type" value={formData.type} onChange={handleChange} options={PRODUCT_TYPES.map(t => t.name)} />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-brand-muted-text">توضیحات</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-brand-neon-blue/30 bg-brand-dark-blue shadow-sm focus:border-brand-neon-blue focus:ring-brand-neon-blue sm:text-sm text-brand-light-text" required />
                        </div>

                        <h3 className="text-lg font-semibold mt-6 mb-2 text-brand-light-text">مشخصات فنی</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {Object.entries(formData.specs).map(([key, value]) => {
                               if (key === 'سبک') {
                                   return <SelectField key={key} label={key} name={key} value={value} onChange={handleSpecChange} options={STYLES} />;
                               }
                               return <InputField key={key} label={key} name={key} value={value} onChange={handleSpecChange} />;
                           })}
                        </div>
                        
                        <h3 className="text-lg font-semibold mt-6 mb-2 text-brand-light-text">تصاویر محصول</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                           {Object.keys(formData.images).map(color => {
                                const imageId = formData.images[color];
                                return (
                                    <div key={color}>
                                        <label className="block text-sm font-medium text-brand-muted-text mb-1">{color}</label>
                                        <div className="flex items-center gap-3">
                                            <img src={getImage(imageId)} alt={color} className="w-16 h-16 object-cover rounded-md border border-brand-neon-blue/20 bg-brand-dark-blue" />
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, color)}
                                                className="block w-full text-xs text-brand-muted-text file:mr-2 file:py-1 file:px-3 file:rounded-full file:border file:border-brand-neon-blue/20 file:text-xs file:font-semibold file:bg-brand-dark-blue file:text-brand-neon-blue hover:file:bg-brand-neon-blue/10"
                                            />
                                        </div>
                                    </div>
                                );
                           })}
                        </div>
                    </div>
                    <div className="bg-brand-dark-blue px-6 py-3 flex justify-end space-x-3 space-x-reverse border-t border-brand-neon-blue/20">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-brand-neon-blue/50 text-brand-neon-blue rounded-md hover:bg-brand-neon-blue/10">انصراف</button>
                        <button type="submit" className="px-4 py-2 bg-brand-neon-blue text-brand-dark-blue font-semibold rounded-md hover:bg-opacity-80">ذخیره محصول</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Reusable Form Field Components ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-brand-muted-text">{label}</label>
        <input id={props.name} {...props} className="mt-1 block w-full rounded-md border-brand-neon-blue/30 bg-brand-dark-blue shadow-sm focus:border-brand-neon-blue focus:ring-brand-neon-blue sm:text-sm text-brand-light-text" />
    </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: string[];
}
const SelectField: React.FC<SelectFieldProps> = ({ label, options, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-brand-muted-text">{label}</label>
        <select id={props.name} {...props} className="mt-1 block w-full rounded-md border-brand-neon-blue/30 bg-brand-dark-blue shadow-sm focus:border-brand-neon-blue focus:ring-brand-neon-blue sm:text-sm text-brand-light-text">
            {options.map(opt => <option key={opt} value={opt} className="bg-brand-dark-blue text-brand-light-text">{opt}</option>)}
        </select>
    </div>
);

export default AdminProductsPage;