import MainLayout from '../layouts/MainLayout.jsx'
import Home from '../features/home/pages/Home.jsx'
import AvailabilityNotice from '../components/AvailabilityNotice/AvailabilityNotice.jsx'
import { useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Especialidades from '../features/profissionais/pages/Especialidades.jsx'
import Buscar from '../features/profissionais/pages/Buscar.jsx'
import ComoFunciona from '../features/institucional/pages/ComoFunciona.jsx'
import SobreNos from '../features/institucional/pages/SobreNos.jsx'
import Ajuda from '../features/ajuda/pages/Ajuda.jsx'
import RouteEffects from './RouteEffects.jsx'
import Button from '../components/Button/Button.jsx'
import styles from './App.module.css'

function App() {
  const location = useLocation()
  const noticeRef = useRef(null)
  const [notice, setNotice] = useState({ title: '', query: '' })

  function showUnavailable(title, query = '') {
    setNotice({ title, query })
    noticeRef.current.showModal()
  }

  return (
    <>
      <RouteEffects />
      <MainLayout onUnavailable={showUnavailable}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/especialidades" element={<Especialidades />} />
          <Route path="/buscar" element={<Buscar key={location.search} onUnavailable={showUnavailable} />} />
          <Route path="/como-funciona" element={<ComoFunciona onUnavailable={showUnavailable} />} />
          <Route path="/sobre-nos" element={<SobreNos onUnavailable={showUnavailable} />} />
          <Route path="/ajuda" element={<Ajuda onUnavailable={showUnavailable} />} />
          <Route path="*" element={
            <section className={styles.notFound}>
              <h1>Página não encontrada</h1>
              <p>O endereço pode ter mudado. Continue pela página inicial.</p>
              <Button to="/">Voltar ao início</Button>
            </section>
          } />
        </Routes>
      </MainLayout>
      <AvailabilityNotice ref={noticeRef} {...notice} />
    </>
  );
}

export default App;
