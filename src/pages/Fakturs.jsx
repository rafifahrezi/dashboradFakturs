import React, { useEffect, useState } from 'react';
import { collection, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';

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
  });

  // Ambil data faktur dari Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'faktur'), (snapshot) => {
      setInvoices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

  // Check reminder status (7 days before due date)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'faktur'), {
        no_invoice: formData.no_invoice,
        kode_outlet: formData.kode_outlet,
        nama_outlet: formData.nama_outlet,
        tanggal_transaksi: Timestamp.fromDate(new Date(formData.tanggal_transaksi)),
        jatuh_tempo: Timestamp.fromDate(new Date(formData.jatuh_tempo)),
        hari_pergantian: Timestamp.fromDate(new Date(formData.hari_pergantian)),
        jatuh_tempo_pergantian: Timestamp.fromDate(new Date(formData.jatuh_tempo_pergantian)),
      });

      setFormData({
        no_invoice: '',
        kode_outlet: '',
        nama_outlet: '',
        tanggal_transaksi: '',
        jatuh_tempo: '',
        hari_pergantian: '',
        jatuh_tempo_pergantian: '',
      });
    } catch (error) {
      alert('Gagal menambahkan data faktur');
    }
  };
  const formatHari = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Tanggal tidak valid';
    const date = timestamp.toDate();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Daftar Faktur" />
      {/* Form Tambah Faktur */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Tambah Faktur Baru</h3>
        <form className="grid md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nama_karyawan"
            placeholder="Nama Karyawan"
            className="p-2 border rounded"
            value={formData.nama_karyawan}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="jabatan"
            placeholder="Jabatan"
            className="p-2 border rounded"
            value={formData.jabatan}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="no_telp"
            placeholder="No Telepon"
            className="p-2 border rounded"
            value={formData.no_telp}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="no_invoice"
            placeholder="No Invoice"
            className="p-2 border rounded"
            value={formData.no_invoice}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="kode_outlet"
            placeholder="Kode Outlet"
            className="p-2 border rounded"
            value={formData.kode_outlet}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="nama_outlet"
            placeholder="Nama Outlet"
            className="p-2 border rounded"
            value={formData.nama_outlet}
            onChange={handleInputChange}
            required
          />
          <div>
            <input
              type="date"
              name="tanggal_transaksi"
              className="p-2 border rounded"
              value={formData.tanggal_transaksi}
              onChange={handleInputChange}
              required
            />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Transaksi</h6>
          </div>
          <div>
            <input
              type="date"
              name="jatuh_tempo"
              className="p-2 border rounded"
              value={formData.jatuh_tempo}
              onChange={handleInputChange}
              required
            />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Jatuh Tempo</h6>
          </div>
          <div>
            <input
              type="date"
              name="hari_pergantian"
              className="p-2 border rounded"
              value={formData.hari_pergantian}
              onChange={handleInputChange}
              required
            />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Hari Pergantian</h6>
          </div>
          <div>
            <input
              type="date"
              name="jatuh_tempo_pergantian"
              className="p-2 border rounded"
              value={formData.jatuh_tempo_pergantian}
              onChange={handleInputChange}
              required
            />
            <h6 className="text-xs text-gray-500 mt-1">Masukkan Tanggal Jatuh Tempo Pergantian</h6>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded w-full"
            >
              Tambah Faktur
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Faktur */}
      <div>
        <h3 className="text-lg font-bold mb-4">Daftar Faktur</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Karyawan Handle</th>
              <th className="border p-2">No Faktur</th>
              <th className="border p-2">Kode Outlet</th>
              <th className="border p-2">Nama Outlet</th>
              <th className="border p-2">Tanggal Transaksi</th>
              <th className="border p-2">Jatuh Tempo</th>
              <th className="border p-2">Hari Pergantian</th>
              <th className="border p-2">Jatuh Tempo Pergantian</th>
              <th className="border p-2">Pengingat</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="border p-2">{invoice.nama_karyawan}</td>
                <td className="border p-2">{invoice.no_invoice}</td>
                <td className="border p-2">{invoice.kode_outlet}</td>
                <td className="border p-2">{invoice.nama_outlet}</td>
                <td className="border p-2">{formatDate(invoice.tanggal_transaksi)}</td>
                <td className="border p-2">{formatDate(invoice.jatuh_tempo)}</td>
                <td className="border p-2">{formatHari(invoice.hari_pergantian)}</td>
                <td className="border p-2">{formatDate(invoice.jatuh_tempo_pergantian)}</td>
                <td className="border p-2">{getReminderStatus(invoice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fakturs;
