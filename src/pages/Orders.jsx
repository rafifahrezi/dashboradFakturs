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
        <p>No data Faktur</p>
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
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="App" title="Manajemen Customer" />

      {/* Daftar Faktur */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Daftar Data Customer</h3>
        {outletList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outletList.map((outlet, index) => (
              <div
                key={index}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50"
              >
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{outlet.nama_outlet}</h4>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Sales:</span> {outlet.nama_karyawan}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Jumlah Faktur:</span> {outlet.jumlah_faktur}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">Tidak ada data faktur tersedia.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
