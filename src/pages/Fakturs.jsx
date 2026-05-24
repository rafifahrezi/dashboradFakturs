import React, { useEffect, useState, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import {
  addDoc,
  collection,
  Timestamp,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';

const Fakturs = () => {
  const [invoices, setInvoices] = useState([]);
  const [tokoList, setTokoList] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [formData, setFormData] = useState({
    no_invoice: '',
    toko_id: '',
    karyawan_id: '',
    tanggal_transaksi: '',
    jatuh_tempo: '',
    jatuh_tempo_pergantian: '',
    jatuh_tempo_pembayaran: '',
    status: '',
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    content: '',
    isConfirm: false,
    onConfirm: null,
  });
  const dialogRef = useRef(null);

  // Load Toko Data
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'toko'), (snapshot) => {
      setTokoList(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Load Karyawan Data
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'karyawan'), (snapshot) => {
      setKaryawanList(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Load Faktur Data
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'faktur'), (snapshot) => {
      setInvoices(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (date) => {
    if (!date || !(date instanceof Timestamp)) return '-';
    return date.toDate().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatHari = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function')
      return 'Tanggal tidak valid';
    const date = timestamp.toDate();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  const getReminderStatus = (invoice) => {
    const jatuhTempo = invoice?.jatuh_tempo_pergantian;
    if (!jatuhTempo || typeof jatuhTempo.toDate !== 'function') {
      return 'Tanggal tidak valid';
    }

    const now = new Date();
    const dueDate = jatuhTempo.toDate();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '❌ Lewat tempo';
    if (diffDays === 0) return '⚠️ Jatuh tempo hari ini';

    return `⏰ Pengingat: ${diffDays} hari lagi`;
  };

  // Get Toko Details by ID
  const getTokoDetails = (tokoId) => tokoList.find((toko) => toko.id === tokoId) || {};

  // Get Karyawan Details by ID
  const getKaryawanDetails = (karyawanId) => karyawanList.find((karyawan) => karyawan.id === karyawanId) || {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.toko_id || !formData.karyawan_id) {
        setDialogContent({
          title: 'Error',
          content: 'Pilih Toko dan Karyawan terlebih dahulu',
          isConfirm: false,
        });
        setDialogVisible(true);
        return;
      }

      await addDoc(collection(db, 'faktur'), {
        no_invoice: formData.no_invoice,
        toko_id: formData.toko_id,
        karyawan_id: formData.karyawan_id,
        tanggal_transaksi: Timestamp.fromDate(
          new Date(formData.tanggal_transaksi)
        ),
        jatuh_tempo: Timestamp.fromDate(new Date(formData.jatuh_tempo)),
        jatuh_tempo_pergantian: Timestamp.fromDate(
          new Date(formData.jatuh_tempo_pergantian)
        ),
        jatuh_tempo_pembayaran: Timestamp.fromDate(
          new Date(formData.jatuh_tempo_pembayaran)
        ),
        status: formData.status || null,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Reset form
      setFormData({
        no_invoice: '',
        toko_id: '',
        karyawan_id: '',
        tanggal_transaksi: '',
        jatuh_tempo: '',
        jatuh_tempo_pergantian: '',
        jatuh_tempo_pembayaran: '',
        status: '',
      });

      // Dialog sukses
      setDialogContent({
        title: 'Sukses',
        content: 'Faktur berhasil ditambahkan',
        isConfirm: false,
      });
      setDialogVisible(true);
    } catch (error) {
      console.error('Error adding faktur:', error);
      setDialogContent({
        title: 'Error',
        content: 'Gagal menambahkan faktur. Coba lagi.',
        isConfirm: false,
      });
      setDialogVisible(true);
    }
  };

  const handleDelete = async (id) => {
    setDialogContent({
      title: 'Konfirmasi Hapus',
      content: 'Apakah Anda yakin ingin menghapus faktur ini?',
      isConfirm: true,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'faktur', id));
          setDialogContent({
            title: 'Sukses',
            content: 'Faktur berhasil dihapus',
            isConfirm: false,
          });
          setDialogVisible(true);
        } catch (error) {
          console.error('Error deleting faktur:', error);
          setDialogContent({
            title: 'Error',
            content: 'Gagal menghapus faktur',
            isConfirm: false,
          });
          setDialogVisible(true);
        }
      },
    });
    setDialogVisible(true);
  };

  const handleEdit = (invoice) => {
    if (!invoice || !invoice.id) {
      setDialogContent({
        title: 'Error',
        content: 'Data faktur tidak valid untuk pengeditan.',
        isConfirm: false,
      });
      setDialogVisible(true);
      return;
    }

    const editedData = {
      id: invoice.id,
      no_invoice: invoice.no_invoice || '',
      toko_id: invoice.toko_id || '',
      karyawan_id: invoice.karyawan_id || '',
      tanggal_transaksi:
        invoice.tanggal_transaksi instanceof Timestamp
          ? invoice.tanggal_transaksi.toDate().toISOString().split('T')[0]
          : invoice.tanggal_transaksi || '',
      jatuh_tempo:
        invoice.jatuh_tempo instanceof Timestamp
          ? invoice.jatuh_tempo.toDate().toISOString().split('T')[0]
          : invoice.jatuh_tempo || '',
      jatuh_tempo_pergantian:
        invoice.jatuh_tempo_pergantian instanceof Timestamp
          ? invoice.jatuh_tempo_pergantian.toDate().toISOString().split('T')[0]
          : invoice.jatuh_tempo_pergantian || '',
      jatuh_tempo_pembayaran:
        invoice.jatuh_tempo_pembayaran instanceof Timestamp
          ? invoice.jatuh_tempo_pembayaran.toDate().toISOString().split('T')[0]
          : invoice.jatuh_tempo_pembayaran || '',
      status: invoice.status || '',
    };
    setEditData(editedData);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editData) {
      try {
        if (!editData.toko_id || !editData.karyawan_id) {
          setDialogContent({
            title: 'Error',
            content: 'Pilih Toko dan Karyawan terlebih dahulu',
            isConfirm: false,
          });
          setDialogVisible(true);
          return;
        }

        await updateDoc(doc(db, 'faktur', editData.id), {
          no_invoice: editData.no_invoice,
          toko_id: editData.toko_id,
          karyawan_id: editData.karyawan_id,
          tanggal_transaksi: Timestamp.fromDate(
            new Date(editData.tanggal_transaksi)
          ),
          jatuh_tempo: Timestamp.fromDate(new Date(editData.jatuh_tempo)),
          jatuh_tempo_pergantian: Timestamp.fromDate(
            new Date(editData.jatuh_tempo_pergantian)
          ),
          jatuh_tempo_pembayaran: Timestamp.fromDate(
            new Date(editData.jatuh_tempo_pembayaran)
          ),
          status: editData.status || null,
          updated_at: Timestamp.now(),
        });

        setEditModalOpen(false);
        setEditData(null);
        setDialogContent({
          title: 'Sukses',
          content: 'Faktur berhasil diperbarui',
          isConfirm: false,
        });
        setDialogVisible(true);
      } catch (error) {
        console.error('Error updating faktur:', error);
        setDialogContent({
          title: 'Error',
          content: 'Gagal memperbarui faktur. Coba lagi.',
          isConfirm: false,
        });
        setDialogVisible(true);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'paid') {
      return 'bg-green-200 text-green-800';
    }
    if (status === 'overdue') {
      return 'bg-red-200 text-red-800';
    }
    return 'bg-yellow-200 text-yellow-800';
  };

  const dialogButtons = [
    {
      click: () => {
        setDialogVisible(false);
        if (dialogContent.isConfirm && dialogContent.onConfirm) {
          dialogContent.onConfirm();
        }
      },
      buttonModel: {
        content: dialogContent.isConfirm ? 'Ya' : 'OK',
        isPrimary: true,
      },
    },
    dialogContent.isConfirm && {
      click: () => setDialogVisible(false),
      buttonModel: { content: 'Batal', isPrimary: false },
    },
  ].filter(Boolean);

  return (
    <div className="m-2 md:m-10 mt-14 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Daftar Faktur" />
      <DialogComponent
        ref={dialogRef}
        visible={dialogVisible}
        header={dialogContent.title}
        content={dialogContent.content}
        buttons={dialogButtons}
        width="300px"
        isModal
        showCloseIcon
        close={() => setDialogVisible(false)}
      />

      {/* Form Tambah Faktur */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Tambah Faktur Baru</h3>
        <form className="grid md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          {/* No Invoice */}
          <div>
            <h4
              htmlFor="no_invoice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              No Invoice <span className="text-red-500">*</span>
            </h4>
            <input
              id="no_invoice"
              type="text"
              name="no_invoice"
              placeholder="No Invoice"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.no_invoice}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Dropdown Toko */}
          <div>
            <h4
              htmlFor="toko_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pilih Toko <span className="text-red-500">*</span>
            </h4>
            <select
              id="toko_id"
              name="toko_id"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.toko_id}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Pilih Toko --</option>
              {tokoList.map((toko) => (
                <option key={toko.id} value={toko.id}>
                  {toko.kode_outlet} - {toko.nama_outlet}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Karyawan */}
          <div>
            <h4
              htmlFor="karyawan_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pilih Karyawan <span className="text-red-500">*</span>
            </h4>
            <select
              id="karyawan_id"
              name="karyawan_id"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.karyawan_id}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Pilih Karyawan --</option>
              {karyawanList.map((karyawan) => (
                <option key={karyawan.id} value={karyawan.id}>
                  {karyawan.nama_karyawan} - {karyawan.jabatan}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <h4
              htmlFor="tanggal_transaksi"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tanggal Transaksi <span className="text-red-500">*</span>
            </h4>
            <input
              id="tanggal_transaksi"
              type="date"
              name="tanggal_transaksi"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.tanggal_transaksi}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Jatuh Tempo */}
          <div>
            <h4
              htmlFor="jatuh_tempo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Jatuh Tempo <span className="text-red-500">*</span>
            </h4>
            <input
              id="jatuh_tempo"
              type="date"
              name="jatuh_tempo"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.jatuh_tempo}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Jatuh Tempo Pergantian */}
          <div>
            <h4
              htmlFor="jatuh_tempo_pergantian"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Jatuh Tempo Pergantian <span className="text-red-500">*</span>
            </h4>
            <input
              id="jatuh_tempo_pergantian"
              type="date"
              name="jatuh_tempo_pergantian"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.jatuh_tempo_pergantian}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Jatuh Tempo Pembayaran */}
          <div>
            <h4
              htmlFor="jatuh_tempo_pembayaran"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Jatuh Tempo Pembayaran <span className="text-red-500">*</span>
            </h4>
            <input
              id="jatuh_tempo_pembayaran"
              type="date"
              name="jatuh_tempo_pembayaran"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.jatuh_tempo_pembayaran}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Status */}
          <div>
            <h4
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status <span className="text-gray-500">(Opsional)</span>
            </h4>
            <select
              id="status"
              name="status"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="">-- Pilih Status --</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition-colors font-semibold"
            >
              Simpan & Tambah Faktur
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Daftar Faktur */}
      <div>
        <h3 className="text-lg font-bold mb-4">Daftar Faktur</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-sm text-left">Karyawan</th>
                <th className="border p-2 text-sm text-left">Toko</th>
                <th className="border p-2 text-sm text-left">No Faktur</th>
                <th className="border p-2 text-sm text-left">Tanggal Transaksi</th>
                <th className="border p-2 text-sm text-left">Jatuh Tempo</th>
                <th className="border p-2 text-sm text-left">Jatuh Tempo Pergantian</th>
                <th className="border p-2 text-sm text-left">Jatuh Tempo Pembayaran</th>
                <th className="border p-2 text-sm text-left">Status</th>
                <th className="border p-2 text-sm text-left">Pengingat</th>
                <th className="border p-2 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const toko = getTokoDetails(invoice.toko_id);
                const karyawan = getKaryawanDetails(invoice.karyawan_id);
                const statusBadgeClass = getStatusBadgeClass(invoice.status);

                return (
                  <tr key={invoice.id}>
                    <td className="border p-2 text-sm">
                      {karyawan.nama_karyawan || '-'}
                    </td>
                    <td className="border p-2 text-sm">
                      {toko.nama_outlet || '-'}
                    </td>
                    <td className="border p-2 text-sm">{invoice.no_invoice}</td>
                    <td className="border p-2 text-sm">
                      {formatDate(invoice.tanggal_transaksi)}
                    </td>
                    <td className="border p-2 text-sm">
                      {formatDate(invoice.jatuh_tempo)}
                    </td>
                    <td className="border p-2 text-sm">
                      {formatDate(invoice.jatuh_tempo_pergantian)}
                    </td>
                    <td className="border p-2 text-sm">
                      {formatDate(invoice.jatuh_tempo_pembayaran)}
                    </td>
                    <td className="border p-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${statusBadgeClass}`}
                      >
                        {invoice.status || 'N/A'}
                      </span>
                    </td>
                    <td className="border p-2 text-sm">
                      {getReminderStatus(invoice)}
                    </td>
                    <td className="border p-2 text-sm">
                      <div className="flex space-x-2 justify-center">
                        <button
                          type="button"
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer transition-colors duration-200 text-xs font-semibold"
                          onClick={() => handleEdit(invoice)}
                          aria-label="Edit faktur"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 cursor-pointer transition-colors duration-200 text-xs font-semibold"
                          onClick={() => handleDelete(invoice.id)}
                          aria-label="Hapus faktur"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Faktur</h3>
            <form className="grid md:grid-cols-2 gap-4">
              {/* No Invoice */}
              <div>
                <h4
                  htmlFor="edit_no_invoice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  No Invoice
                </h4>
                <input
                  id="edit_no_invoice"
                  type="text"
                  name="no_invoice"
                  placeholder="No Invoice"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.no_invoice || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              {/* Dropdown Toko */}
              <div>
                <h4
                  htmlFor="edit_toko_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pilih Toko
                </h4>
                <select
                  id="edit_toko_id"
                  name="toko_id"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.toko_id || ''}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="">-- Pilih Toko --</option>
                  {tokoList.map((toko) => (
                    <option key={toko.id} value={toko.id}>
                      {toko.kode_outlet} - {toko.nama_outlet}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Karyawan */}
              <div>
                <h4
                  htmlFor="edit_karyawan_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pilih Karyawan
                </h4>
                <select
                  id="edit_karyawan_id"
                  name="karyawan_id"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.karyawan_id || ''}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {karyawanList.map((karyawan) => (
                    <option key={karyawan.id} value={karyawan.id}>
                      {karyawan.nama_karyawan} - {karyawan.jabatan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Transaksi */}
              <div>
                <h4
                  htmlFor="edit_tanggal_transaksi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tanggal Transaksi
                </h4>
                <input
                  id="edit_tanggal_transaksi"
                  type="date"
                  name="tanggal_transaksi"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.tanggal_transaksi || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              {/* Jatuh Tempo */}
              <div>
                <h4
                  htmlFor="edit_jatuh_tempo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jatuh Tempo
                </h4>
                <input
                  id="edit_jatuh_tempo"
                  type="date"
                  name="jatuh_tempo"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.jatuh_tempo || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              {/* Jatuh Tempo Pergantian */}
              <div>
                <h4
                  htmlFor="edit_jatuh_tempo_pergantian"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jatuh Tempo Pergantian
                </h4>
                <input
                  id="edit_jatuh_tempo_pergantian"
                  type="date"
                  name="jatuh_tempo_pergantian"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.jatuh_tempo_pergantian || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              {/* Jatuh Tempo Pembayaran */}
              <div>
                <h4
                  htmlFor="edit_jatuh_tempo_pembayaran"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jatuh Tempo Pembayaran
                </h4>
                <input
                  id="edit_jatuh_tempo_pembayaran"
                  type="date"
                  name="jatuh_tempo_pembayaran"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.jatuh_tempo_pembayaran || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              {/* Status */}
              <div>
                <h4
                  htmlFor="edit_status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </h4>
                <select
                  id="edit_status"
                  name="status"
                  className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.status || ''}
                  onChange={handleEditInputChange}
                >
                  <option value="">-- Pilih Status --</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
                  onClick={() => setEditModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
                  onClick={handleSaveEdit}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fakturs;