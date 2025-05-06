"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User2,
  Plus,
  Power,
  UserCheck,
  Hash,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function Admin() {
  const [cashiers, setCashiers] = useState([]);
  const [newCashierName, setNewCashierName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/queue");
      const data = await res.json();
      setCashiers(data.cashiers);
      setError(null);
    } catch (err) {
      setError("Failed to load cashiers");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addCashier = async () => {
    if (!newCashierName) return;
    setIsLoading(true);
    setError(null);
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addCashier", name: newCashierName }),
      });
      setNewCashierName("");
      setSuccessMessage(`Cashier "${newCashierName}" added successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchCashiers();
    } catch (err) {
      setError("Failed to add cashier");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCashierActive = async (cashierId, currentActiveState, name) => {
    setIsLoading(true);
    setError(null);
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleActive",
          cashierId,
          isActive: !currentActiveState,
        }),
      });
      setSuccessMessage(
        `Cashier "${name}" ${
          !currentActiveState ? "activated" : "deactivated"
        } successfully`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchCashiers();
    } catch (err) {
      setError("Failed to update cashier status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCashier = async (cashierId, name) => {
    if (!confirm(`Are you sure you want to remove cashier "${name}"?`)) return;

    setIsLoading(true);
    setError(null);
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "removeCashier",
          cashierId,
        }),
      });
      setSuccessMessage(`Cashier "${name}" removed successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchCashiers();
    } catch (err) {
      setError("Failed to remove cashier");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newCashierName) {
      addCashier();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-2">
            Queue Management System
          </h1>
          <p className="text-indigo-700">
            Streamline your customer service operations
          </p>
        </header>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 py-6 px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Admin Dashboard
                </h2>
                <p className="text-indigo-100 mt-1">
                  Manage cashiers and monitor queue status
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-indigo-100 text-sm">System Online</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Notification Area */}
            {(error || successMessage) && (
              <div
                className={`px-6 py-3 ${
                  error
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                } flex items-center`}
              >
                {error ? (
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                ) : (
                  <div className="w-5 h-5 mr-2 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <span>{error || successMessage}</span>
              </div>
            )}

            {/* Add Cashier Section */}
            <div className="p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add New Cashier
              </h3>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Input
                    value={newCashierName}
                    onChange={(e) => setNewCashierName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter cashier name"
                    className="pl-10 h-12 text-base bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <User2 className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
                <Button
                  onClick={addCashier}
                  disabled={isLoading || !newCashierName}
                  className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Cashier
                </Button>
              </div>
            </div>

            {/* Cashiers List */}
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Active Cashiers
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {cashiers.length} Total
                </span>
              </div>

              {cashiers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-600 mb-1">
                    No Cashiers Available
                  </h4>
                  <p className="text-gray-500">
                    Add your first cashier to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cashiers.map((cashier) => (
                    <Card
                      key={cashier.id}
                      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                        cashier.isActive
                          ? "border-l-4 border-l-green-500"
                          : "border-l-4 border-l-gray-300"
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                cashier.isActive
                                  ? "bg-green-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <UserCheck
                                className={`w-5 h-5 ${
                                  cashier.isActive
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {cashier.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                ID: {cashier.id}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cashier.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {cashier.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-3 py-3 border-t border-gray-100">
                          <div className="flex items-center mb-4">
                            <Hash className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Current Number
                              </p>
                              <p className="text-2xl font-bold text-indigo-600">
                                {cashier.currentNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              className={`flex-1 justify-center ${
                                cashier.isActive
                                  ? "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700"
                                  : "border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
                              }`}
                              onClick={() =>
                                toggleCashierActive(
                                  cashier.id,
                                  cashier.isActive,
                                  cashier.name
                                )
                              }
                              disabled={isLoading}
                            >
                              <Power className="w-4 h-4 mr-2" />
                              {cashier.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                              onClick={() =>
                                removeCashier(cashier.id, cashier.name)
                              }
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>
            © {new Date().getFullYear()} Queue Management System. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
