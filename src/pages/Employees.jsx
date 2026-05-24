import React, { useEffect, useState, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import {
  addDoc,
  collection,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';
import Toast from '../components/Toast';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [formData, setFormData] = useState({
    nama_karyawan: '',
    jabatan: '',
    no_telp: '',
    toko_ids: [],
  });
  const [searchToko, setSearchToko] = useState('');
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);
  const toastRef = useRef(null);

  // Fetch outlets from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'toko'), (snapshot) => {
      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      setOutlets(data);
      setFilteredOutlets(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch invoices from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'faktur'), (snapshot) =>
      setInvoices(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))
      )
    );
    return () => unsubscribe();
  }, []);

  // Fetch employees from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'karyawan'), (snapshot) => {
      setEmployees(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Show Toast
  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date || !(date instanceof Timestamp || date.toDate)) return '-';
    const dateObj = date.toDate ? date.toDate() : date;
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format date for time (day name)
  const formatHari = (timestamp) => {
    if (
      !timestamp ||
      (typeof timestamp.toDate !== 'function' && !(timestamp instanceof Date))
    ) {
      return 'Tanggal tidak valid';
    }
    const date = timestamp.toDate ? timestamp.toDate() : timestamp;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  // Check reminder status (days before due date)
  const getReminderStatus = (invoice) => {
    const jatuhTempo = invoice?.jatuh_tempo_pergantian;
    if (
      !jatuhTempo ||
      (typeof jatuhTempo.toDate !== 'function' && !(jatuhTempo instanceof Date))
    ) {
      return 'Tanggal tidak valid';
    }

    const now = new Date();
    const dueDate = jatuhTempo.toDate ? jatuhTempo.toDate() : jatuhTempo;
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '❌ Lewat tempo';
    if (diffDays === 0) return '⚠️ Jatuh tempo hari ini';
    return `⏰ Pengingat: ${diffDays} hari lagi`;
  };

  // Get outlet details by ID
  const getOutletById = (outletId) => outlets.find((outlet) => outlet.id === outletId);

  // Get store name by ID with fallback
  const getStoreName = (storeId) => {
    const store = getOutletById(storeId);
    return store ? store.nama_outlet : 'Toko tidak ditemukan';
  };

  // Get store code by ID with fallback
  const getStoreCode = (storeId) => {
    const store = getOutletById(storeId);
    return store ? store.kode_outlet : '-';
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama_karyawan?.trim()) {
      newErrors.nama_karyawan = 'Nama karyawan tidak boleh kosong';
    }

    if (!formData.jabatan?.trim()) {
      newErrors.jabatan = 'Jabatan tidak boleh kosong';
    }

    if (!formData.no_telp?.trim()) {
      newErrors.no_telp = 'Nomor telepon tidak boleh kosong';
    } else if (!/^(\+62|0)[0-9]{9,12}$/.test(formData.no_telp.replace(/\s/g, ''))) {
      newErrors.no_telp = 'Format nomor telepon tidak valid';
    }

    if (formData.toko_ids.length === 0) {
      newErrors.toko_ids = 'Pilih minimal satu toko';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle search toko
  const handleSearchToko = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchToko(searchValue);

    const filtered = outlets.filter(
      (outlet) =>
        outlet.nama_outlet.toLowerCase().includes(searchValue) ||
        outlet.kode_outlet.toLowerCase().includes(searchValue)
    );
    setFilteredOutlets(filtered);
  };

  // Handle multi-select for toko_ids
  const handleTokoChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      toko_ids: selectedOptions,
    }));
    if (errors.toko_ids) {
      setErrors((prev) => ({
        ...prev,
        toko_ids: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      displayToast('Silakan perbaiki error pada form', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'karyawan'), {
        nama_karyawan: formData.nama_karyawan.trim(),
        jabatan: formData.jabatan.trim(),
        no_telp: formData.no_telp.trim(),
        toko_ids: formData.toko_ids,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Reset form
      setFormData({
        nama_karyawan: '',
        jabatan: '',
        no_telp: '',
        toko_ids: [],
      });
      setSearchToko('');
      setErrors({});

      displayToast('Karyawan berhasil ditambahkan!', 'success');
    } catch (error) {
      console.error('Error adding employee:', error);
      displayToast('Gagal menambahkan karyawan. Coba lagi.', 'error');
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Daftar Karyawan" />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          ref={toastRef}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Form Tambah Karyawan */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Tambah Karyawan Baru</h3>
        <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Nama Karyawan */}
          <div>
            <h4 htmlFor="nama_karyawan" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Karyawan <span className="text-red-500">*</span>
            </h4>
            <input
              id="nama_karyawan"
              type="text"
              name="nama_karyawan"
              placeholder="Nama Karyawan"
              className={`p-2 border rounded w-full ${errors.nama_karyawan ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.nama_karyawan}
              onChange={handleInputChange}
              aria-describedby={errors.nama_karyawan ? 'error-nama_karyawan' : 'hint-nama_karyawan'}
            />
            {errors.nama_karyawan ? (
              <p id="error-nama_karyawan" className="text-xs text-red-500 mt-1" role="alert">{errors.nama_karyawan}</p>
            ) : (
              <p id="hint-nama_karyawan" className="text-xs text-gray-500 mt-1">
                {formData.nama_karyawan || 'Masukkan nama karyawan'}
              </p>
            )}
          </div>

          {/* Jabatan */}
          <div>
            <h4 htmlFor="jabatan" className="block text-sm font-medium text-gray-700 mb-1">
              Jabatan <span className="text-red-500">*</span>
            </h4>
            <input
              id="jabatan"
              type="text"
              name="jabatan"
              placeholder="Jabatan"
              className={`p-2 border rounded w-full ${errors.jabatan ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.jabatan}
              onChange={handleInputChange}
              aria-describedby={errors.jabatan ? 'error-jabatan' : 'hint-jabatan'}
            />
            {errors.jabatan ? (
              <p id="error-jabatan" className="text-xs text-red-500 mt-1" role="alert">{errors.jabatan}</p>
            ) : (
              <p id="hint-jabatan" className="text-xs text-gray-500 mt-1">
                {formData.jabatan || 'Masukkan jabatan'}
              </p>
            )}
          </div>

          {/* No Telepon */}
          <div>
            <h4 htmlFor="no_telp" className="block text-sm font-medium text-gray-700 mb-1">
              No Telepon <span className="text-red-500">*</span>
            </h4>
            <input
              id="no_telp"
              type="tel"
              name="no_telp"
              placeholder="No Telepon (0812xxxxx atau +62812xxxxx)"
              className={`p-2 border rounded w-full ${errors.no_telp ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.no_telp}
              onChange={handleInputChange}
              aria-describedby={errors.no_telp ? 'error-no_telp' : 'hint-no_telp'}
            />
            {errors.no_telp ? (
              <p id="error-no_telp" className="text-xs text-red-500 mt-1" role="alert">{errors.no_telp}</p>
            ) : (
              <p id="hint-no_telp" className="text-xs text-gray-500 mt-1">
                {formData.no_telp || 'Masukkan nomor telepon'}
              </p>
            )}
          </div>

          {/* Pilih Toko dengan Search */}
          <div>
            <h4 htmlFor="toko_search" className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Toko <span className="text-red-500">*</span>
            </h4>
            <div className="mb-2">
              <input
                id="toko_search"
                type="text"
                placeholder="Cari toko..."
                className="p-2 border border-gray-300 rounded w-full mb-2"
                value={searchToko}
                onChange={handleSearchToko}
              />
              <select
                id="toko_ids"
                name="toko_ids"
                className={`p-2 border rounded w-full ${errors.toko_ids ? 'border-red-500' : 'border-gray-300'}`}
                multiple
                size="4"
                value={formData.toko_ids}
                onChange={handleTokoChange}
                aria-describedby={errors.toko_ids ? 'error-toko_ids' : 'hint-toko_ids'}
              >
                {filteredOutlets.length === 0 ? (
                  <option disabled>Tidak ada toko yang cocok</option>
                ) : (
                  filteredOutlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.nama_outlet} - {outlet.kode_outlet}
                    </option>
                  ))
                )}
              </select>
            </div>
            {errors.toko_ids ? (
              <p id="error-toko_ids" className="text-xs text-red-500 mt-1" role="alert">{errors.toko_ids}</p>
            ) : (
              <p id="hint-toko_ids" className="text-xs text-gray-500 mt-1">
                {formData.toko_ids.length > 0
                  ? `${formData.toko_ids.length} toko dipilih: ${formData.toko_ids
                    .map((id) => {
                      const outlet = getOutletById(id);
                      return outlet ? outlet.nama_outlet : '';
                    })
                    .join(', ')}`
                  : 'Pilih satu atau lebih toko (Tekan Ctrl/Cmd untuk multiple)'}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition-colors font-semibold"
            >
              Simpan & Tambah Karyawan
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Karyawan */}
      <div className="mb-4">
        <h3 className="text-base font-bold mb-2">Daftar Karyawan</h3>
        {employees.map((employee) => {
          const employeeInvoices = invoices.filter(
            (invoice) => invoice.karyawan_id === employee.id
          );
          return (
            <div key={employee.id} className="mb-3 border rounded-lg p-2">
              <h4 className="text-lg font-semibold">{employee.nama_karyawan}</h4>
              <p className="text-gray-600 text-sm">{employee.jabatan}</p>
              <p className="text-gray-600 text-sm">
                No Telepon: {employee.no_telp || '-'}
              </p>
              <p className="text-xs text-gray-500">
                Jumlah Faktur Ditangani: {employeeInvoices.length}
              </p>

              <div className="mt-2">
                <h5 className="text-base font-medium mb-1">Faktur Ditangani</h5>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-1 text-sm">No Faktur</th>
                        <th className="border p-1 text-sm">Nama Toko</th>
                        <th className="border p-1 text-sm">Kode Toko</th>
                        <th className="border p-1 text-sm">Tanggal Transaksi</th>
                        <th className="border p-1 text-sm">Jatuh Tempo</th>
                        <th className="border p-1 text-sm">
                          Jatuh Tempo Pergantian
                        </th>
                        <th className="border p-1 text-sm">
                          Jatuh Tempo Pembayaran
                        </th>
                        <th className="border p-1 text-sm">Pengingat</th>
                        <th className="border p-1 text-sm">Aksi Karyawan</th>
                        <th className="border p-1 text-sm">Aksi Toko</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeInvoices.length === 0 ? (
                        <tr>
                          <td
                            colSpan="10"
                            className="border p-2 text-center text-gray-500"
                          >
                            Tidak ada faktur untuk karyawan ini
                          </td>
                        </tr>
                      ) : (
                        employeeInvoices.map((invoice) => {
                          const store = getOutletById(invoice.toko_id);
                          const reminder = getReminderStatus(invoice);
                          const tanggalTempo = formatDate(
                            invoice.jatuh_tempo_pergantian
                          );

                          const pesanWA = `Halo ${employee.nama_karyawan}, Anda memiliki faktur *${invoice.no_invoice}* dari outlet *${store?.nama_outlet || 'N/A'}*.\n\n📅 Jatuh tempo pergantian: *${tanggalTempo}*.\n🔔 ${reminder}\n\nMohon segera lakukan pertukaran faktur.`;
                          const waLink = `https://wa.me/${employee.no_telp?.replace(
                            /^0/,
                            '62'
                          )}?text=${encodeURIComponent(pesanWA)}`;

                          const pesanWAToko = `Halo, kami ingin mengingatkan bahwa faktur *${invoice.no_invoice}* dengan tanggal transaksi *${formatDate(
                            invoice.tanggal_transaksi
                          )}* memiliki jatuh tempo pembayaran pada *${formatDate(
                            invoice.jatuh_tempo_pembayaran
                          )}*.\n\n📅 Hari: *${formatHari(
                            invoice.jatuh_tempo_pembayaran
                          )}*\n\nMohon segera lakukan pembayaran. Terima kasih.`;
                          const waLinkToko = store?.no_telp_outlet
                            ? `https://wa.me/${store.no_telp_outlet?.replace(
                              /^0/,
                              '62'
                            )}?text=${encodeURIComponent(pesanWAToko)}`
                            : '#';

                          return (
                            <tr key={invoice.id}>
                              <td className="border p-1 text-sm">
                                {invoice.no_invoice}
                              </td>
                              <td className="border p-1 text-sm">
                                {getStoreName(invoice.toko_id)}
                              </td>
                              <td className="border p-1 text-sm">
                                {getStoreCode(invoice.toko_id)}
                              </td>
                              <td className="border p-1 text-sm">
                                {formatDate(invoice.tanggal_transaksi)}
                              </td>
                              <td className="border p-1 text-sm">
                                {formatDate(invoice.jatuh_tempo)}
                              </td>
                              <td className="border p-1 text-sm">
                                {formatDate(invoice.jatuh_tempo_pergantian)}
                              </td>
                              <td className="border p-1 text-sm">
                                {formatDate(invoice.jatuh_tempo_pembayaran)}
                              </td>
                              <td className="border p-1 text-sm">{reminder}</td>
                              <td className="border p-1 text-center">
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Kirim WhatsApp ke Karyawan"
                                  className="text-green-600 hover:text-green-800 text-lg"
                                >
                                  🟢
                                </a>
                              </td>
                              <td className="border p-1 text-center">
                                <a
                                  href={waLinkToko}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Kirim WhatsApp ke Toko"
                                  className="text-blue-600 hover:text-blue-800 text-lg"
                                >
                                  🔵
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
        {employees.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            Belum ada karyawan. Tambahkan karyawan baru di atas.
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;