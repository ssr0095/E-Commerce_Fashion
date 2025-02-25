import { useState, useEffect } from "react";
import QRCode from "qrcode";

const QRCodeComponent = ({ upiId, amount, name }) => {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    // Generate UPI Payment URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      name
    )}&am=${amount}&cu=INR&tn=Payment`;

    // Generate QR Code and set as image source
    QRCode.toDataURL(upiUrl, { width: 175, errorCorrectionLevel: "H" })
      .then((url) => setQrSrc(url))
      .catch((err) => console.error(err));
  }, [upiId, amount, name]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {qrSrc && <img src={qrSrc} alt="QR Code" className="w-44 h-44" />}
      <p className="text-xl font-bold">Scan with any UPI app</p>
    </div>
  );
};

export default QRCodeComponent;
