"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User2, Loader2, AlertCircle, Power, RefreshCw } from "lucide-react";

const ControllerPanel = () => {
  const [cashiers, setCashiers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetch("/api/queue")
      .then((res) => res.json())
      .then((data) => {
        setCashiers(data.cashiers);
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
        setCashiers(data.cashiers);
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
      eventSource.close();
    };
  }, []);

  const nextNumber = async (cashierId) => {
    try {
      setError(null);
      setProcessingIds((prev) => new Set([...prev, cashierId]));

      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "next", cashierId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCashiers(data.cashiers);
    } catch (err) {
      setError("Failed to update queue");
      console.error(err);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cashierId);
        return newSet;
      });
    }
  };

  const toggleActive = async (cashierId, currentStatus) => {
    try {
      setError(null);
      setTogglingIds((prev) => new Set([...prev, cashierId]));

      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleActive",
          cashierId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCashiers(data.cashiers);
    } catch (err) {
      setError("Failed to update cashier status");
      console.error(err);
    } finally {
      setTogglingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cashierId);
        return newSet;
      });
    }
  };

  const resetSystem = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all counters? This will set all windows back to zero."
      )
    ) {
      return;
    }

    try {
      setError(null);
      setIsResetting(true);

      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCashiers(data.cashiers);
    } catch (err) {
      setError("Failed to reset queue system");
      console.error(err);
    } finally {
      setIsResetting(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Queue Management System
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Control all cashier windows from one place
          </p>
          <Button
            onClick={resetSystem}
            variant="outline"
            size="lg"
            className="mb-6"
            disabled={isResetting}
          >
            {isResetting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 mr-2" />
            )}
            Reset All Counters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cashiers.map((cashier) => (
            <Card
              key={cashier.id}
              className={`shadow-lg ${!cashier.isActive ? "opacity-75" : ""}`}
            >
              <CardHeader className="border-b bg-white text-center space-y-4 py-6">
                <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit">
                  <User2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {cashier.name}
                </h2>
                <div className="bg-blue-50 rounded-full px-4 py-1 w-fit mx-auto">
                  <p className="text-blue-600 text-sm">
                    {cashier.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Range: {cashier.rangeStart} - {cashier.rangeEnd}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-lg text-gray-500">Now Serving</p>
                    <p className="text-5xl font-bold text-blue-600 tracking-tight">
                      {cashier.currentNumber > 0
                        ? `${cashier.currentNumber}-${cashier.rangeEnd}`
                        : "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => nextNumber(cashier.id)}
                      size="lg"
                      className="h-12 text-lg relative overflow-hidden group"
                      disabled={
                        processingIds.has(cashier.id) || !cashier.isActive
                      }
                    >
                      {processingIds.has(cashier.id) ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          Next
                          <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform" />
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => toggleActive(cashier.id, cashier.isActive)}
                      size="lg"
                      variant={cashier.isActive ? "destructive" : "outline"}
                      className="h-12 text-lg"
                      disabled={togglingIds.has(cashier.id)}
                    >
                      {togglingIds.has(cashier.id) ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Power className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControllerPanel;
