import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { QrCode, GraduationCap } from "lucide-react";
import { QRScanner } from "../components/QRScanner";

const Index = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = (data: string) => {
    // Extract session ID and token from URL
    const urlMatch = data.match(/\/attend\/([^/]+)\/([^/]+)/);
    if (urlMatch) {
      const [, sessionId, token] = urlMatch;
      navigate(`/attend/${sessionId}/${token}`);
    } else {
      navigate("/");
    }
  };

  if (showScanner) {
    return <QRScanner onScanSuccess={handleQRScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-subtle">
      <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-glow animate-fade-in">
        <div className="space-y-2">
          <QrCode className="h-20 w-20 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">Attendance System</h1>
          <p className="text-muted-foreground">
            Scan QR code to mark your attendance
          </p>
        </div>

        <Button
          onClick={() => setShowScanner(true)}
          size="lg"
          className="w-full bg-gradient-primary text-lg py-6"
        >
          <QrCode className="mr-2 h-6 w-6" />
          Scan QR Code
        </Button>

        <div className="pt-4 border-t">
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            className="w-full"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Teacher Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
