import React, { useState } from 'react';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    idCard: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, idCard: file });

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('idCard', formData.idCard);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        alert('Registration submitted for admin approval.');
        setFormData({
          fullName: '',
          email: '',
          role: 'student',
          idCard: null,
        });
        setPreview(null);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="e.g. Akila Fernando"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">University Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="e.g. akila@student.kln.ac.lk"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>

          {/* ID Card Upload */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Upload University ID Card
            </label>
            <input
              type="file"
              name="idCard"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg bg-white"
            />
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="ID Preview"
                  className="w-full h-40 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
