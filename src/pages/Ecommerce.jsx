import React, { useEffect, useState } from 'react';
import { FaStore, FaFileInvoice, FaClock, FaUsers } from 'react-icons/fa';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Ecommerce = () => {
  const [totalOutlets, setTotalOutlets] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalOverdueInvoices, setTotalOverdueInvoices] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    // Fetch faktur data
    const unsubscribeFaktur = onSnapshot(collection(db, 'faktur'), (snapshot) => {
      const fakturData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTotalInvoices(fakturData.length);
      const uniqueOutlets = new Set(fakturData.map((item) => item.nama_outlet)).size;
      setTotalOutlets(uniqueOutlets);
      const now = new Date();
      const overdue = fakturData.filter((item) => {
        if (!item.jatuh_tempo_pergantian || typeof item.jatuh_tempo_pergantian.toDate !== 'function') return false;
        return item.jatuh_tempo_pergantian.toDate() < now;
      }).length;
      setTotalOverdueInvoices(overdue);
    });

    // Fetch karyawan data
    const unsubscribeKaryawan = onSnapshot(collection(db, 'karyawan'), (snapshot) => {
      setTotalEmployees(snapshot.docs.length);
    });

    return () => {
      unsubscribeFaktur();
      unsubscribeKaryawan();
    };
  }, []);

  return (
    <div className="mt-24">

      <div className="flex m-3 flex-wrap justify-center gap-4 items-center">
        {/* Total Outlets */}
        <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex justify-center items-center">
            <FaStore className="text-4xl text-blue-500" />
          </div>
          <p className="text-2xl text-center mt-4 font-semibold">{totalOutlets}</p>
          <p className="text-sm text-center text-gray-400 mt-1">Total Outlets</p>
        </div>

        {/* Total Invoices */}
        <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex justify-center items-center">
            <FaFileInvoice className="text-4xl text-green-500" />
          </div>
          <p className="text-2xl text-center mt-4 font-semibold">{totalInvoices}</p>
          <p className="text-sm text-center text-gray-400 mt-1">Total Invoices</p>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex justify-center items-center">
            <FaClock className="text-4xl text-red-500" />
          </div>
          <p className="text-2xl text-center mt-4 font-semibold">{totalOverdueInvoices}</p>
          <p className="text-sm text-center text-gray-400 mt-1">Overdue Invoices</p>
        </div>

        {/* Total Employees */}
        <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex justify-center items-center">
            <FaUsers className="text-4xl text-purple-500" />
          </div>
          <p className="text-2xl text-center mt-4 font-semibold">{totalEmployees}</p>
          <p className="text-sm text-center text-gray-400 mt-1">Total Sales</p>
        </div>
      </div>
    </div>
  );
};

export default Ecommerce;
