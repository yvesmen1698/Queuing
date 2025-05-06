"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User2, Loader2, AlertCircle } from "lucide-react";

export default function CashierPage() {
  const params = useParams();
  const id = params.id;
  const [cashierData, setCashierData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch("/api/queue")
      .then((res) => res.json())
      .then((data) => {
        const cashier = data.cashiers.find((c) => c.id === parseInt(id));
        if (cashier) {
          setCashierData(cashier);
        } else {
          setError("Cashier not found");
        }
      })
      .catch((err) => {
        setError("Failed to load initial data");
        console.error(err);
      })
      .finally(() => setIsLoading(false));

    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      console.log("SSE connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const cashier = data.cashiers.find((c) => c.id === parseInt(id));
        if (cashier) {
          setCashierData(cashier);
        } else {
          setError("Cashier not found");
        }
      } catch (err) {
        setError("Error processing update");
        console.error(err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Connection error - trying to reconnect...");
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [id]);

  const nextNumber = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "next", cashierId: parseInt(id) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const cashier = data.cashiers.find((c) => c.id === parseInt(id));
      if (cashier) {
        setCashierData(cashier);
      }
    } catch (err) {
      setError("Failed to update queue");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-xl text-gray-600">Loading cashier data...</p>
        </div>
      </div>
    );
  }

  if (!cashierData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-xl text-gray-600">Cashier not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="border-b bg-white text-center space-y-4 py-8">
          <div className="mx-auto bg-blue-100 rounded-full p-4 w-fit">
            <User2 className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">
            {cashierData.name}
          </h1>
          <div className="bg-blue-50 rounded-full px-4 py-2 w-fit mx-auto">
            <p className="text-blue-600">Counter Control Panel</p>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-xl text-gray-500">Current Number</p>
              <p className="text-7xl font-bold text-blue-600 tracking-tight">
                {cashierData.currentNumber}
              </p>
            </div>

            <Button
              onClick={nextNumber}
              size="lg"
              className="min-w-[240px] h-16 text-xl relative overflow-hidden group"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Next Customer
                  <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
