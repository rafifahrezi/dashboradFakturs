import React, { useState, useEffect } from 'react';
import { GridComponent, Inject, ColumnsDirective, ColumnDirective, Search, Page } from '@syncfusion/ej2-react-grids';
import { Header } from '../components';
import { db } from '../firebase/firebase'; // Pastikan path sesuai dengan struktur folder Anda
import { collection, onSnapshot } from 'firebase/firestore';

const Karyawan = () => {
    const [employeesData, setEmployeesData] = useState([]);

    // Ambil data dari Firestore secara real-time
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'karyawan'), (snapshot) => {
            const dataList = snapshot.docs.map((doc) => ({
                id: doc.id, // ID dokumen Firestore sebagai unique key
                karyawan_id: doc.data().karyawan_id || 'N/A',
                nama_karyawan: doc.data().nama_karyawan || 'N/A',
                jabatan: doc.data().jabatan || 'N/A',
            }));
            setEmployeesData(dataList);
        }, (error) => {
            console.error('Error fetching data: ', error);
        });

        // Cleanup subscription saat komponen unmount
        return () => unsubscribe();
    }, []);

    const toolbarOptions = ['Search'];

    const editing = { allowDeleting: true, allowEditing: true };

    // Definisikan kolom grid berdasarkan data dari Firestore
    const employeesGrid = [
        { field: 'id', headerText: 'ID', width: '100', textAlign: 'Center' },
        { field: 'karyawan_id', headerText: 'Karyawan ID', width: '150', textAlign: 'Left' },
        { field: 'nama_karyawan', headerText: 'Nama Karyawan', width: '150', textAlign: 'Left' },
        { field: 'jabatan', headerText: 'Jabatan', width: '150', textAlign: 'Left' },
    ];

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Karyawan" />
            <GridComponent
                dataSource={employeesData}
                width="auto"
                allowPaging
                allowSorting
                pageSettings={{ pageCount: 5 }}
                editSettings={editing}
                toolbar={toolbarOptions}
            >
                <ColumnsDirective>
                    {employeesGrid.map((item, index) => (
                        <ColumnDirective key={index} {...item} />
                    ))}
                </ColumnsDirective>
                <Inject services={[Search, Page]} />
            </GridComponent>
        </div>
    );
};

export default Karyawan;