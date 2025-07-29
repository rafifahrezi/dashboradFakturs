import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';

const Orders = () => {
  const [stores, setStores] = useState([]);
  const [newStore, setNewStore] = useState({
    namaToko: '',
    lokasi: '',
    manager: '',
    jumlahFaktur: 0,
    tanggalTransaksi: '',
    jatuhTempo: '',
  });

  const tokoCollectionRef = collection(db, 'toko');

  // Ambil data toko dari Firestore
  useEffect(() => {
    const getStores = async () => {
      const data = await getDocs(tokoCollectionRef);
      setStores(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getStores();
  }, [tokoCollectionRef]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStore((prev) => ({ ...prev, [name]: value }));
  };

  const addStore = async (e) => {
    e.preventDefault();

    const {
      namaToko,
      lokasi,
      manager,
      jumlahFaktur,
      tanggalTransaksi,
      jatuhTempo,
    } = newStore;

    if (!namaToko || !lokasi || !manager || !tanggalTransaksi || !jatuhTempo) return;

    await addDoc(tokoCollectionRef, {
      nama_toko: namaToko,
      lokasi,
      manager,
      jumlah_faktur: Number(jumlahFaktur),
      tanggal_transaksi: new Date(tanggalTransaksi),
      jatuh_tempo: new Date(jatuhTempo),
      created_at: new Date(),
    });

    setNewStore({
      namaToko: '',
      lokasi: '',
      manager: '',
      jumlahFaktur: 0,
      tanggalTransaksi: '',
      jatuhTempo: '',
    });
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
            name="namaToko"
            value={newStore.namaToko}
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
            name="jumlahFaktur"
            value={newStore.jumlahFaktur}
            placeholder="Jumlah Faktur"
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="date"
            name="tanggalTransaksi"
            value={newStore.tanggalTransaksi}
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="date"
            name="jatuhTempo"
            value={newStore.jatuhTempo}
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
        {stores.map((store) => {
          const {
            id,
            lokasi,
            manager,
            nama_toko: namaToko,
            jumlah_faktur: jumlahFaktur,
            tanggal_transaksi: tanggalTransaksi,
            jatuh_tempo: jatuhTempo,
            created_at: createdAt,
          } = store;

          return (
            <div key={id} className="mb-6 border rounded-lg p-4">
              <h4 className="text-xl font-semibold">{namaToko}</h4>
              <p className="text-gray-600">{lokasi}</p>
              <p className="text-gray-600">Manager: {manager}</p>
              <p className="text-sm text-gray-500">Jumlah Faktur: {jumlahFaktur}</p>
              <p className="text-sm text-gray-500">
                Tanggal Transaksi:{' '}
                {tanggalTransaksi?.toDate?.().toLocaleDateString('id-ID') || '-'}
              </p>
              <p className="text-sm text-gray-500">
                Jatuh Tempo:{' '}
                {jatuhTempo?.toDate?.().toLocaleDateString('id-ID') || '-'}
              </p>
              <p className="text-sm text-gray-400">
                Dibuat:{' '}
                {createdAt?.toDate?.().toLocaleDateString('id-ID') || '-'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
