import React, { useEffect, useState, useRef } from 'react';
// import { DialogComponent } from '@syncfusion/ej2-react-popups';
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
  // const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [formData, setFormData] = useState({
    nama_karyawan: '',
    jabatan: '',
    no_telp: '',
    toko_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'toko'), (snapshot) => {
      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      setOutlets(data);
      // setFilteredOutlets(data);
    });
    return () => unsubscribe();
  }, []);

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

  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const normalizeText = (value = '') => value.trim().replace(/\s+/g, ' ');

  const formatPhone = (phone = '') => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('08')) return `62${cleaned.slice(1)}`;
    if (cleaned.startsWith('+62')) return cleaned.replace('+', '');
    return cleaned;
  };

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

  const formatDate = (date) => {
    if (!date || !(date instanceof Timestamp)) return '-';
    return date.toDate().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getOutletById = (outletId) => outlets.find((outlet) => outlet.id === outletId);

  // Get store name by ID with fallback
  const getStoreName = (storeId) => {
    const store = getOutletById(storeId);
    return store ? store.nama_outlet : 'Toko tidak ditemukan';
  };
  const getStoreCode = (storeId) => {
    const store = getOutletById(storeId);
    return store ? store.kode_outlet : '-';
  };

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

  const validateForm = () => {
    const newErrors = {};
    const nama = normalizeText(formData.nama_karyawan);
    const jabatan = normalizeText(formData.jabatan);
    const noTelp = normalizeText(formData.no_telp).replace(/\s/g, '');

    if (!nama) {
      newErrors.nama_karyawan = 'Nama karyawan wajib diisi';
    }
    if (!jabatan) {
      newErrors.jabatan = 'Jabatan wajib diisi';
    }
    if (!noTelp) {
      newErrors.no_telp = 'Nomor telepon wajib diisi';
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(noTelp)) {
      newErrors.no_telp = 'Format nomor telepon tidak valid';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      cleanData: {
        nama_karyawan: nama,
        jabatan,
        no_telp: noTelp,
      },
    };
  };

  const checkDuplicateEmployee = (cleanData) => {
    const nama = cleanData.nama_karyawan.toLowerCase();
    const telp = cleanData.no_telp.replace(/\D/g, '');

    return employees.some((emp) => {
      const empNama = normalizeText(emp?.nama_karyawan || '').toLowerCase();
      const empTelp = formatPhone(emp?.no_telp || '').replace(/\D/g, '');

      return empNama === nama || empTelp === telp;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, cleanData } = validateForm();
    if (!isValid) {
      displayToast('Silakan periksa kembali form yang diisi', 'error');
      return;
    }

    try {
      const isDuplicate = checkDuplicateEmployee(cleanData);

      if (isDuplicate) {
        displayToast(
          'Data karyawan sudah ada di database. Nama atau nomor telepon tidak boleh sama.',
          'error'
        );
        return;
      }

      await addDoc(collection(db, 'karyawan'), {
        nama_karyawan: cleanData.nama_karyawan,
        jabatan: cleanData.jabatan,
        no_telp: cleanData.no_telp,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      setFormData({
        nama_karyawan: '',
        jabatan: '',
        no_telp: '',
      });
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