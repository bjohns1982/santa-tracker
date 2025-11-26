import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Child {
  firstName: string;
  specialInstructions?: string;
}

export default function FamilySignUp() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<any>(null);
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [children, setChildren] = useState<Child[]>([{ firstName: '', specialInstructions: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inviteCode) {
      loadTour();
    }
  }, [inviteCode]);

  const [savedFamilyId, setSavedFamilyId] = useState<string | null>(null);
  const [hasValidSavedFamily, setHasValidSavedFamily] = useState(false);

  // Check if saved family ID is valid
  useEffect(() => {
    const savedId = localStorage.getItem('lastFamilyId');
    if (savedId) {
      // Verify the family still exists
      api.getFamily(savedId)
        .then(() => {
          setSavedFamilyId(savedId);
          setHasValidSavedFamily(true);
        })
        .catch(() => {
          // Family doesn't exist, clear it
          localStorage.removeItem('lastFamilyId');
          setHasValidSavedFamily(false);
        });
    }
  }, []);

  const loadTour = async () => {
    try {
      const data = await api.getTourByInviteCode(inviteCode!);
      setTour(data);
    } catch (error: any) {
      setError('Tour not found');
    }
  };

  const addChild = () => {
    setChildren([...children, { firstName: '', specialInstructions: '' }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof Child, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!streetNumber || !streetName || !familyName) {
      setError('Please fill in all required fields');
      return;
    }

    if (children.some(c => !c.firstName.trim())) {
      setError('Please provide first names for all children');
      return;
    }

    setLoading(true);
    try {
      const childrenData = children.map(c => ({
        firstName: c.firstName.trim(),
        specialInstructions: c.specialInstructions?.trim() || undefined,
      }));

      const familyData = await api.createFamily(inviteCode!, {
        streetNumber,
        streetName,
        familyName,
        children: childrenData,
      });

      // Redirect to family view
      navigate(`/family/${familyData.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (!tour && !error) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error && !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green">
        <div className="card max-w-md">
          <h1 className="text-2xl font-bold text-holiday-red mb-4">Tour Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green p-4">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-4">🎅</h1>
            <h2 className="text-3xl font-bold text-holiday-red mb-2">Sign Up for Santa's Visit!</h2>
            <p className="text-gray-600">Tour: {tour?.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Street Number *
                </label>
                <input
                  type="text"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Street Name *
                </label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Family Name *
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-gray-700 font-semibold">
                  Children *
                </label>
                <button
                  type="button"
                  onClick={addChild}
                  className="text-holiday-red font-semibold hover:underline"
                >
                  + Add Child
                </button>
              </div>

              <div className="space-y-4">
                {children.map((child, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={child.firstName}
                          onChange={(e) => updateChild(index, 'firstName', e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                      {children.length > 1 && (
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeChild(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Special Instructions for Santa
                      </label>
                      <input
                        type="text"
                        value={child.specialInstructions || ''}
                        onChange={(e) => updateChild(index, 'specialInstructions', e.target.value)}
                        className="input-field"
                        placeholder="Tommy is looking for a bike, Julie's been sad lately..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Help Santa personalize the visit! Share gift ideas, things to celebrate, or ways to encourage.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? 'Submitting...' : 'Sign Up for Santa\'s Visit! 🎅'}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {hasValidSavedFamily && savedFamilyId && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  You have a saved family view!
                </p>
                <a
                  href={`/family/${savedFamilyId}`}
                  className="btn-secondary text-sm w-full block text-center"
                >
                  Return to My View 🎅
                </a>
              </div>
            )}
            <p className="text-center text-gray-600 text-sm">
              Already signed up?{' '}
              <a
                href={`/lookup/${inviteCode}`}
                className="text-holiday-red font-semibold hover:underline"
              >
                Find your family view here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

