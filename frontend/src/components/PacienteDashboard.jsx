import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import WelcomeHero from './components/WelcomeHero';
import QuickCards from './components/QuickCards';
import AppointmentList from './components/AppointmentList';
import SecurityBanner from './components/SecurityBanner';
import ScheduleCta from './components/ScheduleCta';
import QuickAccess from './components/QuickAccess';
import UnitInfo from './components/UnitInfo';

import { quickAccessItems, quickCards, sidebarItems, topNavItems } from './data/navigation';
import { mockAppointments, mockNotificationCount, mockPatient, mockUnit } from '../services/dadosficticios';
import styles from './PatientDashboard.module.css';

/** 
  Dashboard do Paciente — SaúdePlus
 
 Funciona sem props (usa os dados do protótipo). Na integração, passe os dados da API:
 <PatientDashboard patient={...} appointments={...} unit={...} notificationCount={3} />
 */
export default function PatientDashboard({
  patient = mockPatient,
  appointments = mockAppointments,
  unit = mockUnit,
  notificationCount = mockNotificationCount,
  heroImageSrc,
  onSchedule,
  onSearch,
  onNotifications,
  onProfile,
}) {
  return (
    <div className={styles.page}>
      <div className={styles.app}>
        <Topbar
          patient={patient}
          navItems={topNavItems}
          notificationCount={notificationCount}
          onSearch={onSearch}
          onNotifications={onNotifications}
          onProfile={onProfile}
        />

        <div className={styles.layout}>
          <Sidebar items={sidebarItems} />

          <main className={styles.main}>
            <WelcomeHero patientName={patient.name} imageSrc={heroImageSrc} />
            <QuickCards items={quickCards} />
            <AppointmentList appointments={appointments} />
            <SecurityBanner />
          </main>

          <aside className={styles.rightbar} aria-label="Ações e informações">
            <ScheduleCta onSchedule={onSchedule} className={styles.fullRow} />
            <QuickAccess items={quickAccessItems} />
            <UnitInfo unit={unit} />
          </aside>
        </div>
      </div>
    </div>
  );
}
