"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User2,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Settings,
  Users,
  Bell
} from "lucide-react";

export default function AdminPage() {
  const [cashiers, setCashiers] = useState([]);
  const [newCashierName, setNewCashierName] = useState("");
  const [newCashierType, setNewCashierType] = useState("regular");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState({});
  const [isRemoving, setIsRemoving] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const [rangeSize, setRangeSize] = useState(5);
  const [priorityRangeSize, setPriorityRangeSize] = useState(5);
  const [newRangeSize, setNewRangeSize] = useState("");
  const [newPriorityRangeSize, setNewPriorityRangeSize] = useState("");
  const [isSettingRange, setIsSettingRange] = useState(false);
  const [isSettingPriorityRange, setIsSettingPriorityRange] = useState(false);
  const [rangeMessage, setRangeMessage] = useState(null);
  const [priorityRangeMessage, setPriorityRangeMessage] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/queue");
      const data = await res.json();
      setCashiers(data.cashiers || []);
      setRangeSize(data.rangeSize || 5);
      setPriorityRangeSize(data.priorityRangeSize || 5);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCashier = async () => {
    if (!newCashierName.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addCashier",
          name: newCashierName,
          type: newCashierType,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccessMessage(`Cashier "${newCashierName}" added!`);
      setNewCashierName("");
      setNewCashierType("regular");
      fetchData();
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch {
      setError("Error adding cashier");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    setIsToggling((prev) => ({ ...prev, [id]: true }));
    setError(null);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleActive", cashierId: id, isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch {
      setError("Error toggling cashier");
    } finally {
      setIsToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveCashier = async (id, name) => {
    if (!window.confirm(`Remove cashier "${name}"?`)) return;
    setIsRemoving((prev) => ({ ...prev, [id]: true }));
    setError(null);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeCashier", cashierId: id }),
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch {
      setError("Error removing cashier");
    } finally {
      setIsRemoving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSetRangeSize = async () => {
    setIsSettingRange(true);
    setRangeMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setRangeSize", rangeSize: Number(newRangeSize) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set range size");
      setRangeMessage(`Range size set to ${data.rangeSize}`);
      setRangeSize(data.rangeSize);
      setNewRangeSize("");
      fetchData();
      setTimeout(() => setRangeMessage(null), 2000);
    } catch (err) {
      setRangeMessage(err.message);
    } finally {
      setIsSettingRange(false);
    }
  };

  const handleSetPriorityRangeSize = async () => {
    setIsSettingPriorityRange(true);
    setPriorityRangeMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setPriorityRangeSize", priorityRangeSize: Number(newPriorityRangeSize) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set priority range size");
      setPriorityRangeMessage(`Priority range size set to ${data.priorityRangeSize}`);
      setPriorityRangeSize(data.priorityRangeSize);
      setNewPriorityRangeSize("");
      fetchData();
      setTimeout(() => setPriorityRangeMessage(null), 2000);
    } catch (err) {
      setPriorityRangeMessage(err.message);
    } finally {
      setIsSettingPriorityRange(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-10">
      <Card className="max-w-6xl mx-auto shadow-xl border border-gray-100 rounded-3xl overflow-hidden">
        {/* Header with blue gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 animate-pulse" />
              <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            </div>
            <div className="bg-white/20 py-1 px-3 rounded-full text-sm font-medium backdrop-blur-sm">
              Queue Management System
            </div>
          </div>
        </div>

        <CardHeader className="bg-white px-8 py-6 border-b border-gray-100">
          {/* Notifications */}
          <div className="mb-6">
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 text-green-700 text-sm flex items-center gap-2 shadow-sm">
                <Bell className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Queue Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Range Setters */}
              <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-medium text-gray-700 mb-2">Regular Queue Range</h3>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min={1} 
                    className="w-24" 
                    value={newRangeSize} 
                    onChange={(e) => setNewRangeSize(e.target.value)} 
                    disabled={isSettingRange}
                    placeholder="New size" 
                  />
                  <Button 
                    onClick={handleSetRangeSize} 
                    disabled={isSettingRange || !newRangeSize}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSettingRange ? "Setting..." : "Update"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Current: <span className="font-bold text-blue-700">{rangeSize}</span>
                  </div>
                  {rangeMessage && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {rangeMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-medium text-gray-700 mb-2">Priority Queue Range</h3>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min={1} 
                    className="w-24" 
                    value={newPriorityRangeSize} 
                    onChange={(e) => setNewPriorityRangeSize(e.target.value)} 
                    disabled={isSettingPriorityRange}
                    placeholder="New size" 
                  />
                  <Button 
                    onClick={handleSetPriorityRangeSize} 
                    disabled={isSettingPriorityRange || !newPriorityRangeSize}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {isSettingPriorityRange ? "Setting..." : "Update"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Current: <span className="font-bold text-amber-700">{priorityRangeSize}</span>
                  </div>
                  {priorityRangeMessage && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {priorityRangeMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Add Cashier Section */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Add New Cashier
            </h2>
            
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Input 
                placeholder="Cashier name" 
                value={newCashierName} 
                onChange={(e) => setNewCashierName(e.target.value)} 
                className="w-64 shadow-sm" 
                disabled={isAdding}
              />
              <select 
                value={newCashierType} 
                onChange={(e) => setNewCashierType(e.target.value)} 
                className="border rounded-lg px-4 py-2 bg-white shadow-sm text-gray-700" 
                disabled={isAdding}
              >
                <option value="regular">Regular</option>
                <option value="priority">Priority</option>
              </select>
              <Button 
                onClick={handleAddCashier} 
                disabled={isAdding || !newCashierName.trim()} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-md"
              >
                <Plus className="w-5 h-5 mr-1" />
                {isAdding ? "Adding..." : "Add Cashier"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Cashier Management
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
              {cashiers.length} Total
            </span>
          </h2>
          
          {cashiers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p>No cashiers available. Add your first cashier to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashiers.map((cashier) => (
                <div 
                  key={cashier.id} 
                  className={`relative bg-white rounded-xl p-6 border transition-all duration-300 
                    ${cashier.isActive 
                      ? "border-l-4 border-l-green-500 border-gray-100 shadow-md hover:shadow-lg" 
                      : "border-l-4 border-l-red-400 border-gray-100 shadow-sm opacity-75"}`}
                >
                  {cashier.type === "priority" && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide">
                        Priority
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${cashier.isActive 
                      ? cashier.type === "priority" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600" 
                      : "bg-gray-100 text-gray-400"}`}>
                      <User2 className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-800">
                        {cashier.name}
                      </div>
                      <div className={`flex items-center mt-1 text-sm ${cashier.isActive ? "text-green-600" : "text-red-500"}`}>
                        {cashier.isActive ? (
                          <ToggleRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 mr-1" />
                        )}
                        {cashier.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-4">
                    <div className="text-sm text-gray-600">Current number</div>
                    <div className="text-xl font-bold text-gray-800">
                      {cashier.type === "priority" ? "P-" : ""}
                      {cashier.currentNumber}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Range: {cashier.rangeStart}-{cashier.rangeEnd}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleActive(cashier.id, cashier.isActive)} 
                      disabled={isToggling[cashier.id]}
                      className={`flex-1 ${cashier.isActive 
                        ? "border-red-200 text-red-600 hover:bg-red-50" 
                        : "border-green-200 text-green-600 hover:bg-green-50"}`}
                    >
                      {cashier.isActive ? (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-1" /> Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4 mr-1" /> Activate
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleRemoveCashier(cashier.id, cashier.name)} 
                      disabled={isRemoving[cashier.id]}
                      className="bg-white border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}