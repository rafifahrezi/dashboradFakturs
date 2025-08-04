import React, { useEffect, useState, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { collection, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
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
  const [dialogVisible, setDialogVisible] = useState(false); // Fixed destructuring
  const [dialogContent, setDialogContent] = useState({ title: '', content: '', isConfirm: false, onConfirm: null });
  const dialogRef = useRef(null);

  // Fetch invoices from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'faktur'), (snapshot) =>
      setInvoices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsubscribe();
  }, []);

  // Fetch employees from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'karyawan'), (snapshot) => {
      setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Format date for display
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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
      setDialogContent({
        title: 'Sukses',
        content: 'Karyawan dan faktur berhasil ditambahkan',
        isConfirm: false,
      });
      setDialogVisible(true);
    } catch (error) {
      setDialogContent({
        title: 'Error',
        content: 'Gagal menambahkan karyawan dan faktur. Coba lagi.',
        isConfirm: false,
      });
      setDialogVisible(true);
    }
  };

  const dialogButtons = [
    {
      click: () => setDialogVisible(false),
      buttonModel: { content: 'OK', isPrimary: true },
    },
  ];

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Daftar Karyawan" />
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
      {/* Form Tambah Karyawan dan Faktur */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Tambah Karyawan dan Faktur Baru</h3>
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
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded md:col-span-3"
          >
            Tambah Karyawan dan Faktur
          </button>
        </form>
      </div>

      {/* Daftar Karyawan */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Daftar Karyawan</h3>
        {employees.map((employee) => {
          const employeeInvoices = invoices.filter(
            (invoice) => invoice.nama_karyawan === employee.nama_karyawan,
          );
          return (
            <div key={employee.id} className="mb-6 border rounded-lg p-4">
              <h4 className="text-xl font-semibold">{employee.nama_karyawan}</h4>
              <p className="text-gray-600">{employee.jabatan}</p>
              <p className="text-gray-600">No Telepon: {employee.no_telp || '-'}</p>
              <p className="text-sm text-gray-500">
                Jumlah Faktur Ditangani: {employeeInvoices.length}
              </p>
              <div className="mt-4">
                <h5 className="text-lg font-medium mb-2">Faktur Ditangani</h5>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">No Faktur</th>
                      <th className="border p-2">Nama Outlet</th>
                      <th className="border p-2">Kode Outlet</th>
                      <th className="border p-2">Tanggal Transaksi</th>
                      <th className="border p-2">Jatuh Tempo</th>
                      <th className="border p-2">Hari Penggantian</th>
                      <th className="border p-2">Jatuh Tempo Penggantian</th>
                      <th className="border p-2">Pengingat</th>
                      <th className="border p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeInvoices.map((invoice) => {
                      const reminder = getReminderStatus(invoice);
                      const tanggalTempo = formatDate(invoice.jatuh_tempo_pergantian);
                      const pesanWA = `Halo ${employee.nama_karyawan}, Anda memiliki faktur *${invoice.no_invoice}* dari outlet *${invoice.nama_outlet}*.\n\n📅 Jatuh tempo pergantian: *${tanggalTempo}*.\n🔔 ${reminder}\n\nMohon segera lakukan pertukaran faktur.`;
                      const waLink = `https://wa.me/${employee.no_telp.replace(/^0/, '62')}?text=${encodeURIComponent(pesanWA)}`;
                      return (
                        <tr key={invoice.id}>
                          <td className="border p-2">{invoice.no_invoice}</td>
                          <td className="border p-2">{invoice.nama_outlet}</td>
                          <td className="border p-2">{invoice.kode_outlet}</td>
                          <td className="border p-2">{formatDate(invoice.tanggal_transaksi)}</td>
                          <td className="border p-2">{formatDate(invoice.jatuh_tempo)}</td>
                          <td className="border p-2">{formatHari(invoice.hari_pergantian)}</td>
                          <td className="border p-2">{tanggalTempo}</td>
                          <td className="border p-2">{reminder}</td>
                          <td className="border p-2 text-center">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Kirim WhatsApp"
                              className="text-green-600 hover:text-green-800 text-xl"
                            >
                              🟢
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Employees;
