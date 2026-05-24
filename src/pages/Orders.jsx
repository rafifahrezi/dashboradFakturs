import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';

const Orders = () => {
  const [invoices, setInvoices] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [formData, setFormData] = useState({
    nama_outlet: '',
    kode_outlet: '',
    no_telp_outlet: '',
    pic_karyawan_id: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const fakturCollectionRef = collection(db, 'faktur');
  const tokoCollectionRef = collection(db, 'toko');
  const karyawanCollectionRef = collection(db, 'karyawan');

  // Fetch employees from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(karyawanCollectionRef, orderBy('nama_karyawan', 'asc')),
      (snapshot) => {
        const employeeData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));
        setEmployees(employeeData);
      },
      (error) => {
        console.error('Error fetching employees:', error);
        showToast('Gagal memuat data karyawan', 'error');
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch outlets from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(tokoCollectionRef, orderBy('nama_outlet', 'asc')),
      (snapshot) => {
        const outletData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));
        setOutlets(outletData);
      },
      (error) => {
        console.error('Error fetching outlets:', error);
        showToast('Gagal memuat data toko', 'error');
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch invoices from Firestore with real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(fakturCollectionRef, orderBy('created_at', 'desc')),
      (snapshot) => {
        const invoiceData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));
        setInvoices(invoiceData);
      },
      (error) => {
        console.error('Error fetching invoices:', error);
        showToast('Gagal memuat data faktur', 'error');
      }
    );
    return () => unsubscribe();
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};

    if (!formData.nama_outlet || formData.nama_outlet.trim() === '') {
      errors.nama_outlet = 'Nama outlet harus diisi';
    }

    if (!formData.kode_outlet || formData.kode_outlet.trim() === '') {
      errors.kode_outlet = 'Kode outlet harus diisi';
    }

    if (!formData.no_telp_outlet || formData.no_telp_outlet.trim() === '') {
      errors.no_telp_outlet = 'Nomor telepon outlet harus diisi';
    } else if (!/^\d{10,13}$/.test(formData.no_telp_outlet.replace(/\D/g, ''))) {
      errors.no_telp_outlet = 'Nomor telepon harus 10-13 digit';
    }

    return errors;
  };

  // Validate edit form inputs
  const validateEditForm = () => {
    const errors = {};

    if (!editData.nama_outlet || editData.nama_outlet.trim() === '') {
      errors.nama_outlet = 'Nama outlet harus diisi';
    }

    if (!editData.kode_outlet || editData.kode_outlet.trim() === '') {
      errors.kode_outlet = 'Kode outlet harus diisi';
    }

    if (!editData.no_telp_outlet || editData.no_telp_outlet.trim() === '') {
      errors.no_telp_outlet = 'Nomor telepon outlet harus diisi';
    } else if (!/^\d{10,13}$/.test(editData.no_telp_outlet.replace(/\D/g, ''))) {
      errors.no_telp_outlet = 'Nomor telepon harus 10-13 digit';
    }

    return errors;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle edit input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (editErrors[name]) {
      setEditErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Silakan periksa kembali form Anda', 'warning');
      setLoading(false);
      return;
    }

    try {
      const employeeName = employees.find(
        (emp) => emp.id === formData.pic_karyawan_id
      )?.nama_karyawan;

      await addDoc(tokoCollectionRef, {
        nama_outlet: formData.nama_outlet.trim(),
        kode_outlet: formData.kode_outlet.trim(),
        no_telp_outlet: formData.no_telp_outlet.trim(),
        pic_karyawan_id: formData.pic_karyawan_id,
        pic_karyawan_name: employeeName || '',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Reset form
      setFormData({
        nama_outlet: '',
        kode_outlet: '',
        no_telp_outlet: '',
        pic_karyawan_id: '',
      });
      setFormErrors({});

      showToast('Toko berhasil ditambahkan!', 'success');
    } catch (error) {
      console.error('Error adding outlet:', error);
      showToast('Gagal menambahkan toko. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (outlet) => {
    setEditData({
      id: outlet.id,
      nama_outlet: outlet.nama_outlet || '',
      kode_outlet: outlet.kode_outlet || '',
      no_telp_outlet: outlet.no_telp_outlet || '',
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  // Handle edit form submission
  const handleSaveEdit = async () => {
    // Validate edit form
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showToast('Silakan periksa kembali form Anda', 'warning');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'toko', editData.id), {
        nama_outlet: editData.nama_outlet.trim(),
        kode_outlet: editData.kode_outlet.trim(),
        no_telp_outlet: editData.no_telp_outlet.trim(),
        updated_at: Timestamp.now(),
      });

      setEditModalOpen(false);
      setEditData(null);
      setEditErrors({});
      showToast('Toko berhasil diperbarui!', 'success');
    } catch (error) {
      console.error('Error updating outlet:', error);
      showToast('Gagal memperbarui toko. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get employee name by ID
  const getEmployeeName = (picKaryawanId) => {
    const employee = employees.find((emp) => emp.id === picKaryawanId);
    return employee ? employee.nama_karyawan : 'PIC tidak ditemukan';
  };

  // Get outlet invoice count by ID (using toko_id reference)
  const getOutletInvoiceCount = (outletId) =>
    invoices.filter((invoice) => invoice.toko_id === outletId).length;

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Header category="App" title="Manajemen Customer" />

      {/* Form Tambah Toko Baru */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Tambah Toko Baru</h3>
        <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Nama Outlet */}
          <div>
            <h4
              htmlFor="nama_outlet"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Outlet <span className="text-red-500">*</span>
            </h4>
            <input
              id="nama_outlet"
              type="text"
              name="nama_outlet"
              placeholder="Nama Outlet"
              className={`p-2 border rounded w-full focus:outline-none focus:ring-2 ${
                formErrors.nama_outlet
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              value={formData.nama_outlet}
              onChange={handleInputChange}
              maxLength="100"
              aria-invalid={!!formErrors.nama_outlet}
              aria-describedby={
                formErrors.nama_outlet ? 'nama_outlet-error' : undefined
              }
            />
            {formErrors.nama_outlet && (
              <p
                id="nama_outlet-error"
                className="text-xs text-red-500 mt-1"
              >
                {formErrors.nama_outlet}
              </p>
            )}
            {!formErrors.nama_outlet && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.nama_outlet || 'Masukkan nama outlet'}
              </p>
            )}
          </div>

          {/* Kode Outlet */}
          <div>
            <h4
              htmlFor="kode_outlet"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kode Outlet <span className="text-red-500">*</span>
            </h4>
            <input
              id="kode_outlet"
              type="text"
              name="kode_outlet"
              placeholder="Kode Outlet"
              className={`p-2 border rounded w-full focus:outline-none focus:ring-2 ${
                formErrors.kode_outlet
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              value={formData.kode_outlet}
              onChange={handleInputChange}
              maxLength="50"
              aria-invalid={!!formErrors.kode_outlet}
              aria-describedby={
                formErrors.kode_outlet ? 'kode_outlet-error' : undefined
              }
            />
            {formErrors.kode_outlet && (
              <p id="kode_outlet-error" className="text-xs text-red-500 mt-1">
                {formErrors.kode_outlet}
              </p>
            )}
            {!formErrors.kode_outlet && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.kode_outlet || 'Masukkan kode outlet'}
              </p>
            )}
          </div>

          {/* No Telepon Outlet */}
          <div>
            <h4
              htmlFor="no_telp_outlet"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              No Telepon Outlet <span className="text-red-500">*</span>
            </h4>
            <input
              id="no_telp_outlet"
              type="tel"
              name="no_telp_outlet"
              placeholder="No Telepon Outlet"
              className={`p-2 border rounded w-full focus:outline-none focus:ring-2 ${
                formErrors.no_telp_outlet
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              value={formData.no_telp_outlet}
              onChange={handleInputChange}
              maxLength="13"
              aria-invalid={!!formErrors.no_telp_outlet}
              aria-describedby={
                formErrors.no_telp_outlet ? 'no_telp_outlet-error' : undefined
              }
            />
            {formErrors.no_telp_outlet && (
              <p
                id="no_telp_outlet-error"
                className="text-xs text-red-500 mt-1"
              >
                {formErrors.no_telp_outlet}
              </p>
            )}
            {!formErrors.no_telp_outlet && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.no_telp_outlet || 'Masukkan nomor telepon'}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-2 rounded text-white font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Menyimpan...' : 'Simpan & Tambah Toko'}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Customer */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          Daftar Data Customer ({outlets.length})
        </h3>
        {outlets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <div
                key={outlet.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50"
              >
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {outlet.nama_outlet}
                </h4>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Kode Outlet:</span>{' '}
                  {outlet.kode_outlet}
                </p>
                <p className="text-gray-600 mb-3">
                  <span className="font-medium">No Telepon:</span>{' '}
                  {outlet.no_telp_outlet}
                </p>
                <div className="flex justify-between items-center pt-2 border-t mb-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Jumlah Faktur:</span>
                  </p>
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {getOutletInvoiceCount(outlet.id)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(outlet)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                    aria-label={`Edit toko ${outlet.nama_outlet}`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Tidak ada data toko tersedia.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Toko</h3>
            <form className="grid gap-4">
              {/* Nama Outlet */}
              <div>
                <h4
                  htmlFor="edit_nama_outlet"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Outlet <span className="text-red-500">*</span>
                </h4>
                <input
                  id="edit_nama_outlet"
                  type="text"
                  name="nama_outlet"
                  placeholder="Nama Outlet"
                  className={`p-2 border rounded w-full focus:outline-none focus:ring-2 ${
                    editErrors.nama_outlet
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  value={editData.nama_outlet || ''}
                  onChange={handleEditInputChange}
                  maxLength="100"
                  aria-invalid={!!editErrors.nama_outlet}
                  aria-describedby={
                    editErrors.nama_outlet
                      ? 'edit_nama_outlet-error'
                      : undefined
                  }
                />
                {editErrors.nama_outlet && (
                  <p
                    id="edit_nama_outlet-error"
                    className="text-xs text-red-500 mt-1"
                  >
                    {editErrors.nama_outlet}
                  </p>
                )}
              </div>

              {/* Kode Outlet */}
              <div>
                <h4
                  htmlFor="edit_kode_outlet"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kode Outlet <span className="text-red-500">*</span>
                </h4>
                <input
                  id="edit_kode_outlet"
                  type="text"
                  name="kode_outlet"
                  placeholder="Kode Outlet"
                  className={`p-2 border rounded w-full focus:outline-none focus:ring-2 ${
                    editErrors.kode_outlet
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  value={editData.kode_outlet || ''}
                  onChange={handleEditInputChange}
                  maxLength="50"
                  aria-invalid={!!editErrors.kode_outlet}
                  aria-describedby={
                    editErrors.kode_outlet ? 'edit_kode_outlet-error' : undefined
                  }
                />
                {editErrors.kode_outlet && (
                  <p
                    id="edit_kode_outlet-error"
                    className="text-xs text-red-500 mt-1"
                  >
                    {editErrors.kode_outlet}
                  </p>
                )}
              </div>

              {/* No Telepon Outlet */}
              <div>
                <h4
                  htmlFor="edit_no_telp_outlet"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  No Telepon Outlet <span className="text-red-500">*</span>
                </h4>
                <input
                  id="edit_no_telp_outlet"
                  type="tel"
                  name="no_telp_outlet"
                  placeholder="No Telepon Outlet"
                  className={`p-2 border rounded w-full focus:outline-none focus:ring-2 ${
                    editErrors.no_telp_outlet
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  value={editData.no_telp_outlet || ''}
                  onChange={handleEditInputChange}
                  maxLength="13"
                  aria-invalid={!!editErrors.no_telp_outlet}
                  aria-describedby={
                    editErrors.no_telp_outlet
                      ? 'edit_no_telp_outlet-error'
                      : undefined
                  }
                />
                {editErrors.no_telp_outlet && (
                  <p
                    id="edit_no_telp_outlet-error"
                    className="text-xs text-red-500 mt-1"
                  >
                    {editErrors.no_telp_outlet}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors font-medium"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditData(null);
                    setEditErrors({});
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className={`p-2 rounded text-white font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={handleSaveEdit}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;