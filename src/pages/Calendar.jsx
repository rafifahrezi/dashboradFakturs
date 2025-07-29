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
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';

const PropertyPane = ({ children }) => <div className="mt-5">{children}</div>;

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
            : new Date('2025-07-27T15:00:00Z');

          return {
            Id: doc.id,
            Subject: data.no_invoice || 'Faktur Tanpa Nomor',
            StartTime: startTime,
            EndTime: startTime,
            IsAllDay: true,
            Location: data.kode_outlet || 'Tidak Diketahui',
          };
        });

        setEvents(eventData);
      } catch (error) {
        // Bisa juga gunakan error toast atau report tool
        // showErrorToast("Gagal mengambil data faktur");
        // console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  const handleDateChange = (args) => {
    if (scheduleRef.current) {
      const schedule = scheduleRef.current;
      schedule.selectedDate = args.value;
      schedule.dataBind();
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl min-h-[700px]">
      <Header category="App" title="Kalender Faktur" />
      <ScheduleComponent
        height="650px"
        ref={scheduleRef}
        selectedDate={new Date('2025-07-27T15:00:00Z')}
        eventSettings={{
          dataSource: events,
          allowEditing: true,
          allowAdding: true,
          allowDeleting: true,
        }}
      >
        <ViewsDirective>
          {['Day', 'Week', 'WorkWeek', 'Month', 'Agenda'].map((view) => (
            <ViewDirective key={view} option={view} />
          ))}
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
      </ScheduleComponent>

      <PropertyPane>
        <table style={{ width: '100%', background: 'white' }}>
          <tbody>
            <tr style={{ height: '50px' }}>
              <td style={{ width: '100%' }}>
                <DatePickerComponent
                  value={new Date('2025-07-27T15:00:00Z')}
                  showClearButton={false}
                  placeholder="Pilih Tanggal"
                  floatLabelType="Always"
                  change={handleDateChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </PropertyPane>
    </div>
  );
};

export default Scheduler;
