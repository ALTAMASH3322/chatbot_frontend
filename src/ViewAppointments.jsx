// src/components/ViewAppointments.jsx
import React, { useState } from "react";
import axios from "axios";

const ViewAppointments = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:5000/view", {
        name,
        email,
        phone_number: phoneNumber,
      });

      if (response.data.appointments) {
        setAppointments(response.data.appointments);
        setError(null);
      } else {
        setError(response.data.response);
        setAppointments([]);
      }
    } catch (err) {
      setError("An error occurred while fetching appointments.");
      setAppointments([]);
    }
  };

  return (
    <div>
      <h1>View Appointments</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit">View Appointments</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {appointments.length > 0 && (
        <div>
          <h2>Your Appointments:</h2>
          <ul>
            {appointments.map((appointment, index) => (
              <li key={index}>
                <strong>Name:</strong> {appointment.name},{" "}
                <strong>Email:</strong> {appointment.email},{" "}
                <strong>Phone Number:</strong> {appointment.phone_number},{" "}
                <strong>Slot:</strong> {appointment.slot}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewAppointments;
