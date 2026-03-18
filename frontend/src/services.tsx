import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';
import { FiActivity, FiUsers, FiSmile, FiHeart, FiTarget, FiClock } from 'react-icons/fi';
import './services.css';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

interface ServicesProps {
  onServiceClick?: () => void;
}

function Services({ onServiceClick }: ServicesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const items = [
    {
      title: 'Consultation',
      desc: 'General medical consultation and health assessment.',
      schedule: 'Monday to Friday',
      icon: <FiActivity size={32} color="#319795" />
    },
    {
      title: 'Prenatal Check Up',
      desc: 'Regular check-ups for expectant mothers.',
      schedule: 'Tuesday and Thursday',
      icon: <FiHeart size={32} color="#D53F8C" />
    },
    {
      title: 'Vaccination (Bakuna)',
      desc: 'Immunization services for children and adults.',
      schedule: 'Wednesday and Friday',
      icon: <FiUsers size={32} color="#3182CE" />
    },
    {
      title: 'Dental Services',
      desc: 'Dental check-ups and treatments.',
      schedule: 'Monday, Wednesday & Friday',
      icon: <FiSmile size={32} color="#D69E2E" />
    },
    {
      title: 'Family Planning',
      desc: 'Reproductive health and family planning services.',
      schedule: 'Monday to Friday 1 PM',
      icon: <FiUsers size={32} color="#38A169" />
    },
    {
      title: 'Dots Center',
      desc: 'TB DOTS (Directly Observed Treatment, Short-course) services.',
      schedule: 'Monday to Friday 1 PM',
      icon: <FiActivity size={32} color="#E53E3E" />
    },
    {
      title: 'Cervical Screening',
      desc: 'Screening for cervical cancer prevention.',
      schedule: 'Monday 8 AM',
      icon: <FiTarget size={32} color="#805AD5" />
    },
    {
      title: 'Nutrition Counseling',
      desc: 'Guidance on healthy eating and nutrition.',
      schedule: 'Monday to Friday',
      icon: <FiHeart size={32} color="#DD6B20" />
    },
  ];

  const handleClick = (title: string) => {
    console.log(`Clicked service: ${title}`);
    if (onServiceClick) {
      onServiceClick();
    }
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
            <div className="service-schedule" style={{ fontSize: '0.9em', color: '#4fd1c5', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <FiClock size={14} /> {s.schedule}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Services;
