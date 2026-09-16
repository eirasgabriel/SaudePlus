import React from 'react';

export default function ListaAgendamentos({ appointments = [] }) {
  if (!appointments || appointments.length === 0) {
    return <p>Nenhum agendamento encontrado.</p>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Suas Próximas Consultas</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map((item) => (
          <li 
            key={item.id} 
            style={{ 
              border: '1px solid #e3ecf8', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '12px',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#0066ff' }}>
              {item.specialty} - {item.clinic}
            </div>
            <div style={{ fontSize: '14px', color: '#1f2a44', marginTop: '4px' }}>
              <strong>Médico(a):</strong> {item.professional}
            </div>
            <div style={{ fontSize: '14px', color: '#667085', marginTop: '4px' }}>
              <strong>Data/Hora:</strong> {item.dateTime}
            </div>
            <div style={{ fontSize: '14px', color: '#667085', marginTop: '4px' }}>
              <strong>Local:</strong> {item.address}
            </div>
            <span 
              style={{ 
                display: 'inline-block',
                marginTop: '8px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: item.status === 'confirmada' ? '#e2f7eb' : '#fff4dc',
                color: item.status === 'confirmada' ? '#13a15c' : '#b7791f'
              }}
            >
              {item.status.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}