import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import SantaMap from '../components/Map/SantaMap';
import FamilyEditModal from '../components/FamilyEditModal';

interface Family {
  id: string;
  familyName: string;
  streetNumber: string;
  streetName: string;
  latitude?: number | null;
  longitude?: number | null;
  children: Array<{ firstName: string; specialInstructions?: string }>;
  tour: {
    id: string;
    name: string;
    status: string;
    startedAt?: string;
  };
}

interface Visit {
  id: string;
  status: string;
  order: number;
  family: Family;
}

interface JokeOrRiddle {
  id: string;
  type: 'joke' | 'riddle';
  content: string;
  answer?: string;
}

export default function FamilyView() {
  const { familyId } = useParams<{ familyId: string }>();
  const [family, setFamily] = useState<Family | null>(null);
  const [santaLocation, setSantaLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [currentJoke, setCurrentJoke] = useState<JokeOrRiddle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingFamily, setIsSavingFamily] = useState(false);

  const myVisit = family ? visits.find((v) => v.family.id === family.id) || null : null;

  const activeVisits = visits
    .filter((visit) => visit.status !== 'COMPLETED' && visit.status !== 'SKIPPED')
    .sort((a, b) => a.order - b.order);

  const completedVisits = visits
    .filter((visit) => visit.status === 'COMPLETED')
    .sort((a, b) =>
      a.completedAt && b.completedAt
        ? new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        : a.order - b.order,
    );

  const activePositionMap = new Map<string, number>();
  activeVisits.forEach((visit, index) => {
    activePositionMap.set(visit.id, index + 1);
  });

  useEffect(() => {
    if (!familyId) return;
    loadFamily();
    // Store familyId in localStorage for easy return
    localStorage.setItem('lastFamilyId', familyId);
  }, [familyId]);

  useEffect(() => {
    if (family?.tour.id) {
      const newSocket = io('http://localhost:3001');
      newSocket.emit('join-tour', family.tour.id);

      newSocket.on('santa-location', (data: { latitude: number; longitude: number }) => {
        setSantaLocation({ lat: data.latitude, lng: data.longitude });
      });

      newSocket.on('visit-updated', () => {
        loadCurrentVisit();
      });

      newSocket.on('tour-started', () => {
        loadCurrentVisit();
      });

      newSocket.on('families-reordered', () => {
        loadCurrentVisit(); // Reload to get updated order
      });

      newSocket.on('family-added', () => {
        loadCurrentVisit(); // Reload when a new family is added
      });

      newSocket.on('family-updated', () => {
        loadCurrentVisit(); // Reload when a family is updated
      });

      loadCurrentVisit();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [family?.tour.id]);

  useEffect(() => {
    // Rotate jokes every 30 seconds
    const jokeInterval = setInterval(() => {
      loadJoke();
    }, 30000);

    loadJoke();

    return () => clearInterval(jokeInterval);
  }, []);

  const loadFamily = async () => {
    try {
      const data = await api.getFamily(familyId!);
      setFamily(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load family:', error);
      setLoading(false);
    }
  };

  const handleSaveFamily = async (data: {
    streetNumber: string;
    streetName: string;
    familyName: string;
    children: { firstName: string; specialInstructions?: string }[];
    phoneNumber1?: string | null;
    phoneNumber2?: string | null;
    smsOptIn?: boolean;
  }) => {
    if (!family) return;
    setIsSavingFamily(true);
    try {
      await api.updateFamily(family.id, data);
      await loadFamily();
      setIsEditModalOpen(false);
      alert('Family details updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update family details');
      throw error;
    } finally {
      setIsSavingFamily(false);
    }
  };

  const loadCurrentVisit = async () => {
    if (!family?.tour.id) return;
    try {
      const data = await api.getCurrentVisit(family.tour.id);
      setVisits(data.visits || []);
    } catch (error) {
      console.error('Failed to load visits:', error);
    }
  };

  const loadJoke = async () => {
    try {
      const joke = await api.getNextJoke();
      setCurrentJoke(joke);
    } catch (error) {
      console.error('Failed to load joke:', error);
    }
  };

  const calculateETA = (): { time: Date; visitsRemaining: number } | null => {
    if (!family || !activeVisits.length || !myVisit) return null;

    if (myVisit.status === 'COMPLETED' || myVisit.status === 'VISITING') {
      return null;
    }

    const myActiveIndex = activeVisits.findIndex((visit) => visit.id === myVisit.id);
    if (myActiveIndex === -1) return null;

    // If tour hasn't started, estimate based on queue position
    if (!family.tour.startedAt || family.tour.status !== 'ACTIVE') {
      const minutesUntilArrival = myActiveIndex * 5;
      const now = new Date();
      return {
        time: new Date(now.getTime() + minutesUntilArrival * 60 * 1000),
        visitsRemaining: myActiveIndex,
      };
    }

    const currentActiveIndex = activeVisits.findIndex(
      (visit) => visit.status === 'ON_WAY' || visit.status === 'VISITING',
    );
    const effectiveCurrentIndex = currentActiveIndex === -1 ? 0 : currentActiveIndex;

    const visitsRemaining = Math.max(0, myActiveIndex - effectiveCurrentIndex);
    const minutesUntilArrival = visitsRemaining * 5;
    const now = new Date();
    return {
      time: new Date(now.getTime() + minutesUntilArrival * 60 * 1000),
      visitsRemaining,
    };
  };

  const calculateScheduleStatus = (): { status: string; message: string } => {
    if (!family || !visits.length || !family.tour.startedAt) {
      return { status: 'on-time', message: "Santa's getting ready! 🎅" };
    }

    const tourStartedAt = new Date(family.tour.startedAt);
    const currentVisit = visits.find(v => v.status === 'ON_WAY' || v.status === 'VISITING');
    if (!currentVisit) {
      return { status: 'on-time', message: "Santa's getting ready! 🎅" };
    }

    const now = new Date();
    const elapsedMinutes = (now.getTime() - tourStartedAt.getTime()) / (1000 * 60);
    const expectedMinutes = currentVisit.order * 5;
    const difference = elapsedMinutes - expectedMinutes;

    if (Math.abs(difference) <= 2) {
      return { status: 'on-time', message: "Santa's right on schedule! 🎅" };
    }

    if (difference < -2) {
      return {
        status: 'ahead',
        message: `Santa's running ahead by ${Math.round(Math.abs(difference))} minutes! 🎉`,
      };
    }

    return {
      status: 'behind',
      message: `Santa's running a bit behind by ${Math.round(difference)} minutes... 🕐`,
    };
  };

  const getMyPosition = (): number | null => {
    if (!myVisit) return null;
    return activePositionMap.get(myVisit.id) ?? null;
  };

  const getCookiesCollected = (): number => {
    return visits.filter(v => v.status === 'COMPLETED').length;
  };

  const getTotalCookies = (): number => {
    return visits.length;
  };

  const handleSantaClick = () => {
    // Center map on Santa
    if (santaLocation) {
      // This will be handled by the map component
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green">
        <div className="text-white text-2xl">Loading... 🎅</div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green">
        <div className="card">
          <h1 className="text-2xl font-bold text-holiday-red">Family not found</h1>
        </div>
      </div>
    );
  }

  const eta = calculateETA();
  const scheduleStatus = calculateScheduleStatus();
  const myPosition = getMyPosition();
  const cookiesCollected = getCookiesCollected();
  const totalCookies = getTotalCookies();
  const shouldShowEta = Boolean(
    eta && myVisit && myVisit.status !== 'VISITING' && myVisit.status !== 'COMPLETED',
  );
  const scheduleMessage =
    myVisit?.status === 'VISITING'
      ? 'Santa is visiting your family right now! 🎅'
      : myVisit?.status === 'COMPLETED'
      ? 'Santa has already visited your home. Thanks for the cookies!'
      : scheduleStatus.message;

  // Families data for map with geocoded coordinates
  const familiesForMap = visits.map(v => ({
    id: v.family.id,
    streetNumber: v.family.streetNumber,
    streetName: v.family.streetName,
    familyName: v.family.familyName,
    visited: v.status === 'COMPLETED',
    latitude: v.family.latitude,
    longitude: v.family.longitude,
  }));

  const currentActiveIndex = activeVisits.findIndex(
    (visit) => visit.status === 'ON_WAY' || visit.status === 'VISITING',
  );

  const nextActiveIndex =
    currentActiveIndex >= 0
      ? activeVisits.findIndex(
          (visit, index) => index > currentActiveIndex && visit.status === 'PENDING',
        )
      : activeVisits.findIndex((visit) => visit.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">🎅</h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Santa Tracker</h2>
          <p className="text-white text-base sm:text-lg">{family.tour.name}</p>
        </div>

        {/* Mobile-first layout: Schedule/ETA at top, then map, then sidebar */}
        <div className="space-y-6">
          {/* Schedule & ETA - Always at top, especially for mobile */}
          <div className="card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-holiday-red">
                  The {family.familyName} Family
                </h3>
                {myPosition && (
                  <span className="text-sm font-semibold text-holiday-green bg-green-50 px-3 py-1 rounded-full inline-block mt-2 md:mt-1">
                    Position: #{myPosition}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-secondary text-sm self-start md:self-auto"
              >
                Edit Family Details
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              {family.streetNumber} {family.streetName}
            </p>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-holiday-red mb-2">Schedule & ETA</h3>
              <div
                className={`p-3 rounded-lg ${
                  scheduleStatus.status === 'ahead'
                    ? 'bg-green-100 border-2 border-green-400'
                    : scheduleStatus.status === 'behind'
                    ? 'bg-yellow-100 border-2 border-yellow-400'
                    : 'bg-blue-100 border-2 border-blue-400'
                }`}
              >
                <p className="font-semibold">{scheduleMessage}</p>
              </div>
              {shouldShowEta && eta && (
                <div className="mt-3">
                  <p className="text-lg font-semibold">
                    Estimated Arrival: {eta.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {eta.visitsRemaining > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {eta.visitsRemaining} {eta.visitsRemaining === 1 ? 'visit' : 'visits'} before you
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Map */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="card p-0 h-[400px] lg:h-[500px]">
                <SantaMap
                  santaLocation={santaLocation}
                  families={familiesForMap}
                  onSantaClick={handleSantaClick}
                />
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6 order-1 lg:order-2">
                {/* Cookie Tracker */}
              <div className="card">
                <h3 className="text-xl font-bold text-holiday-red mb-2">Cookie Tracker</h3>
                <div className="text-center">
                  <div className="text-4xl mb-2">🍪</div>
                  <p className="text-2xl font-bold">
                    {cookiesCollected} / {totalCookies}
                  </p>
                  <p className="text-gray-600">Cookies Collected</p>
                </div>
              </div>

              {/* Jokes & Riddles */}
              {currentJoke && (
                <div className="card">
                  <h3 className="text-xl font-bold text-holiday-red mb-2">
                    {currentJoke.type === 'joke' ? '🎄 Holiday Joke' : '❓ Holiday Riddle'}
                  </h3>
                  <p className="text-lg mb-3">{currentJoke.content}</p>
                  {currentJoke.answer && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-holiday-green font-semibold">
                        Show Answer
                      </summary>
                      <p className="mt-2 text-gray-700">{currentJoke.answer}</p>
                    </details>
                  )}
                </div>
              )}

              {/* Share */}
              <div className="card">
                <h3 className="text-xl font-bold text-holiday-red mb-2">Share</h3>
                <button
                  onClick={() => {
                    const link = window.location.href;
                    if (navigator.share) {
                      navigator.share({ title: 'Santa Tracker', url: link });
                    } else {
                      navigator.clipboard.writeText(link);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="btn-secondary w-full"
                >
                  Share This Page
                </button>
              </div>
            </div>
          </div>

          {/* Full-width Tour Roster */}
          {activeVisits.length > 0 && (
            <div className="card mt-6">
              <h3 className="text-xl sm:text-2xl font-bold text-holiday-red mb-4">
                Tour Roster ({activeVisits.length} {activeVisits.length === 1 ? 'family' : 'families'})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeVisits.map((visit, index) => {
                  const position = activePositionMap.get(visit.id);
                  const isCurrent = visit.status === 'ON_WAY' || visit.status === 'VISITING';
                  const isNext = nextActiveIndex === index && !isCurrent;
                  const isMyFamily = visit.family.id === family.id;

                  return (
                    <div
                      key={visit.id}
                      className={`p-4 border-2 rounded-lg ${
                        isCurrent
                          ? 'border-green-500 bg-green-50'
                          : isNext
                          ? 'border-yellow-400 bg-yellow-50'
                          : isMyFamily
                          ? 'border-holiday-red bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {position && (
                          <span className="text-xs bg-holiday-gold text-white px-2 py-1 rounded font-bold">
                            #{position}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            🎅 Visiting Now
                          </span>
                        )}
                        {isNext && (
                          <span className="text-xs bg-yellow-400 text-white px-2 py-1 rounded">
                            Next
                          </span>
                        )}
                        {isMyFamily && (
                          <span className="text-xs bg-holiday-red text-white px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-lg">The {visit.family.familyName} Family</p>
                      <p className="text-sm text-gray-600">
                        {visit.family.streetNumber} {visit.family.streetName}
                      </p>
                      {visit.family.children.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Kids: {visit.family.children.map((c) => c.firstName).join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {completedVisits.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xl font-bold text-gray-700 mb-3">
                    Completed Visits ({completedVisits.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50 opacity-80"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                            Completed
                          </span>
                          {visit.family.id === family.id && (
                            <span className="text-xs bg-holiday-red text-white px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-lg">The {visit.family.familyName} Family</p>
                        <p className="text-sm text-gray-600">
                          {visit.family.streetNumber} {visit.family.streetName}
                        </p>
                        {visit.family.children.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Kids: {visit.family.children.map((c) => c.firstName).join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FamilyEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveFamily}
        family={family}
        loading={isSavingFamily}
      />
    </div>
  );
}

