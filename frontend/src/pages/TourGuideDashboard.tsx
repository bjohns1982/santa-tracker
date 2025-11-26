import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { io } from "socket.io-client";
import DraggableFamilyList from "../components/Shared/DraggableFamilyList";
import CityAutocomplete from "../components/Shared/CityAutocomplete";
import FamilyDetailsModal from "../components/Shared/FamilyDetailsModal";
import { US_STATES } from "../data/usStates";

interface Tour {
  id: string;
  name: string;
  inviteCode: string;
  city: string;
  state: string;
  zipCode: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  families: Family[];
  startedAt?: string;
}

interface Family {
  id: string;
  streetNumber: string;
  streetName: string;
  familyName: string;
  latitude?: number | null;
  longitude?: number | null;
  order: number;
  children: Array<{
    id: string;
    firstName: string;
    specialInstructions?: string | null;
  }>;
}

export default function TourGuideDashboard() {
  const { tourGuide, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [newTourName, setNewTourName] = useState("");
  const [newTourCity, setNewTourCity] = useState("");
  const [newTourState, setNewTourState] = useState("");
  const [newTourZip, setNewTourZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentVisit, setCurrentVisit] = useState<any>(null);
  const [nextVisit, setNextVisit] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    void loadTours();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (selectedTour) {
      const newSocket = io("http://localhost:3001");
      newSocket.emit("join-tour", selectedTour.id);

      newSocket.on("visit-updated", () => {
        loadCurrentVisit();
      });

      newSocket.on("visit-requeued", () => {
        loadCurrentVisit();
      });

      const syncSelectedTour = (updatedTours: typeof tours) => {
        if (!selectedTour) return;
        const updated = updatedTours.find((t) => t.id === selectedTour.id);
        if (updated) {
          setSelectedTour(updated);
        }
      };

      newSocket.on("families-reordered", async () => {
        const updatedTours = await loadTours();
        syncSelectedTour(updatedTours);
      });

      newSocket.on("family-added", async () => {
        const updatedTours = await loadTours();
        syncSelectedTour(updatedTours);
      });

      newSocket.on("family-updated", async () => {
        const updatedTours = await loadTours();
        syncSelectedTour(updatedTours);
      });

      newSocket.on("family-removed", async () => {
        const updatedTours = await loadTours();
        syncSelectedTour(updatedTours);
      });

      if (selectedTour.status === "ACTIVE") {
        loadCurrentVisit();
        startLocationTracking();
      }

      return () => {
        newSocket.disconnect();
      };
    }
  }, [selectedTour?.id, selectedTour?.status]);

  const loadTours = async () => {
    try {
      const data = await api.getTours();
      setTours(data);
      return data;
    } catch (error) {
      console.error("Failed to load tours:", error);
      return [];
    }
  };

  const loadCurrentVisit = async () => {
    if (!selectedTour) return;
    try {
      const data = await api.getCurrentVisit(selectedTour.id);
      setCurrentVisit(data.currentVisit);
      setNextVisit(data.nextVisit);
      setVisits(data.visits || []);
    } catch (error) {
      console.error("Failed to load current visit:", error);
    }
  };

  const startLocationTracking = () => {
    if (!selectedTour) return;

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          api.updateSantaLocation(
            selectedTour!.id,
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error("Location error:", error);
        },
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newTourName.trim()) {
      alert("Please enter a tour name");
      return;
    }
    if (!newTourCity.trim()) {
      alert("Please enter a city");
      return;
    }
    if (!newTourState.trim()) {
      alert("Please select a state");
      return;
    }
    if (!newTourZip.trim()) {
      alert("Please enter a zip code");
      return;
    }

    // Validate zip code format (5 digits)
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(newTourZip)) {
      alert("Zip code must be exactly 5 digits");
      return;
    }

    setLoading(true);
    try {
      await api.createTour(newTourName, newTourCity, newTourState, newTourZip);
      setNewTourName("");
      setNewTourCity("");
      setNewTourState("");
      setNewTourZip("");
      loadTours();
    } catch (error: any) {
      alert(error.message || "Failed to create tour");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTour = async () => {
    if (!selectedTour) return;
    if (selectedTour.families.length === 0) {
      alert("Please add at least one family before starting the tour.");
      return;
    }
    if (
      !confirm(
        "Start the tour? This will begin tracking Santa's location and create visit records for all families."
      )
    )
      return;

    setLoading(true);
    try {
      // Start the tour (creates visit records)
      await api.startTour(selectedTour.id);
      // Update tour status to ACTIVE
      await api.updateTourStatus(selectedTour.id, "ACTIVE");
      // Reload tours to get updated data
      const updatedTours = await loadTours();
      const updated = updatedTours.find((t) => t.id === selectedTour.id);
      if (updated) {
        setSelectedTour(updated);
      }
      // Reload current visit status
      await loadCurrentVisit();
      alert("Tour started! Santa is now on the move! 🎅");
    } catch (error: any) {
      alert(error.message || "Failed to start tour");
    } finally {
      setLoading(false);
    }
  };

  const handleStopTour = async () => {
    if (!selectedTour) return;
    if (
      !confirm(
        "Stop the tour? This will pause tracking and allow you to reorganize the roster. You can restart it later."
      )
    )
      return;

    setLoading(true);
    try {
      await api.updateTourStatus(selectedTour.id, "PLANNED");
      const updatedTours = await loadTours();
      const updated = updatedTours.find((t) => t.id === selectedTour.id);
      if (updated) {
        setSelectedTour(updated);
      }
      setCurrentVisit(null);
      setNextVisit(null);
      alert(
        "Tour stopped. You can now reorganize the roster and restart when ready."
      );
    } catch (error: any) {
      alert(error.message || "Failed to stop tour");
    } finally {
      setLoading(false);
    }
  };

  const handleArrive = async () => {
    if (!currentVisit) return;
    try {
      await api.updateVisitStatus(currentVisit.id, "VISITING");
      loadCurrentVisit();
    } catch (error: any) {
      alert(error.message || "Failed to update visit");
    }
  };

  const handleCompleteVisit = async () => {
    if (!currentVisit) return;
    try {
      await api.updateVisitStatus(currentVisit.id, "COMPLETED");
      loadCurrentVisit();
    } catch (error: any) {
      alert(error.message || "Failed to complete visit");
    }
  };

  const handleRequeueVisit = async (visitId: string) => {
    try {
      await api.requeueVisit(visitId);
      await loadCurrentVisit();
      await loadTours();
    } catch (error: any) {
      alert(error.message || "Failed to add family back to roster");
    }
  };

  const handleReorder = async (
    newOrder: { familyId: string; order: number }[]
  ) => {
    if (!selectedTour) return;
    try {
      await api.updateFamilyOrder(selectedTour.id, newOrder);
      // Reload tours to get updated family data
      const updatedTours = await loadTours();
      const updated = updatedTours.find((t) => t.id === selectedTour.id);
      if (updated) setSelectedTour(updated);
      // If tour is active, reload visits to get updated order
      if (selectedTour.status === "ACTIVE") {
        await loadCurrentVisit();
      }
    } catch (error: any) {
      alert(error.message || "Failed to reorder families");
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/signup/${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  };

  const shareInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/signup/${inviteCode}`;
    if (navigator.share) {
      navigator.share({ title: "Santa Tracker Invite", url: link });
    } else {
      copyInviteLink(inviteCode);
    }
  };

  const handleDeleteTour = async (tourId: string, tourName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${tourName}"? This will permanently delete the tour and all associated families. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.deleteTour(tourId);
      loadTours();
      if (selectedTour?.id === tourId) {
        setSelectedTour(null);
      }
      alert("Tour deleted successfully");
    } catch (error: any) {
      alert(error.message || "Failed to delete tour");
    }
  };

  if (!isAuthenticated) return null;

  const completedVisits = visits
    .filter((visit) => visit.status === "COMPLETED")
    .sort((a, b) =>
      a.completedAt && b.completedAt
        ? new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        : a.order - b.order
    );

  const activeVisits = visits
    .filter((visit) => visit.status !== "COMPLETED")
    .sort((a, b) => a.order - b.order);

  const activeFamilies =
    selectedTour?.status === "ACTIVE"
      ? activeVisits.map((visit) => ({
          ...visit.family,
          order: visit.order,
        }))
      : selectedTour?.families || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            🎅 Santa Tracker Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
            <span className="text-white text-md sm:text-base text-center sm:text-left font-bold">
              Welcome, {tourGuide?.name}!
            </span>
          </div>
        </div>

        {/* Create New Tour */}
        <div className="card mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-holiday-red mb-4">
            Create New Tour
          </h2>
          <form onSubmit={handleCreateTour} className="space-y-4">
            <div>
              <input
                type="text"
                value={newTourName}
                onChange={(e) => setNewTourName(e.target.value)}
                placeholder="Tour name (e.g., 'Maple Street 2024')"
                className="input-field"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  City
                </label>
                <CityAutocomplete
                  value={newTourCity}
                  onChange={setNewTourCity}
                  state={newTourState}
                  placeholder="Enter city name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  State
                </label>
                <select
                  value={newTourState}
                  onChange={(e) => setNewTourState(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label} ({state.value})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={newTourZip}
                  onChange={(e) => {
                    // Only allow digits and limit to 5 characters
                    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setNewTourZip(value);
                  }}
                  placeholder="12345"
                  className="input-field"
                  required
                  maxLength={5}
                  pattern="\d{5}"
                  title="Zip code must be exactly 5 digits"
                />
                {newTourZip && newTourZip.length !== 5 && (
                  <p className="text-xs text-red-600 mt-1">
                    Zip code must be 5 digits
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Creating..." : "Create Tour"}
            </button>
          </form>
        </div>

        {/* Tours List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tours Sidebar */}
          <div className="card">
            <h2 className="text-xl sm:text-2xl font-bold text-holiday-red mb-4">
              Your Tours
            </h2>
            <div className="space-y-2">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    selectedTour?.id === tour.id
                      ? "border-holiday-red bg-red-50"
                      : "border-gray-200 hover:border-holiday-gold"
                  }`}
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setSelectedTour(tour)}
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{tour.name}</h3>
                      <p className="text-sm text-gray-600">
                        {tour.families.length} families • {tour.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {tour.inviteCode}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTour(tour.id, tour.name);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Delete tour"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Tour Details */}
          {selectedTour && (
            <div className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-holiday-red break-words">
                    {selectedTour.name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 break-all">
                    Invite Code: {selectedTour.inviteCode}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => copyInviteLink(selectedTour.inviteCode)}
                    className="btn-secondary text-sm flex-1 sm:flex-none"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => shareInviteLink(selectedTour.inviteCode)}
                    className="btn-secondary text-sm flex-1 sm:flex-none"
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* Tour Status and Start Button */}
              <div className="mb-4">
                {selectedTour.status === "PLANNED" && (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                    <p className="font-semibold text-yellow-800 mb-3">
                      Tour is ready to start! Organize your route below, then
                      click Start Tour.
                    </p>
                    <button
                      onClick={handleStartTour}
                      disabled={loading}
                      className="btn-primary w-full text-lg py-4 disabled:opacity-50"
                    >
                      {loading ? "Starting..." : "🎅 Start Tour Now"}
                    </button>
                  </div>
                )}
                {selectedTour.status === "ACTIVE" && (
                  <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                      <p className="font-semibold text-green-800 text-sm sm:text-base">
                        ✅ Tour is ACTIVE - Santa is on the move!
                      </p>
                      <button
                        onClick={handleStopTour}
                        disabled={loading}
                        className="btn-secondary text-sm w-full sm:w-auto"
                      >
                        {loading ? "Stopping..." : "Stop Tour"}
                      </button>
                    </div>
                    {!currentVisit && (
                      <div>
                        <p className="text-sm text-green-700 mb-2">
                          No active visit found. The tour may need to be
                          restarted.
                        </p>
                        <button
                          onClick={handleStartTour}
                          disabled={loading}
                          className="btn-secondary text-sm"
                        >
                          {loading ? "Restarting..." : "Restart Tour"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedTour.status === "ACTIVE" && currentVisit && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <h3 className="font-bold text-base sm:text-lg mb-2">
                    Current Visit
                  </h3>
                  <p className="text-base sm:text-lg">
                    <strong>{currentVisit.family.familyName}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentVisit.family.streetNumber}{" "}
                    {currentVisit.family.streetName}
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    {currentVisit.status === "ON_WAY" && (
                      <button
                        onClick={handleArrive}
                        className="btn-secondary text-sm w-full sm:w-auto"
                      >
                        Arrive
                      </button>
                    )}
                    {currentVisit.status === "VISITING" && (
                      <button
                        onClick={handleCompleteVisit}
                        className="btn-primary text-sm w-full sm:w-auto"
                      >
                        Complete Visit
                      </button>
                    )}
                  </div>
                  {nextVisit && (
                    <p className="mt-2 text-sm">
                      Next: {nextVisit.family.familyName}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <h3 className="font-bold text-base sm:text-lg">
                  Families ({activeFamilies.length})
                  {activeFamilies.length > 0 && (
                    <span className="ml-2 text-xs sm:text-sm font-normal text-gray-600">
                      ({activeFamilies.length}{" "}
                      {activeFamilies.length === 1 ? "family" : "families"} on
                      roster)
                    </span>
                  )}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full whitespace-nowrap">
                  ✨ Drag to reorder
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <DraggableFamilyList
                  families={activeFamilies}
                  onReorder={handleReorder}
                  onFamilyClick={setSelectedFamily}
                />
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Tip:</strong> Grab the hamburger icon (☰) on the
                    left to drag and reorder. Click on a family name to view
                    children's special instructions. Changes save automatically
                    and update in real-time for all users!
                  </p>
                </div>
              </div>
              {selectedTour.status === "ACTIVE" &&
                completedVisits.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3">
                      Completed Visits ({completedVisits.length})
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {completedVisits.map((visit) => (
                        <div
                          key={visit.id}
                          className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50 flex flex-col gap-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-700">
                                The {visit.family.familyName} Family
                              </p>
                              <p className="text-sm text-gray-500">
                                {visit.family.streetNumber}{" "}
                                {visit.family.streetName}
                              </p>
                            </div>
                            <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                              Completed
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Kids:{" "}
                            {visit.family.children
                              .map((c: any) => c.firstName)
                              .join(", ")}
                          </p>
                          <button
                            onClick={() => handleRequeueVisit(visit.id)}
                            className="btn-secondary text-sm self-start"
                          >
                            Add Back to Roster
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          <button
            onClick={logout}
            className="btn-secondary text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Family Details Modal */}
      <FamilyDetailsModal
        family={selectedFamily}
        onClose={() => setSelectedFamily(null)}
      />
    </div>
  );
}
