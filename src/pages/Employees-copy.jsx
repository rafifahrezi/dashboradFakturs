// (2) tabel with view
// import React from 'react';
// import { GridComponent, Inject, ColumnsDirective, ColumnDirective, Search, Page } from '@syncfusion/ej2-react-grids';

// import { employeesData, employeesGrid } from '../data/dummy';
// import { Header } from '../components';

// function Employees() {
//   try {
//     const [employees] = React.useState([
//       { id: 1, name: 'Budi Santoso', position: 'Manager Toko', department: 'Retail', email: 'budi@company.com', phone: '081234567890', status: 'Aktif' },
//       { id: 2, name: 'Siti Nurhaliza', position: 'Supervisor', department: 'Retail', email: 'siti@company.com', phone: '081234567891', status: 'Aktif' },
//       { id: 3, name: 'Ahmad Wijaya', position: 'Kasir', department: 'Retail', email: 'ahmad@company.com', phone: '081234567892', status: 'Cuti' }
//     ]);

//     return (
//       <div data-name="karyawan" data-file="pages/Karyawan.js" className="fade-in">
//         <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
//           <div className="mb-8 flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Karyawan</h1>
//               <p className="text-gray-600">Kelola data dan informasi karyawan</p>
//             </div>
//             <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
//               <i className="fas fa-user-plus mr-2"></i>
//               Tambah Karyawan
//             </button>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Nama
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Posisi
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Departemen
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Email
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Telepon
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Aksi
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {employees.map((employee) => (
//                     <tr key={employee.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <img
//                             className="h-10 w-10 rounded-full object-cover"
//                             src={`https://images.unsplash.com/photo-${1500000000000 + employee.id}?w=40&h=40&fit=crop&crop=face`}
//                             alt={employee.name}
//                           />
//                           <div className="ml-4">
//                             <div className="font-medium text-gray-900">{employee.name}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {employee.position}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {employee.department}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {employee.email}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {employee.phone}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.status === 'Aktif'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                           {employee.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button className="text-blue-600 hover:text-blue-900 mr-3">
//                           <i className="fas fa-edit"></i>
//                         </button>
//                         <button className="text-red-600 hover:text-red-900">
//                           <i className="fas fa-user-times"></i>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//         </div>
//       </div>
//     );
//   } catch (error) {
//     console.error('Karyawan component error:', error);
//     reportError(error);
//   }
// }

// export default Employees;

// (2)

import React, { useEffect, useState } from 'react';
import { collection, addDoc, Timestamp, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';

const Employees = () => {
  // State untuk karyawan dan faktur
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    nama_karyawan: '',
    jabatan: '',
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

  // Ambil data karyawan dari Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'karyawan'), (snapshot) => {
      const employeesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeesData);
    });
    return () => unsubscribe();
  }, []);

  // Format tanggal untuk tampilan
  const formatDate = (date) => {
    if (!date || !(date instanceof Timestamp)) return '-';
    return date.toDate().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Cek pengingat (7 hari sebelum jatuh tempo)
  const getReminderStatus = (dueDate) => {
    if (!dueDate || !(dueDate instanceof Timestamp)) return '';
    const now = new Date('2025-07-20T23:07:00'); // Tanggal saat ini (20 Juli 2025, 23:07 WIB)
    const due = dueDate.toDate();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0 ? `Pengingat: ${diffDays} hari lagi` : '';
  };

  // Hitung jumlah faktur ditangani berdasarkan nama karyawan
  const getInvoiceCount = (employeeName) => {
    return invoices.filter((invoice) => invoice.nama_karyawan === employeeName).length;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit untuk menambahkan karyawan dan faktur
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Tambah karyawan
      const employeeRef = await addDoc(collection(db, 'karyawan'), {
        nama_karyawan: formData.nama_karyawan,
        jabatan: formData.jabatan,
      });

      // Tambah faktur terkait karyawan
      await addDoc(collection(db, 'faktur'), {
        no_invoice: formData.no_invoice,
        kode_outlet: formData.kode_outlet,
        nama_outlet: formData.nama_outlet,
        tanggal_transaksi: Timestamp.fromDate(new Date(formData.tanggal_transaksi)),
        jatuh_tempo: Timestamp.fromDate(new Date(formData.jatuh_tempo)),
        hari_pergantian: Timestamp.fromDate(new Date(formData.hari_pergantian)),
        jatuh_tempo_pergantian: Timestamp.fromDate(new Date(formData.jatuh_tempo_pergantian)),
        nama_karyawan: formData.nama_karyawan, // Hubungkan faktur dengan karyawan
      });

      // Reset form
      setFormData({
        nama_karyawan: '',
        jabatan: '',
        no_invoice: '',
        kode_outlet: '',
        nama_outlet: '',
        tanggal_transaksi: '',
        jatuh_tempo: '',
        hari_pergantian: '',
        jatuh_tempo_pergantian: '',
      });
    } catch (error) {
      alert('Gagal menambahkan data karyawan atau faktur');
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Daftar Karyawan" />

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
          <input
            type="date"
            name="tanggal_transaksi"
            className="p-2 border rounded"
            value={formData.tanggal_transaksi}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="jatuh_tempo"
            className="p-2 border rounded"
            value={formData.jatuh_tempo}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="hari_pergantian"
            className="p-2 border rounded"
            value={formData.hari_pergantian}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="jatuh_tempo_pergantian"
            className="p-2 border rounded"
            value={formData.jatuh_tempo_pergantian}
            onChange={handleInputChange}
            required
          />
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
            (invoice) => invoice.nama_karyawan === employee.nama_karyawan
          );
          return (
            <div key={employee.id} className="mb-6 border rounded-lg p-4">
              <h4 className="text-xl font-semibold">{employee.nama_karyawan}</h4>
              <p className="text-gray-600">{employee.jabatan}</p>
              <p className="text-sm text-gray-500">
                Jumlah Faktur Ditangani: {employeeInvoices.length}
              </p>
              <div className="mt-4">
                <h5 className="text-lg font-medium mb-2">Faktur Ditangani</h5>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">No Faktur</th>
                      <th className="border p-2">Nama Toko</th>
                      <th className="border p-2">Judul Faktur</th>
                      <th className="border p-2">Tanggal Transaksi</th>
                      <th className="border p-2">Jatuh Tempo</th>
                      <th className="border p-2">Hari Penggantian</th>
                      <th className="border p-2">Jatuh Tempo Penggantian</th>
                      <th className="border p-2">Pengingat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="border p-2">{invoice.no_invoice}</td>
                        <td className="border p-2">{invoice.nama_outlet}</td>
                        <td className="border p-2">{invoice.subject || '-'}</td>
                        <td className="border p-2">{formatDate(invoice.tanggal_transaksi)}</td>
                        <td className="border p-2">{formatDate(invoice.jatuh_tempo)}</td>
                        <td className="border p-2">{formatDate(invoice.hari_pergantian)}</td>
                        <td className="border p-2">{formatDate(invoice.jatuh_tempo_pergantian)}</td>
                        <td className="border p-2">{getReminderStatus(invoice.jatuh_tempo)}</td>
                      </tr>
                    ))}
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
// fix with db
