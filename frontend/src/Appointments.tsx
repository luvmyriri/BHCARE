import React, { useState, useEffect } from 'react';

interface Service {
    id: number;
    name: string;
    description: string;
    duration_minutes: number;
}

interface TimeSlot {
    time: string;
    display: string;
    available: boolean;
}

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    service_type: string;
    status: string;
    service_description?: string;
}

interface AppointmentsProps {
    user: any;
    onClose: () => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ user, onClose }) => {
    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [reason, setReason] = useState('');
    const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'book' | 'my-appointments'>('book');

    useEffect(() => {
        fetchServices();
        if (user) {
            fetchMyAppointments();
        }
    }, [user]);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/available-slots?date=${selectedDate}`);
            const data = await response.json();
            setAvailableSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const fetchMyAppointments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/user/${user.id}`);
            const data = await response.json();
            setMyAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedService || !selectedDate || !selectedTime) {
            alert('Please complete all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    service_type: selectedService.name,
                    reason: reason
                })
            });

            if (response.ok) {
                alert('Appointment booked successfully!');
                setStep(1);
                setSelectedService(null);
                setSelectedDate('');
                setSelectedTime('');
                setReason('');
                fetchMyAppointments();
                setView('my-appointments');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to book appointment');
            }
        } catch (error) {
            alert('Error booking appointment');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId: number) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Cancelled by patient' })
            });

            if (response.ok) {
                alert('Appointment cancelled successfully');
                fetchMyAppointments();
            }
        } catch (error) {
            alert('Error cancelling appointment');
        }
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-blue-100 text-blue-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="auth-card" style={{ maxWidth: '900px', width: '95%', padding: '30px', margin: '20px auto' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                    <span>←</span>
                    <span>Back</span>
                </button>
                <h2 className="text-3xl font-bold text-gray-900">Appointments</h2>
                <div className="w-20"></div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
                <button
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition ${view === 'book'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    onClick={() => setView('book')}
                >
                    Book Appointment
                </button>
                <button
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition ${view === 'my-appointments'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    onClick={() => setView('my-appointments')}
                >
                    My Appointments
                </button>
            </div>

            {view === 'book' ? (
                <div>
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center gap-4">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    1
                                </div>
                                <span className="text-xs mt-2 text-gray-600">Service</span>
                            </div>

                            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    2
                                </div>
                                <span className="text-xs mt-2 text-gray-600">Date & Time</span>
                            </div>

                            <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    3
                                </div>
                                <span className="text-xs mt-2 text-gray-600">Confirm</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Select Service */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-gray-900">Select a Service</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.map(service => (
                                    <div
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
                                        className={`p-6 rounded-xl border-2 cursor-pointer transition ${selectedService?.id === service.id
                                            ? 'border-primary bg-green-50'
                                            : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">🏥</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg text-gray-900">{service.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                <span className="inline-block mt-3 text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                                                    {service.duration_minutes} mins
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                disabled={!selectedService}
                                onClick={() => setStep(2)}
                                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Select Date & Time */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-gray-900">Choose Date & Time</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime('');
                                    }}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
                                    {availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                            {availableSlots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    className={`py-3 px-4 rounded-lg font-medium transition ${selectedTime === slot.time
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary'
                                                        }`}
                                                >
                                                    {slot.display}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No available slots for this date</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    ← Back
                                </button>
                                <button
                                    disabled={!selectedDate || !selectedTime}
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-gray-900">Confirm Appointment</h3>

                            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Service:</span>
                                    <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Time:</span>
                                    <span className="font-semibold text-gray-900">
                                        {availableSlots.find(s => s.time === selectedTime)?.display}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-semibold text-gray-900">{selectedService?.duration_minutes} minutes</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit (Optional)</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Describe your symptoms or reason for visit..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleBookAppointment}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition disabled:bg-gray-400"
                                >
                                    {loading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">My Appointments</h3>
                    {myAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {myAppointments.map(apt => (
                                <div key={apt.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900">{apt.service_type}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-6 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span>📅</span>
                                            <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>🕐</span>
                                            <span>{apt.appointment_time}</span>
                                        </div>
                                    </div>
                                    {apt.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelAppointment(apt.id)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Cancel Appointment
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No appointments yet</p>
                            <button
                                onClick={() => setView('book')}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition"
                            >
                                Book Your First Appointment
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Appointments;
