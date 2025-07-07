

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/public/components/navbar';

interface Car {
  id: number;
  owner_name?: string;
  specification_policy?: string;
  Ref?: string;
  make_no?: string;
  manufacturer?: string;
  model_no?: string;
  model?: string;
  type_no?: string;
  Type?: string;
  seats?: number;
  manufacturing_year?: number;
  plate?: string;
  sequance?: string;
  chassis?: string;
  excess?: number;
  color?: string;
  sum_insured?: number;
  premium?: number;
}

// قاموس لتحويل أسماء السيارات إلى التنسيق العربي/الإنجليزي
const carNameMapping: { [key: string]: string } = {
  "Hyundai Accent": "هيونداي - اكسنت / Hyundai-Accent",
  "Kia Carens": "كيا - كارينز / Kia-Carens",
  "Hyundai Elantra": "هيونداي - النترا / Hyundai-Elantra",
  "Hyundai I10": "هيونداي - جراند10 / Hyundai-I10",
  "Hyundai Sonata": "هيونداي - سوناتا / Hyundai-Sonata",
  "Toyota Yaris": "تويوتا - يارس / Toyota-Yaris",
  "Hyundai Venue": "هيونداي - فينيو / Hyundai-Venue",
  "Kia Pegas": "كيا - بيجاس / Kia-Pegas",
  "Toyota Corolla": "تويوتا - كورولا / Toyota-Corolla",
  "Hyundai Staria": "هيونداي - ستاريا / Hyundai-Staria",
  "Kia K4": "كيا - كي 4 / Kia-K4",
  "Hyundai Creta Jeep": "هيونداي - كريتا جيب / Hyundai-Creta Jeep",
  "Suzuki Dzire": "سوزوكي - ديزاير / Suzuki-Dzire",
  "Toyota Hilux": "تويوتا - هايلوكس / Toyota-Hilux",
  "Toyota Veloz": "تويوتا - فيلوز / Toyota-Veloz",
  "Toyota Raize": "تويوتا - رايز / Toyota-Raize",
  "Great Wall Wingle": "جريت وول - وينجل / Great Wall-Wingle",
  "Toyota Camry": "تويوتا - كامري / Toyota-Camry",
  "Mitsubishi Attrage": "ميتسوبيشي - اتراج / Mitsubishi-Attrage",
  "Great Wall Wingel 7": "جريت وول - وينجل 7 / Great Wall-Wingel 7",
  "Nissan Sunny": "نيسان - صني / Nissan-Sunny",
  "Lexus Es 250": "لكزس - ES 250 / Lexus-Es 250",
  "Chery Tiggo 4 Pro": "شيري - تيجو 4 / Chery-Tiggo 4 Pro",
};

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Car>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCars();
  }, [currentPage, searchQuery]);

  const fetchCars = async () => {
    const response = await fetch(
      `/api/cardetails?page=${currentPage}&pageSize=${pageSize}&search=${encodeURIComponent(searchQuery)}`
    );
    const data = await response.json();
    setCars(data.cars);
    setTotalPages(data.totalPages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...formData } : formData;

    const response = await fetch('/api/cardetails', {
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
    const response = await fetch(`/api/cardetails?id=${id}`, { method: 'DELETE' });
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
    setCurrentPage(1); // Reset to first page on new search
  };

  const openAddModal = () => {
    setFormData({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div dir="rtl" className={`relative`}>

      <Navbar />

      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">ادارة السيارات</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by owner, manufacturer, model, plate, or color"
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-3 border rounded-lg w-80 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={openAddModal}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
            >
              اضافة سيارة جديدة
            </button>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {carNameMapping[`${car.manufacturer} ${car.model}`] || `${car.manufacturer} ${car.model}`}
              </h2>
              <p className="text-gray-600">اللوحة: {car.plate || 'N/A'}</p>
              <p className="text-gray-600">سنة التصنيع: {car.manufacturing_year || 'N/A'}</p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => handleEdit(car)}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition duration-200"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200"
          >
            السابق
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200"
          >
            التالي
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingId
                  ? `تحرير: ${carNameMapping[`${formData.manufacturer} ${formData.model}`] || `${formData.manufacturer} ${formData.model}`}`
                  : 'اضافة سيارة جديدة'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">اسم السيارة </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="اضافة اسم السيارة"
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
                      placeholder="اضافة مرجع"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">مُصنع</label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="اضافة مصنع"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">موديل</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="اضافة موديل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">مقاعد</label>
                    <input
                      type="number"
                      name="seats"
                      value={formData.seats || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="اضافة عدد المقاعد"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">عام التصنيع</label>
                    <input
                      type="number"
                      name="manufacturing_year"
                      value={formData.manufacturing_year || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="العام"
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
                      placeholder="رقم لوحة السيارة"
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
                      placeholder="اللون"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700">Sum Insured</label>
                    <input
                      type="number"
                      name="sum_insured"
                      value={formData.sum_insured || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter sum insured"
                    />
                  </div> */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700">Premium</label>
                    <input
                      type="number"
                      name="premium"
                      value={formData.premium || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter premium"
                    /> */}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    {editingId ? 'Update Car' : 'Add Car'}
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

