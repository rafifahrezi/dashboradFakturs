import React, { useEffect, useRef, useState } from 'react';
import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  Resize,
  DragAndDrop,
} from '@syncfusion/ej2-react-schedule';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';

const Scheduler = () => {
  const scheduleRef = useRef(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'faktur'));
        const eventData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const startTime = data.jatuh_tempo_pergantian instanceof Timestamp
            ? data.jatuh_tempo_pergantian.toDate()
            : new Date();

          return {
            Id: doc.id,
            Subject: data.nama_outlet || 'Faktur Tanpa Nomor',
            StartTime: startTime,
            EndTime: startTime,
            IsAllDay: true,
            Location: data.no_invoice || 'Tidak Diketahui',
          };
        });

        setEvents(eventData);
      } catch (error) {
        // console.error('Error fetching invoices:', error);
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
