import React from 'react';
import './services.css';

function Services() {
  const items = [
    {
      title: 'General Check up',
      desc: 'A routine health exam to check overall well-being and detect health issues early.',
    },
    {
      title: 'Senior Citizen Health Check Up',
      desc: 'A health examination for elderly people to monitor age-related conditions and maintain health.',
    },
    {
      title: 'PWD Health Consultation',
      desc: 'A medical consultation for Persons With Disabilities to address their specific health needs.',
    },
    {
      title: 'Maternal Health Check Up',
      desc: 'A health check-up for pregnant women or mothers to ensure safe pregnancy and childbirth.',
    },
    {
      title: 'Basic Diagnostic Screening',
      desc: 'Simple tests (like blood pressure, blood sugar, urine) to detect common health problems.',
    },
    {
      title: 'Medicine Refill & Follow-up visit',
      desc: 'A visit to get prescription medicines refilled and to review treatment progress with a doctor.',
    },
  ];

  const handleClick = (title: string) => {
    alert(`You clicked on: ${title}`);
  };

  return (
    <section id="services" className="services">
      <div className="services-header">
        <div className="Services">
          <h2>Our Services</h2>
        </div>

        <p>
          We offer a full range of medical services designed to keep you and your family healthy.
        </p>
      </div>

      <div className="services-grid">
        {items.map((s) => (
          <div
            key={s.title}
            className="service-card"
            onClick={() => handleClick(s.title)}
            style={{ cursor: 'pointer' }}
          >
            <div className="service-icon">💙</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;
