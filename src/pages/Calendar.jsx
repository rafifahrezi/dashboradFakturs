import React, { useEffect, useRef, useState } from 'react';
import { ScheduleComponent, ViewsDirective, ViewDirective, Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';

const Scheduler = () => {
  const scheduleRef = useRef(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const [fakturSnapshot, tokoSnapshot] = await Promise.all([
          getDocs(collection(db, 'faktur')),
          getDocs(collection(db, 'toko')),
        ]);

        const tokoMap = {};
        tokoSnapshot.forEach((doc) => {
          tokoMap[doc.id] = doc.data();
        });

        const eventData = fakturSnapshot.docs.map((doc) => {
          const data = doc.data();

          const tokoId = data.id_toko || data.toko_id;
          const tokoData = tokoMap[tokoId] || {};

          const startTime =
            data.jatuh_tempo_pergantian instanceof Timestamp
              ? data.jatuh_tempo_pergantian.toDate()
              : new Date();

          return {
            Id: doc.id,
            Subject: tokoData.nama_outlet || 'Faktur Tanpa Nama Outlet',
            StartTime: startTime,
            EndTime: startTime,
            IsAllDay: true,
            Location: data.no_invoice || 'Tidak Diketahui',
          };
        });

        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl min-h-[700px]">
      <Header category="App" title="Kalender Faktur" />
      <ScheduleComponent
        height="650px"
        ref={scheduleRef}
        selectedDate={new Date()}
        currentView="Month"
        eventSettings={{
          dataSource: events,
          allowEditing: false,
          allowAdding: false,
          allowDeleting: false,
        }}
      >
        <ViewsDirective>
          {['Day', 'Week', 'WorkWeek', 'Month', 'Agenda'].map((view) => (
            <ViewDirective key={view} option={view} />
          ))}
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
      </ScheduleComponent>
    </div>
  );
};

export default Scheduler;
