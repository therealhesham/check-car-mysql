'use client';

import Navbar from '@/public/components/navbar';
import { useState, useEffect } from 'react';
interface Car {
    id: number;
    owner_name?: string;
    specification_policy?: string;
    Ref?: number;
    make_no?: number;
    manufacturer?: string;
    model_no?: string;
    model?: string;
    type_no?: string;
    Type?: string;
    seats?: number;
    manufacturing_year?: number;
    plate?: string;
    sequance?: number;
    chassis?: string;
    excess?: number;
    color?: string;
    sum_insured?: number;
    premium?: number;
}

export default function CarsPage() {
    const [groupedCars, setGroupedCars] = useState<Record<string, Car[]>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Car>>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCars();
    }, [searchQuery]);

    const fetchCars = async () => {
        const response = await fetch(
            `/api/car_managment?search=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setGroupedCars(data.groupedCars || {});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const body = editingId ? { id: editingId, ...formData } : formData;

        const response = await fetch('/api/CarsDetails', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            setFormData({});
            setEditingId(null);
            setIsModalOpen(false);
            fetchCars();
        }
    };

    const handleEdit = (car: Car) => {
        setFormData(car);
        setEditingId(car.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const response = await fetch(`/api/CarsDetails?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchCars();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const openAddModal = () => {
        setFormData({});
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <div dir="rtl" className="relative">
            <Navbar />

            <div className="container mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800">إدارة السيارات</h1>
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="ابحث حسب المالك، الشركة المصنعة، الموديل، اللوحة، أو اللون"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="p-3 border rounded-lg w-80 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            onClick={openAddModal}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                        >
                            إضافة سيارة جديدة
                        </button>
                    </div>
                </div>

                {/* Cars Grouped by Manufacturer */}
                <div className="space-y-8">
                    {Object.entries(groupedCars).map(([manufacturer, cars]) => (
                        <div key={manufacturer}>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{manufacturer}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cars.map((car) => (
                                    <div
                                        key={car.id}
                                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {car.manufacturer} {car.model}
                                        </h3>
                                        <p className="text-gray-600">رقم اللوحة: {car.plate || 'غير متوفر'}</p>
                                        <p className="text-gray-600">سنة الصنع: {car.manufacturing_year || 'غير متوفر'}</p>
                                        <p className="text-gray-600">اللون: {car.color || 'غير متوفر'}</p>
                                        <div className="mt-4 flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(car)}
                                                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition duration-200"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(car.id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {Object.keys(groupedCars).length === 0 && (
                        <p className="text-gray-600 text-center">لا توجد سيارات مطابقة للبحث.</p>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingId ? 'تحرير السيارة' : 'إضافة سيارة جديدة'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">اسم المالك</label>
                                        <input
                                            type="text"
                                            name="owner_name"
                                            value={formData.owner_name || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل اسم المالك"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">مرجع</label>
                                        <input
                                            type="text"
                                            name="Ref"
                                            value={formData.Ref || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل المرجع"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">الشركة المصنعة</label>
                                        <input
                                            type="text"
                                            name="manufacturer"
                                            value={formData.manufacturer || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل الشركة المصنعة"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">الموديل</label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={formData.model || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل الموديل"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">عدد المقاعد</label>
                                        <input
                                            type="number"
                                            name="seats"
                                            value={formData.seats || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل عدد المقاعد"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">سنة الصنع</label>
                                        <input
                                            type="number"
                                            name="manufacturing_year"
                                            value={formData.manufacturing_year || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل سنة الصنع"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">رقم اللوحة</label>
                                        <input
                                            type="text"
                                            name="plate"
                                            value={formData.plate || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل رقم اللوحة"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">اللون</label>
                                        <input
                                            type="text"
                                            name="color"
                                            value={formData.color || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="أدخل اللون"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                                    >
                                        {editingId ? 'تحديث السيارة' : 'إضافة السيارة'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}