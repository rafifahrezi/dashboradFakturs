// import React from 'react';
// import { GridComponent, ColumnsDirective, ColumnDirective, Resize, Sort, ContextMenu, Filter, Page, ExcelExport, PdfExport, Edit, Inject } from '@syncfusion/ej2-react-grids';

// import { ordersData, contextMenuItems, ordersGrid } from '../data/dummy';
// import { Header } from '../components';

// const Orders = () => {
//   const editing = { allowDeleting: true, allowEditing: true };
//   return (
//     <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
//       <Header category="Page" title="Orders" />
//       <GridComponent
//         id="gridcomp"
//         dataSource={ordersData}
//         allowPaging
//         allowSorting
//         allowExcelExport
//         allowPdfExport
//         contextMenuItems={contextMenuItems}
//         editSettings={editing}
//       >
//         <ColumnsDirective>
//           {/* eslint-disable-next-line react/jsx-props-no-spreading */}
//           {ordersGrid.map((item, index) => <ColumnDirective key={index} {...item} />)}
//         </ColumnsDirective>
//         <Inject services={[Resize, Sort, ContextMenu, Filter, Page, ExcelExport, Edit, PdfExport]} />
//       </GridComponent>
//     </div>
//   );
// };
// export default Orders;

// (2)
// import React from 'react';
// import { GridComponent, ColumnsDirective, ColumnDirective, Resize, Sort, ContextMenu, Filter, Page, ExcelExport, PdfExport, Edit, Inject } from '@syncfusion/ej2-react-grids';

// import { ordersData, contextMenuItems, ordersGrid } from '../data/dummy';
// import { Header } from '../components';

// function Orders() {
//   try {
//     const [stores] = React.useState([
//       { id: 1, name: 'Toko Cabang A', location: 'Jakarta Pusat', manager: 'Budi Santoso', revenue: 'Rp 1.2M', status: 'Aktif' },
//       { id: 2, name: 'Toko Cabang B', location: 'Jakarta Selatan', manager: 'Siti Nurhaliza', revenue: 'Rp 980K', status: 'Aktif' },
//       { id: 3, name: 'Toko Cabang C', location: 'Jakarta Timur', manager: 'Ahmad Wijaya', revenue: 'Rp 1.1M', status: 'Maintenance' }
//     ]);

//     return (
//       <div data-name="toko" data-file="pages/Toko.js" className="fade-in">
//         <div className='m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl'>
//           <div className="mb-8 flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Toko</h1>
//               <p className="text-gray-600">Kelola semua cabang toko perusahaan</p>
//             </div>
//             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
//               <i className="fas fa-plus mr-2"></i>
//               Tambah Toko
//             </button>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Nama Toko
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Lokasi
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Manager
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Revenue
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
//                   {stores.map((store) => (
//                     <tr key={store.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="font-medium text-gray-900">{store.name}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {store.location}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {store.manager}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {store.revenue}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${store.status === 'Aktif'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                           {store.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button className="text-blue-600 hover:text-blue-900 mr-3">
//                           <i className="fas fa-edit"></i>
//                         </button>
//                         <button className="text-red-600 hover:text-red-900">
//                           <i className="fas fa-trash"></i>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         </div>
//     );
//   } catch (error) {
//     console.error('Toko component error:', error);
//     reportError(error);
//   }
// }

// export default Orders;

// (3 ) statis tapi FIX
// import React from 'react';
// import { Header } from '../components';

// const Orders = () => {
//   // Data statis untuk toko dan faktur
//   const stores = [
//     {
//       id: '1',
//       name: 'Toko ABC',
//       address: 'Jl. Sudirman No. 123, Jakarta',
//       invoices: [
//         {
//           id: '1-1',
//           subject: 'Faktur Pembelian Barang',
//           transactionDate: new Date(2025, 4, 20),
//           dueDate: new Date(2025, 4, 30),
//           replacementDate: new Date(2025, 5, 6),
//           replacementDueDate: new Date(2025, 5, 13)
//         },
//         {
//           id: '1-2',
//           subject: 'Faktur Restock',
//           transactionDate: new Date(2025, 4, 22),
//           dueDate: new Date(2025, 5, 1),
//           replacementDate: new Date(2025, 5, 8),
//           replacementDueDate: new Date(2025, 5, 15)
//         }
//       ]
//     },
//     {
//       id: '2',
//       name: 'Toko XYZ',
//       address: 'Jl. Thamrin No. 456, Jakarta',
//       invoices: [
//         {
//           id: '2-1',
//           subject: 'Faktur Pengiriman',
//           transactionDate: new Date(2025, 4, 25),
//           dueDate: new Date(2025, 5, 5),
//           replacementDate: new Date(2025, 5, 12),
//           replacementDueDate: new Date(2025, 5, 19)
//         }
//       ]
//     }
//   ];

//   // Format tanggal untuk tampilan
//   const formatDate = (date) => {
//     return date.toLocaleDateString('id-ID', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric'
//     });
//   };

//   // Cek pengingat (7 hari sebelum jatuh tempo)
//   const getReminderStatus = (dueDate) => {
//     const now = new Date('2025-05-28T20:57:00'); // Tanggal saat ini (27 Mei 2025, 20:57 WIB)
//     const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
//     return diffDays <= 7 && diffDays >= 0 ? `Pengingat: ${diffDays} hari lagi` : '';
//   };

//   return (
//     <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
//       <Header category="App" title="Daftar Toko (Preview Statis)" />

//       {/* Form Tambah Toko (Non-fungsional untuk preview) */}
//       <div className="mb-8">
//         <h3 className="text-lg font-bold mb-4">Tambah Toko Baru</h3>
//         <form className="flex flex-col gap-4">
//           <input
//             type="text"
//             placeholder="Nama Toko"
//             className="p-2 border rounded"
//             disabled
//           />
//           <input
//             type="text"
//             placeholder="Alamat Toko"
//             className="p-2 border rounded"
//             disabled
//           />
//           <input
//             type="text"
//             placeholder="Jumlah faktur"
//             className="p-2 border rounded"
//             disabled
//           />
//           <button
//             type="submit"
//             className="bg-blue-500 text-white p-2 rounded opacity-50 cursor-not-allowed"
//             disabled
//           >
//             Tambah Toko
//           </button>
//         </form>
//       </div>

//       {/* Daftar Toko */}
//       <div className="mb-8">
//         <h3 className="text-lg font-bold mb-4">Daftar Toko</h3>
//         {stores.map((store) => (
//           <div key={store.id} className="mb-6 border rounded-lg p-4">
//             <h4 className="text-xl font-semibold">{store.name}</h4>
//             <p className="text-gray-600">{store.address}</p>
//             <p className="text-sm text-gray-500">Jumlah Faktur: {store.invoices.length}</p>
//             <div className="mt-4">
//               <h5 className="text-lg font-medium mb-2">Faktur Terkait</h5>
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="border p-2">Judul Faktur</th>
//                     <th className="border p-2">Tanggal Transaksi</th>
//                     <th className="border p-2">Jatuh Tempo</th>
//                     <th className="border p-2">Hari Penggantian</th>
//                     <th className="border p-2">Jatuh Tempo Penggantian</th>
//                     <th className="border p-2">Pengingat</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {store.invoices.map((invoice) => (
//                     <tr key={invoice.id}>
//                       <td className="border p-2">{invoice.subject}</td>
//                       <td className="border p-2">{formatDate(invoice.transactionDate)}</td>
//                       <td className="border p-2">{formatDate(invoice.dueDate)}</td>
//                       <td className="border p-2">{formatDate(invoice.replacementDate)}</td>
//                       <td className="border p-2">{formatDate(invoice.replacementDueDate)}</td>
//                       <td className="border p-2">{getReminderStatus(invoice.dueDate)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Orders;

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';

const Orders = () => {
  const [stores, setStores] = useState([]);
  const [newStore, setNewStore] = useState({
    nama_toko: '',
    lokasi: '',
    manager: '',
    jumlah_faktur: 0,
    tanggal_transaksi: '',
    jatuh_tempo: '',
  });

  const tokoCollectionRef = collection(db, 'toko');

  // Ambil data toko dari Firestore
  const getStores = async () => {
    const data = await getDocs(tokoCollectionRef);
    setStores(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    getStores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStore((prev) => ({ ...prev, [name]: value }));
  };

  const addStore = async (e) => {
    e.preventDefault();

    const { nama_toko, lokasi, manager, jumlah_faktur, tanggal_transaksi, jatuh_tempo } = newStore;
    if (!nama_toko || !lokasi || !manager || !tanggal_transaksi || !jatuh_tempo) return;

    await addDoc(tokoCollectionRef, {
      nama_toko,
      lokasi,
      manager,
      jumlah_faktur: Number(jumlah_faktur),
      tanggal_transaksi: new Date(tanggal_transaksi),
      jatuh_tempo: new Date(jatuh_tempo),
      created_at: new Date(),
    });

    setNewStore({
      nama_toko: '',
      lokasi: '',
      manager: '',
      jumlah_faktur: 0,
      tanggal_transaksi: '',
      jatuh_tempo: '',
    });

    getStores();
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Manajemen Toko" />

      {/* Form Tambah Toko */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Tambah Toko Baru</h3>
        <form className="flex flex-col gap-4" onSubmit={addStore}>
          <input
            type="text"
            name="nama_toko"
            value={newStore.nama_toko}
            placeholder="Nama Toko"
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="lokasi"
            value={newStore.lokasi}
            placeholder="Alamat Toko"
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="manager"
            value={newStore.manager}
            placeholder="Manager"
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="number"
            name="jumlah_faktur"
            value={newStore.jumlah_faktur}
            placeholder="Jumlah Faktur"
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="date"
            name="tanggal_transaksi"
            value={newStore.tanggal_transaksi}
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="date"
            name="jatuh_tempo"
            value={newStore.jatuh_tempo}
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Tambah Toko
          </button>
        </form>
      </div>

      {/* Daftar Toko */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Daftar Toko</h3>
        {stores.map((store) => (
          <div key={store.id} className="mb-6 border rounded-lg p-4">
            <h4 className="text-xl font-semibold">{store.nama_toko}</h4>
            <p className="text-gray-600">{store.lokasi}</p>
            <p className="text-gray-600">Manager: {store.manager}</p>
            <p className="text-sm text-gray-500">Jumlah Faktur: {store.jumlah_faktur}</p>
            <p className="text-sm text-gray-500">
              Tanggal Transaksi: {store.tanggal_transaksi?.toDate?.().toLocaleDateString('id-ID') || '-'}
            </p>
            <p className="text-sm text-gray-500">
              Jatuh Tempo: {store.jatuh_tempo?.toDate?.().toLocaleDateString('id-ID') || '-'}
            </p>
            <p className="text-sm text-gray-400">
              Dibuat: {store.created_at?.toDate?.().toLocaleDateString('id-ID') || '-'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
