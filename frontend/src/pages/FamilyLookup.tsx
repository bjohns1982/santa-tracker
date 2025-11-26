import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function FamilyLookup() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!inviteCode) {
        setError('Invalid invite code');
        return;
      }

      const tour = await api.getTourByInviteCode(inviteCode);
      const family = tour.families.find(
        (f: any) => f.familyName.toLowerCase() === familyName.toLowerCase()
      );

      if (!family) {
        setError('Family not found. Please check your family name.');
        return;
      }

      navigate(`/family/${family.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to find family');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl mb-4">🎅</h1>
          <h2 className="text-3xl font-bold text-holiday-red mb-2">Find Your Family</h2>
          <p className="text-gray-600">Enter your family name to view Santa's progress</p>
        </div>

        <form onSubmit={handleLookup} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Family Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="input-field"
              placeholder="Enter your family name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Looking up...' : 'Find My Family'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have a family name?{' '}
          <a
            href={`/signup/${inviteCode}`}
            className="text-holiday-red font-semibold hover:underline"
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}

