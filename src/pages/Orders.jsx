import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';

const Orders = () => {
  const [invoices, setInvoices] = useState([]);
  const fakturCollectionRef = collection(db, 'faktur');

  // Fetch invoices from Firestore
  useEffect(() => {
    const getInvoices = async () => {
      try {
        const data = await getDocs(fakturCollectionRef);
        const invoiceData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setInvoices(invoiceData);
      } catch (error) {
        error('Error fetching invoices from faktur:', error);
      }
    };

    getInvoices();
  }, [fakturCollectionRef]);

  // Group invoices by nama_outlet to calculate jumlah_faktur
  const groupedByOutlet = invoices.reduce((acc, invoice) => {
    const outlet = invoice.nama_outlet || 'Unknown Outlet';
    const sales = invoice.nama_karyawan || 'Unknown Sales';
    const key = `${outlet}-${sales}`; // Unique key for outlet and sales combo
    if (!acc[key]) {
      acc[key] = {
        nama_outlet: outlet,
        nama_karyawan: sales,
        jumlah_faktur: 0,
      };
    }
    acc[key].jumlah_faktur += 1;
    return acc;
  }, {});

  // Convert grouped object to array for rendering
  const outletList = Object.values(groupedByOutlet);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Manajemen Customer" />

      {/* Daftar Faktur */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Daftar Data Customer</h3>
        {outletList.length > 0 ? (
          outletList.map((outlet, index) => (
            <div key={index} className="mb-6 border rounded-lg p-4">
              <h4 className="text-xl font-semibold">{outlet.nama_outlet}</h4>
              <p className="text-gray-600">Sales: {outlet.nama_karyawan}</p>
              <p className="text-sm text-gray-500">Jumlah Faktur: {outlet.jumlah_faktur}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Tidak ada data faktur tersedia.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
