import React, { useEffect, useState, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { addDoc, collection, Timestamp, query, where, getDocs, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';

const Fakturs = () => {
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    no_invoice: '',
    kode_outlet: '',
    nama_outlet: '',
    tanggal_transaksi: '',
    jatuh_tempo: '',
    hari_pergantian: '',
    jatuh_tempo_pergantian: '',
    nama_karyawan: '',
    jabatan: '',
    no_telp: '',
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', content: '', isConfirm: false, onConfirm: null });
  const dialogRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'faktur'), (snapshot) => {
      setInvoices(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
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
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Tanggal tidak valid';
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
      await addDoc(collection(db, 'faktur'), {
        no_invoice: formData.no_invoice,
        kode_outlet: formData.kode_outlet,
        nama_outlet: formData.nama_outlet,
        nama_karyawan: formData.nama_karyawan,
        jabatan: formData.jabatan,
        no_telp: formData.no_telp,
        tanggal_transaksi: Timestamp.fromDate(new Date(formData.tanggal_transaksi)),
        jatuh_tempo: Timestamp.fromDate(new Date(formData.jatuh_tempo)),
        hari_pergantian: Timestamp.fromDate(new Date(formData.hari_pergantian)),
        jatuh_tempo_pergantian: Timestamp.fromDate(new Date(formData.jatuh_tempo_pergantian)),
      });

      const q = query(
        collection(db, 'karyawan'),
        where('nama_karyawan', '==', formData.nama_karyawan)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'karyawan'), {
          nama_karyawan: formData.nama_karyawan,
          jabatan: formData.jabatan,
          no_telp: formData.no_telp,
          created_at: Timestamp.now(),
        });
      }

      // 4️⃣ Reset form
      setFormData({
        nama_karyawan: '',
        jabatan: '',
        no_telp: '',
        no_invoice: '',
        kode_outlet: '',
        nama_outlet: '',
        tanggal_transaksi: '',
        jatuh_tempo: '',
        hari_pergantian: '',
        jatuh_tempo_pergantian: '',
      });

      // 5️⃣ Dialog sukses
      setDialogContent({
        title: 'Sukses',
        content: 'Faktur berhasil ditambahkan',
        isConfirm: false,
      });
      setDialogVisible(true);
    } catch (error) {
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
      kode_outlet: invoice.kode_outlet || '',
      nama_outlet: invoice.nama_outlet || '',
      nama_karyawan: invoice.nama_karyawan || '',
      jabatan: invoice.jabatan || '',
      no_telp: invoice.no_telp || '',
      tanggal_transaksi: invoice.tanggal_transaksi instanceof Timestamp
        ? invoice.tanggal_transaksi.toDate().toISOString().split('T')[0]
        : invoice.tanggal_transaksi || '',
      jatuh_tempo: invoice.jatuh_tempo instanceof Timestamp
        ? invoice.jatuh_tempo.toDate().toISOString().split('T')[0]
        : invoice.jatuh_tempo || '',
      hari_pergantian: invoice.hari_pergantian instanceof Timestamp
        ? invoice.hari_pergantian.toDate().toISOString().split('T')[0]
        : invoice.hari_pergantian || '',
      jatuh_tempo_pergantian: invoice.jatuh_tempo_pergantian instanceof Timestamp
        ? invoice.jatuh_tempo_pergantian.toDate().toISOString().split('T')[0]
        : invoice.jatuh_tempo_pergantian || '',
    };
    setEditData(editedData);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editData) {
      try {
        await updateDoc(doc(db, 'faktur', editData.id), {
          no_invoice: editData.no_invoice,
          kode_outlet: editData.kode_outlet,
          nama_outlet: editData.nama_outlet,
          nama_karyawan: editData.nama_karyawan,
          jabatan: editData.jabatan,
          no_telp: editData.no_telp,
          tanggal_transaksi: Timestamp.fromDate(new Date(editData.tanggal_transaksi)),
          jatuh_tempo: Timestamp.fromDate(new Date(editData.jatuh_tempo)),
          hari_pergantian: Timestamp.fromDate(new Date(editData.hari_pergantian)),
          jatuh_tempo_pergantian: Timestamp.fromDate(new Date(editData.jatuh_tempo_pergantian)),
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
        setDialogContent({
          title: 'Error',
          content: 'Gagal memperbarui faktur. Coba lagi.',
          isConfirm: false,
        });
        setDialogVisible(true);
      }
    }
  };

  const dialogButtons = [
    {
      click: () => {
        setDialogVisible(false);
        if (dialogContent.isConfirm && dialogContent.onConfirm) {
          dialogContent.onConfirm();
        }
      },
      buttonModel: { content: dialogContent.isConfirm ? 'Ya' : 'OK', isPrimary: true },
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
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Tambah Faktur Baru</h3>
        <form className="grid md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <input type="text" name="nama_karyawan" placeholder="Nama Karyawan" className="p-2 border rounded" value={formData.nama_karyawan} onChange={handleInputChange} required />
          <input type="text" name="jabatan" placeholder="Jabatan" className="p-2 border rounded" value={formData.jabatan} onChange={handleInputChange} required />
          <input type="text" name="no_telp" placeholder="No Telepon" className="p-2 border rounded" value={formData.no_telp} onChange={handleInputChange} required />
          <input type="text" name="no_invoice" placeholder="No Invoice" className="p-2 border rounded" value={formData.no_invoice} onChange={handleInputChange} required />
          <input type="text" name="kode_outlet" placeholder="Kode Outlet" className="p-2 border rounded" value={formData.kode_outlet} onChange={handleInputChange} required />
          <input type="text" name="nama_outlet" placeholder="Nama Outlet" className="p-2 border rounded" value={formData.nama_outlet} onChange={handleInputChange} required />

          <div>
            <input type="date" name="tanggal_transaksi" className="p-2 border rounded" value={formData.tanggal_transaksi} onChange={handleInputChange} required />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Transaksi</h6>
          </div>
          <div>
            <input type="date" name="jatuh_tempo" className="p-2 border rounded" value={formData.jatuh_tempo} onChange={handleInputChange} required />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Jatuh Tempo</h6>
          </div>
          <div>
            <input type="date" name="hari_pergantian" className="p-2 border rounded" value={formData.hari_pergantian} onChange={handleInputChange} required />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Hari Pergantian</h6>
          </div>
          <div>
            <input type="date" name="jatuh_tempo_pergantian" className="p-2 border rounded" value={formData.jatuh_tempo_pergantian} onChange={handleInputChange} required />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Jatuh Tempo Pergantian</h6>
          </div>

          <div className="md:col-span-3">
            <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
              Tambah Faktur
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Daftar Faktur</h3>
        <table className="w-full border-collapse mx-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-1 text-sm">Karyawan Handle</th>
              <th className="border p-1 text-sm">No Faktur</th>
              <th className="border p-1 text-sm">Kode Outlet</th>
              <th className="border p-1 text-sm">Nama Outlet</th>
              <th className="border p-1 text-sm">Tanggal Transaksi</th>
              <th className="border p-1 text-sm">Jatuh Tempo</th>
              <th className="border p-1 text-sm">Hari Pergantian</th>
              <th className="border p-1 text-sm">Jatuh Tempo Pergantian</th>
              <th className="border p-1 text-sm">Pengingat</th>
              <th className="border p-1 text-sm">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="border p-1 text-sm">{invoice.nama_karyawan}</td>
                <td className="border p-1 text-sm">{invoice.no_invoice}</td>
                <td className="border p-1 text-sm">{invoice.kode_outlet}</td>
                <td className="border p-1 text-sm">{invoice.nama_outlet}</td>
                <td className="border p-1 text-sm">{formatDate(invoice.tanggal_transaksi)}</td>
                <td className="border p-1 text-sm">{formatDate(invoice.jatuh_tempo)}</td>
                <td className="border p-1 text-sm">{formatHari(invoice.hari_pergantian)}</td>
                <td className="border p-1 text-sm">{formatDate(invoice.jatuh_tempo_pergantian)}</td>
                <td className="border p-1 text-sm">{getReminderStatus(invoice)}</td>
                <td className="border p-1 text-sm">
                  <div className="flex space-x-1">
                    <span
                      className="text-yellow-600 hover:text-yellow-800 cursor-pointer transition-colors duration-200 text-xs"
                      onClick={() => handleEdit(invoice)}
                    >
                      Edit
                    </span>
                    <span
                      className="text-red-600 hover:text-red-800 cursor-pointer transition-colors duration-200 text-xs"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      Hapus
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editModalOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-3/4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Faktur</h3>
            <form className="grid md:grid-cols-2 gap-4">
              <input type="text" name="nama_karyawan" placeholder="Nama Karyawan" className="p-2 border rounded" value={editData.nama_karyawan || ''} onChange={handleEditInputChange} required />
              <input type="text" name="jabatan" placeholder="Jabatan" className="p-2 border rounded" value={editData.jabatan || ''} onChange={handleEditInputChange} required />
              <input type="text" name="no_telp" placeholder="No Telepon" className="p-2 border rounded" value={editData.no_telp || ''} onChange={handleEditInputChange} required />
              <input type="text" name="no_invoice" placeholder="No Invoice" className="p-2 border rounded" value={editData.no_invoice || ''} onChange={handleEditInputChange} required />
              <input type="text" name="kode_outlet" placeholder="Kode Outlet" className="p-2 border rounded" value={editData.kode_outlet || ''} onChange={handleEditInputChange} required />
              <input type="text" name="nama_outlet" placeholder="Nama Outlet" className="p-2 border rounded" value={editData.nama_outlet || ''} onChange={handleEditInputChange} required />
              <div>
                <input type="date" name="tanggal_transaksi" className="p-2 border rounded" value={editData.tanggal_transaksi || ''} onChange={handleEditInputChange} required />
                <h6 className="text-xs text-gray-500 mt-1">Tanggal Transaksi</h6>
              </div>
              <div>
                <input type="date" name="jatuh_tempo" className="p-2 border rounded" value={editData.jatuh_tempo || ''} onChange={handleEditInputChange} required />
                <h6 className="text-xs text-gray-500 mt-1">Tanggal Jatuh Tempo</h6>
              </div>
              <div>
                <input type="date" name="hari_pergantian" className="p-2 border rounded" value={editData.hari_pergantian || ''} onChange={handleEditInputChange} required />
                <h6 className="text-xs text-gray-500 mt-1">Tanggal Hari Pergantian</h6>
              </div>
              <div>
                <input type="date" name="jatuh_tempo_pergantian" className="p-2 border rounded" value={editData.jatuh_tempo_pergantian || ''} onChange={handleEditInputChange} required />
                <h6 className="text-xs text-gray-500 mt-1">Tanggal Jatuh Tempo Pergantian</h6>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" className="bg-gray-500 text-white p-2 rounded" onClick={() => setEditModalOpen(false)}>Batal</button>
                <button type="button" className="bg-green-500 text-white p-2 rounded" onClick={handleSaveEdit}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fakturs;
