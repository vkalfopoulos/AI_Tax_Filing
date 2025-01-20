import React, { useState } from "react";
import './TaxForm.css';

const TaxForm = () => {
  const [formData, setFormData] = useState({
    taxType: "",
    incomeSource: "",
    deductions: "",
    receipts: null, // For file upload
  });

  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value, // Handle file uploads
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to send
    const formDataToSend = new FormData();
    formDataToSend.append("taxType", formData.taxType);
    formDataToSend.append("income", formData.incomeSource);
    formDataToSend.append("expenses", formData.deductions);
    if (formData.receipts) {
      formDataToSend.append("receipts", formData.receipts); // Attach file
    }

    try {
      const response = await fetch("http://localhost:5000/submit-tax-info", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit tax info");
      }

      const result = await response.json();
      setResponseMessage(result.advice);
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("An error occurred while submitting tax info.");
    }
  };

  return (
    <div className="form-container">
      <h2>Intelligent Tax Filing Form</h2>
      <form onSubmit={handleSubmit}>
        {/* Tax Type Dropdown */}
        <label htmlFor="taxType">Select Tax Type:</label>
        <select
          id="taxType"
          name="taxType"
          value={formData.taxType}
          onChange={handleChange}
        >
          <option value="" disabled>
            -- Select a Tax Type --
          </option>
          <option value="incomeTax">Income Tax</option>
          <option value="corporateTax">Corporate Tax</option>
          <option value="salesTax">Sales Tax/VAT</option>
          <option value="propertyTax">Property Tax</option>
          <option value="payrollTax">Payroll Tax</option>
          <option value="capitalGainsTax">Capital Gains Tax</option>
        </select>

        {/* Income Source */}
        <label htmlFor="incomeSource">Income Source:</label>
        <input
          type="text"
          id="incomeSource"
          name="incomeSource"
          placeholder="Enter your income amount"
          value={formData.incomeSource}
          onChange={handleChange}
          required
        />

        {/* Deductions */}
        <label htmlFor="deductions">Deductions:</label>
        <input
          type="text"
          id="deductions"
          name="deductions"
          placeholder="Enter your deductible expenses"
          value={formData.deductions}
          onChange={handleChange}
          required
        />

        {/* Receipts Upload */}
        <label htmlFor="receipts">Receipts for Deductible Expenses:</label>
        <input
          type="file"
          id="receipts"
          name="receipts"
          accept="image/*,application/pdf" // Accept images and PDFs
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
      </form>

      {responseMessage && (
        <div className="response-message">
          <h3>AI Advice:</h3>
          <p>{responseMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TaxForm;
