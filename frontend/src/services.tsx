import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import './services.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const items = [
    {
      title: 'General Check up',
      desc: 'A routine health exam to check overall well-being and detect health issues early.',
      icon: '🩺'
    },
    {
      title: 'Senior Citizen Health Check Up',
      desc: 'A health examination for elderly people to monitor age-related conditions and maintain health.',
      icon: '👴'
    },
    {
      title: 'PWD Health Consultation',
      desc: 'A medical consultation for Persons With Disabilities to address their specific health needs.',
      icon: '♿'
    },
    {
      title: 'Maternal Health Check Up',
      desc: 'A health check-up for pregnant women or mothers to ensure safe pregnancy and childbirth.',
      icon: '🤰'
    },
    {
      title: 'Basic Diagnostic Screening',
      desc: 'Simple tests (like blood pressure, blood sugar, urine) to detect common health problems.',
      icon: '🔬'
    },
    {
      title: 'Medicine Refill & Follow-up visit',
      desc: 'A visit to get prescription medicines refilled and to review treatment progress with a doctor.',
      icon: '💊'
    },
  ];

  const handleClick = (title: string) => {
    // alert(`You clicked on: ${title}`);
  };

  return (
    <section id="services" className="services">
      <div className="services-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="Services"
        >
          <h2>Our Services</h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          We offer a full range of medical services designed to keep you and your family healthy.
        </motion.p>
      </div>

      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        className="services-grid"
      >
        {items.map((s) => (
          <motion.div
            key={s.title}
            className="service-card hover-float"
            variants={item}
            onClick={() => handleClick(s.title)}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 20px 30px rgba(0,0,0,0.1)",
              borderColor: "rgba(79, 209, 197, 0.5)"
            }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer' }}
          >
            <div className="service-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Services;
