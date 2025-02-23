import React from "react";
import { QRCodeCanvas } from "qrcode.react"; // Import QRCodeCanvas from qrcode.react

const QRCode = ({ upiId, amount, name }) => {
  // Generate UPI Payment URL
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    name
  )}&am=${amount}&cu=INR&tn=Payment`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCodeCanvas value={upiUrl} size={175} level="H" bank="Canara bank" />{" "}
      {/* High error correction level */}
      <p className="text-xl font-bold">Scan with any UPI app</p>
    </div>
  );
};

export default QRCode;
