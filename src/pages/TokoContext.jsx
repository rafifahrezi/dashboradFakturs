import React, { createContext, useContext } from 'react';

// Create context for Toko data
const TokoContext = createContext([]);

// Provider component
export const TokoProvider = ({ children }) => {
    // Static data for toko table
    const tokoData = [
        { id: 1, nama_toko: 'Toko Sukses' },
        { id: 2, nama_toko: 'Toko Makmur' },
        { id: 3, nama_toko: 'Toko Jaya' },
        { id: 4, nama_toko: 'Toko Sentosa' },
        { id: 5, nama_toko: 'Toko Abadi' },
    ];

    return (
        <TokoContext.Provider value={tokoData}>
            {children}
        </TokoContext.Provider>
    );
};

// Customers component consuming the context
const Customers = () => {
    // Consume the toko data from context
    const tokoList = useContext(TokoContext);

    return (
        <div>
            <h2>Daftar Toko</h2>
            <table border="1" cellPadding="8" cellSpacing="0" style={{ borderCollapse: 'collapse', width: '50%' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Toko</th>
                    </tr>
                </thead>
                <tbody>
                    {tokoList.map((toko) => (
                        <tr key={toko.id}>
                            <td>{toko.id}</td>
                            <td>{toko.nama_toko}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Customers;

/*
Usage:

In your app root or parent component:

import React from 'react';
import ReactDOM from 'react-dom';
import Customers, { TokoProvider } from './Customers';

ReactDOM.render(
  <TokoProvider>
    <Customers />
  </TokoProvider>,
  document.getElementById('root')
);

*/

